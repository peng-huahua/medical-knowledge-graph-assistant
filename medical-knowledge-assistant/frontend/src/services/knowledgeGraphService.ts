import api from './api';

export interface EntityType {
  entity: string;
  type: string;
  found: boolean;
  message?: string;
  relations?: Record<string, Array<{
    entity: string;
    type: string;
    distance: number;
  }>>;
}

export interface PathInfo {
  source: string;
  source_type: string;
  relation: string;
  target: string;
  target_type: string;
}

export interface PathResult {
  path: PathInfo[];
  length: number;
}

export interface PathSearchResult {
  paths: PathResult[];
  count: number;
}

export interface KnowledgeQueryResult {
  query: string;
  matched_entities: Array<{
    entity: string;
    type: string;
    position: number;
  }>;
  knowledge: EntityType[];
}

export interface GraphStatistics {
  node_count: number;
  edge_count: number;
  entity_type_count: number;
  entity_types: string[];
}

export interface GraphVisualizationData {
  nodes: Array<{
    id: string;
    label: string;
    title: string;
    group: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;
    arrows?: string;
  }>;
}

/** 知识图谱服务：接口失败交由页面显示错误，不返回模拟结果。 */
export const knowledgeGraphService = {
  async getEntityTypes(): Promise<string[]> {
    return (await api.get('/api/knowledge_graph/entity_types')).data;
  },
  async getEntitiesByType(entityType: string, limit = 100): Promise<string[]> {
    return (await api.get('/api/knowledge_graph/entities_by_type', {params: {entity_type: entityType, limit}})).data;
  },
  async searchEntity(entity: string, maxDistance = 1): Promise<EntityType> {
    return (await api.post('/api/knowledge_graph/search_entity', {entity, max_distance: maxDistance})).data;
  },
  async findPath(source: string, target: string, maxLength = 3): Promise<PathSearchResult> {
    return (await api.post('/api/knowledge_graph/find_path', {source, target, max_length: maxLength})).data;
  },
  async queryKnowledge(query: string, maxResults = 5): Promise<KnowledgeQueryResult> {
    return (await api.post('/api/knowledge_graph/query_knowledge', {query, max_results: maxResults})).data;
  },
  async getStatistics(): Promise<GraphStatistics> {
    return (await api.get('/api/knowledge_graph/statistics')).data;
  },
  transformEntityToVisualizationData(entityResult: EntityType): GraphVisualizationData {
    if (!entityResult.found || !entityResult.relations) {
      return { nodes: [], edges: [] };
    }

    const nodes: GraphVisualizationData['nodes'] = [
      {
        id: entityResult.entity,
        label: entityResult.entity,
        title: `${entityResult.entity} (${entityResult.type})`,
        group: entityResult.type
      }
    ];

    const edges: GraphVisualizationData['edges'] = [];
    const addedNodes = new Set<string>([entityResult.entity]);

    // 处理所有关系
    Object.entries(entityResult.relations).forEach(([relation, targets]) => {
      const isReverse = relation.startsWith('反向_');
      
      targets.forEach(target => {
        // 添加目标节点
        if (!addedNodes.has(target.entity)) {
          nodes.push({
            id: target.entity,
            label: target.entity,
            title: `${target.entity} (${target.type})`,
            group: target.type
          });
          addedNodes.add(target.entity);
        }

        // 添加边
        if (isReverse) {
          // 反向关系: target -> entity
          edges.push({
            from: target.entity,
            to: entityResult.entity,
            label: relation.replace('反向_', ''),
            arrows: 'to'
          });
        } else {
          // 正向关系: entity -> target
          edges.push({
            from: entityResult.entity,
            to: target.entity,
            label: relation,
            arrows: 'to'
          });
        }
      });
    });

    return { nodes, edges };
  },

  /**
   * 转换路径结果为可视化数据
   */
  transformPathToVisualizationData(pathResult: PathSearchResult): GraphVisualizationData {
    if (pathResult.count === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: GraphVisualizationData['nodes'] = [];
    const edges: GraphVisualizationData['edges'] = [];
    const addedNodes = new Set<string>();

    // 处理所有路径
    pathResult.paths.forEach(pathInfo => {
      pathInfo.path.forEach(step => {
        // 添加源节点
        if (!addedNodes.has(step.source)) {
          nodes.push({
            id: step.source,
            label: step.source,
            title: `${step.source} (${step.source_type})`,
            group: step.source_type
          });
          addedNodes.add(step.source);
        }

        // 添加目标节点
        if (!addedNodes.has(step.target)) {
          nodes.push({
            id: step.target,
            label: step.target,
            title: `${step.target} (${step.target_type})`,
            group: step.target_type
          });
          addedNodes.add(step.target);
        }

        // 添加边
        edges.push({
          from: step.source,
          to: step.target,
          label: step.relation,
          arrows: 'to'
        });
      });
    });

    return { nodes, edges };
  }
}; 