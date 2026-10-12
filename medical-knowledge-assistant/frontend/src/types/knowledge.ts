export interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  description?: string;
  sources: string[];
  is_mock_data?: boolean;
}

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  properties: Record<string, any>;
  confidence: number;
  sources: string[];
}

export interface KnowledgeGraph {
  entities: KnowledgeEntity[];
  relationships: Relationship[];
}

export interface VisNode {
  id: string;
  label: string;
  group: string;
  title: string;
  is_center?: boolean;
}

export interface VisEdge {
  from: string;
  to: string;
  id?: string;
  label: string;
  title: string;
  value: number;
}

export interface VisGraph {
  nodes: VisNode[];
  edges: VisEdge[];
}

export interface KnowledgeEntityDetails {
  entity?: KnowledgeEntity;
  relationships?: Array<{
    id: string;
    type: string;
    source: {
      id: string;
      name: string;
    };
    target: {
      id: string;
      name: string;
      type: string;
      description?: string;
    };
    properties?: Record<string, any>;
    confidence?: number;
  }>;
  is_mock_data?: boolean;
} 