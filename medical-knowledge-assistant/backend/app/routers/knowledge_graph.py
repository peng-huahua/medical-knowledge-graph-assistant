"""
知识图谱API接口
提供知识图谱查询和检索功能
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.utils.knowledge_graph import get_knowledge_graph, MedicalKnowledgeGraph

router = APIRouter(prefix="/knowledge_graph", tags=["knowledge_graph"])

# 请求模型
class EntitySearchRequest(BaseModel):
    entity: str
    max_distance: int = Field(2, ge=1, le=4)

class PathSearchRequest(BaseModel):
    source: str
    target: str
    max_length: int = Field(3, ge=1, le=4)

class QueryKnowledgeRequest(BaseModel):
    query: str
    max_results: int = Field(5, ge=1, le=20)

# 响应模型
class EntitySearchResponse(BaseModel):
    entity: str
    type: Optional[str] = None
    found: bool
    message: Optional[str] = None
    relations: Optional[Dict[str, List[Dict[str, Any]]]] = None

class PathSearchResponse(BaseModel):
    paths: List[Dict[str, Any]]
    count: int

class QueryKnowledgeResponse(BaseModel):
    query: str
    matched_entities: List[Dict[str, Any]]
    knowledge: List[Dict[str, Any]]

# 依赖注入
def get_kg():
    """获取知识图谱实例作为依赖"""
    return get_knowledge_graph()

@router.get("/entity_types", response_model=List[str])
def get_entity_types(kg: MedicalKnowledgeGraph = Depends(get_kg)):
    """获取所有实体类型"""
    return list(kg.entities.keys())

@router.get("/entities_by_type", response_model=List[str])
def get_entities_by_type(
    entity_type: str = Query(..., description="实体类型"),
    limit: int = Query(100, ge=1, le=1000, description="返回数量限制"),
    kg: MedicalKnowledgeGraph = Depends(get_kg)
):
    """按类型获取实体列表"""
    entities = kg.get_entity_by_type(entity_type, limit)
    if not entities:
        raise HTTPException(status_code=404, detail=f"找不到类型为 '{entity_type}' 的实体")
    return entities

@router.post("/search_entity", response_model=EntitySearchResponse)
def search_entity(
    request: EntitySearchRequest,
    kg: MedicalKnowledgeGraph = Depends(get_kg)
):
    """搜索与实体相关的知识"""
    result = kg.search_entity(request.entity, request.max_distance)
    return result

@router.post("/find_path", response_model=PathSearchResponse)
def find_path(
    request: PathSearchRequest,
    kg: MedicalKnowledgeGraph = Depends(get_kg)
):
    """查找两个实体之间的路径"""
    paths = kg.find_path(request.source, request.target, request.max_length)
    return {
        "paths": paths,
        "count": len(paths)
    }

@router.post("/query_knowledge", response_model=QueryKnowledgeResponse)
def query_knowledge(
    request: QueryKnowledgeRequest,
    kg: MedicalKnowledgeGraph = Depends(get_kg)
):
    """为用户查询提取相关知识"""
    knowledge = kg.get_knowledge_for_query(request.query, request.max_results)
    return knowledge

@router.get("/statistics")
def get_statistics(kg: MedicalKnowledgeGraph = Depends(get_kg)):
    """获取知识图谱统计信息"""
    return {
        "node_count": kg.graph.number_of_nodes(),
        "edge_count": kg.graph.number_of_edges(),
        "loaded_triples": kg.loaded_triples,
        "parsed_triples": kg.parsed_triples,
        "invalid_rows": kg.invalid_rows,
        "entity_type_count": len(kg.entities),
        "entity_types": list(kg.entities.keys())
    } 

@router.get('/entity/{entity}')
def entity_details(entity: str, kg: MedicalKnowledgeGraph = Depends(get_kg)):
    if entity not in kg.graph:
        return {'entity': None, 'relationships': [], 'is_mock_data': False}
    result = kg.search_entity(entity, 1)
    return {'entity': {'id': entity, 'name': entity, 'type': result['type'],
                       'properties': {}, 'sources': ['OpenCMKG 本地数据'], 'is_mock_data': False},
            'relationships': [
                {'id': f'{head}:{relation}:{tail}', 'type': relation,
                 'source': {'id': head, 'name': head},
                 'target': {'id': tail, 'name': tail, 'type': kg.graph.nodes[tail]['type']},
                 'properties': {}, 'sources': ['OpenCMKG 本地数据']}
                for head, tail, relation in list(kg.graph.out_edges(entity, keys=True)) + list(kg.graph.in_edges(entity, keys=True))
            ], 'is_mock_data': False}

@router.get('/visualization/{entity}')
def visualization(entity: str, depth: int = Query(2, ge=1, le=4), kg: MedicalKnowledgeGraph = Depends(get_kg)):
    return kg.visualization(entity, depth)

@router.get('/diseases')
def diseases(kg: MedicalKnowledgeGraph = Depends(get_kg)):
    return kg.get_entity_by_type('疾病', 1000)

@router.get('/symptoms')
def symptoms(kg: MedicalKnowledgeGraph = Depends(get_kg)):
    return kg.get_entity_by_type('症状', 1000)
