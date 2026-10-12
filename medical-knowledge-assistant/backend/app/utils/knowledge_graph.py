"""Load OpenCMKG safely and query its actual directed, labelled relationships."""
import ast
import csv
from collections import deque
from itertools import islice, product
from pathlib import Path
from threading import Lock
import networkx as nx


class _MissingValue(ast.NodeTransformer):
    def visit_Name(self, node):
        if node.id == 'nan':
            return ast.copy_location(ast.Constant(value=None), node)
        raise ValueError(f'Unsupported identifier in entity data: {node.id}')


class MedicalKnowledgeGraph:
    def __init__(self, kg_data_path=None):
        self.kg_data_path = Path(kg_data_path) if kg_data_path else Path(__file__).resolve().parents[2] / 'data/knowledge_graph/OpenCMKG'
        tree = _MissingValue().visit(ast.parse((self.kg_data_path / 'entities_dict.txt').read_text(encoding='utf-8'), mode='eval'))
        raw = ast.literal_eval(tree)
        self.entities = {kind: list(dict.fromkeys(e for e in items if isinstance(e, str) and e.strip())) for kind, items in raw.items()}
        self.entity_types = {entity: kind for kind, items in self.entities.items() for entity in items}
        self.graph = nx.MultiDiGraph()
        self.loaded_triples = 0
        self.parsed_triples = 0
        self.invalid_rows = []
        with (self.kg_data_path / 'triples.txt').open(encoding='utf-8', newline='') as handle:
            for row_number, row in enumerate(csv.reader(handle), 1):
                self.parsed_triples += 1
                if len(row) != 3 or any(not item.strip() for item in row):
                    self.invalid_rows.append(row_number)
                    continue
                head, relation, tail = row
                self.graph.add_node(head, type=self.entity_types.get(head, 'unknown'))
                self.graph.add_node(tail, type=self.entity_types.get(tail, 'unknown'))
                # Preserve different relations between the same pair; deduplicate exact triples.
                self.graph.add_edge(head, tail, key=relation, relation=relation)
                self.loaded_triples += 1

    def _neighborhood(self, entity, depth, max_nodes=300):
        seen = {entity}
        queue = deque([(entity, 0)])
        edges = {}
        while queue:
            node, distance = queue.popleft()
            if distance >= depth:
                continue
            incident = list(self.graph.out_edges(node, keys=True)) + list(self.graph.in_edges(node, keys=True))
            for head, tail, relation in incident:
                neighbor = tail if head == node else head
                if neighbor not in seen:
                    if len(seen) >= max_nodes:
                        continue
                    seen.add(neighbor)
                    queue.append((neighbor, distance + 1))
                edges[(head, tail, relation)] = distance + 1
        return seen, edges

    def search_entity(self, entity_name, max_distance=2):
        if entity_name not in self.graph:
            return {'entity': entity_name, 'found': False, 'message': '实体不存在'}
        _, edges = self._neighborhood(entity_name, max_distance)
        relations = {}
        for (head, tail, relation), distance in edges.items():
            reverse = tail == entity_name
            neighbor = head if reverse else tail
            relations.setdefault('反向_' + relation if reverse else relation, []).append({
                'entity': neighbor, 'type': self.graph.nodes[neighbor]['type'], 'distance': distance,
                'source': head, 'target': tail,
            })
        return {'entity': entity_name, 'type': self.graph.nodes[entity_name]['type'], 'found': True, 'relations': relations}

    def visualization(self, entity, depth=2):
        if entity not in self.graph:
            return {'nodes': [], 'edges': []}
        nodes, edges = self._neighborhood(entity, depth)
        return {
            'nodes': [{'id': n, 'label': n, 'group': self.graph.nodes[n]['type'], 'title': n, 'is_center': n == entity} for n in sorted(nodes)],
            'edges': [{'from': h, 'to': t, 'label': r, 'title': r, 'value': 1, 'arrows': 'to'} for h, t, r in edges],
            'truncated': len(nodes) >= 300,
        }

    def find_path(self, source, target, max_length=3):
        if source not in self.graph or target not in self.graph:
            return []
        directed = nx.DiGraph(self.graph)
        if not nx.has_path(directed, source, target):
            return []
        results = []
        # Bound combinatorial path expansion on the large medical graph.
        for path in islice(nx.shortest_simple_paths(directed, source, target), 100):
            if len(path) - 1 > max_length:
                break
            alternatives = [self.graph[h][t] for h, t in zip(path, path[1:])]
            for labels in product(*alternatives):
                steps = [{'source': h, 'source_type': self.graph.nodes[h]['type'], 'relation': r,
                          'target': t, 'target_type': self.graph.nodes[t]['type']}
                         for h, t, r in zip(path, path[1:], labels)]
                results.append({'path': steps, 'length': len(steps)})
                if len(results) >= 100:
                    return results
        return results

    def get_entity_by_type(self, entity_type, limit=100):
        entity_type = {'疾病': 'disease', '药物': 'drug', '食物': 'food', '科室': 'department',
                       '生产商': 'producer', '症状': 'symptom', '治疗方式': 'treatment'}.get(entity_type, entity_type)
        return self.entities.get(entity_type, [])[:limit]

    def get_knowledge_for_query(self, query, max_results=5):
        matches = [{'entity': e, 'type': kind, 'position': query.index(e)}
                   for e, kind in self.entity_types.items() if len(e) >= 2 and e in query]
        matches.sort(key=lambda item: (item['position'], -len(item['entity'])))
        matches = matches[:max_results]
        return {'query': query, 'matched_entities': matches,
                'knowledge': [self.search_entity(item['entity'], 1) for item in matches if item['entity'] in self.graph]}


_kg_instance = None
_lock = Lock()


def get_knowledge_graph():
    global _kg_instance
    with _lock:
        if _kg_instance is None:
            _kg_instance = MedicalKnowledgeGraph()
    return _kg_instance
