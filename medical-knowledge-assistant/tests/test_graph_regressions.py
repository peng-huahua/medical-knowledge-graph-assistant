"""Regression cases for the actual data-loader failures and edge preservation."""
from pathlib import Path
import csv
import json
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
(ROOT / "artifacts/temp").mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / "backend"))
from app.utils.knowledge_graph import MedicalKnowledgeGraph


class GraphRegressionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=ROOT / 'artifacts/temp')
        self.folder = Path(self.temp.name)
        (self.folder / 'entities_dict.txt').write_text("{'disease': ['甲,乙', '丙', 'nan', nan]}", encoding='utf-8')
        with (self.folder / 'triples.txt').open('w', encoding='utf-8', newline='') as handle:
            csv.writer(handle).writerows([['甲,乙', '关系一', '丙'], ['甲,乙', '关系二', '丙'],
                                         ['甲,乙', '关系一', '丙'], ['', '关系一', '丙']])
        self.kg = MedicalKnowledgeGraph(self.folder)

    def tearDown(self):
        self.temp.cleanup()

    def test_nan_and_quoted_comma(self):
        self.assertIn('nan', self.kg.entity_types)
        self.assertNotIn(None, self.kg.entity_types)
        self.assertEqual(self.kg.parsed_triples, 4)
        self.assertEqual(self.kg.loaded_triples, 3)
        self.assertEqual(self.kg.invalid_rows, [4])
        self.assertEqual(self.kg.graph.number_of_edges(), 2)
        self.assertEqual(set(self.kg.search_entity('甲,乙', 1)['relations']), {'关系一', '关系二'})

    def test_paths_and_real_visualization_direction(self):
        paths = self.kg.find_path('甲,乙', '丙', 1)
        self.assertEqual({p['path'][0]['relation'] for p in paths}, {'关系一', '关系二'})
        self.assertEqual(self.kg.find_path('丙', '甲,乙'), [])
        graph = self.kg.visualization('丙', 1)
        self.assertTrue(all(edge['from'] == '甲,乙' and edge['to'] == '丙' for edge in graph['edges']))
        self.assertEqual(self.kg.get_entity_by_type('疾病'), ['甲,乙', '丙', 'nan'])
        self.assertFalse(self.kg.search_entity('不存在')['found'])

    def test_unsafe_identifiers_rejected(self):
        (self.folder / 'entities_dict.txt').write_text("{'disease': [unknown]}", encoding='utf-8')
        with self.assertRaises(ValueError):
            MedicalKnowledgeGraph(self.folder)


if __name__ == '__main__':
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(GraphRegressionTests))
    (ROOT / 'artifacts/graph-regression-results.json').write_text(json.dumps({'tests': result.testsRun, 'passed': result.wasSuccessful()}, indent=2), encoding='utf-8')
    sys.exit(not result.wasSuccessful())
