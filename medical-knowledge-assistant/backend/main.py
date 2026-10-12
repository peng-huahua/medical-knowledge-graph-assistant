from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn
import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 导入自定义模块
from app.config import settings
from app.models.chat import ChatMessage, ChatResponse
from app.services.llm_service import LLMService
from app.routers.knowledge_graph import router as knowledge_graph_router

# 创建FastAPI应用实例
app = FastAPI(
    title="AI医疗智能问答系统",
    description="基于大模型的医疗问答系统，支持多轮对话",
    version="1.0.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(knowledge_graph_router, prefix="/api")

# 初始化服务
llm_service = LLMService()

# 根路由
@app.get("/")
async def root():
    return {"message": "欢迎使用AI医疗智能问答系统API"}

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 医疗问答接口
@app.post("/api/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    try:
        # 根据消息内容和历史记录生成回复
        response = await llm_service.generate_response(
            message.content,
            message.history,
            use_kg=message.use_kg
        )
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 流式医疗问答接口
@app.post("/api/chat/stream")
async def chat_stream(message: ChatMessage, start_position: int = 0):
    start_time = datetime.now()
    logger.info(f"收到流式聊天请求: {message.content[:50]}...")
    logger.info(f"请求起始位置: {start_position}")
    
    # 检查请求头中是否有内容位置标记
    content_position = start_position
    
    try:
        # 使用流式响应
        logger.info("生成AI回复中(流式)...")
        stream_response = await llm_service.generate_response(
            message.content,
            message.history,
            use_kg=message.use_kg,
            stream=True
        )
        
        logger.info("成功获取流式响应对象，开始生成事件流")
        
        # 返回流式响应
        async def event_generator():
            response_start_time = datetime.now()
            total_chunks = 0
            total_chars = 0
            full_content = ""
            
            try:
                async for chunk in llm_service.process_stream_response(stream_response, message.history, message.content):
                    if chunk:
                        # 添加到完整内容
                        full_content += chunk
                        total_chars = len(full_content)
                        
                        # 如果请求指定了起始位置，跳过已发送的内容
                        if content_position > 0 and total_chars <= content_position:
                            continue
                        
                        total_chunks += 1
                        yield f"data: {json.dumps({'content': chunk, 'position': total_chars})}\n\n"
                        
                        # 定期记录进度
                        if total_chunks % 10 == 0:
                            elapsed = (datetime.now() - response_start_time).total_seconds()
                            logger.info(f"已发送 {total_chunks} 个块，共 {total_chars} 字符，耗时 {elapsed:.2f}秒")
                    
                # 添加完整内容的长度信息，帮助前端验证
                yield f"data: {json.dumps({'total_length': total_chars, 'status': 'complete'})}\n\n"
                
                # 输出汇总信息
                elapsed = (datetime.now() - response_start_time).total_seconds()
                logger.info(f"流式响应完成: 共 {total_chunks} 个块，{total_chars} 字符，耗时 {elapsed:.2f}秒")
                yield f"data: [DONE]\n\n"
            except Exception as e:
                error_msg = f"生成事件流时出错: {str(e)}"
                logger.error(error_msg, exc_info=True)
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield f"data: [DONE]\n\n"
            
        # 记录总处理时间
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"流式聊天请求初始化完成，耗时: {elapsed:.2f}秒")
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Content-Position",
                "X-Accel-Buffering": "no"  # 禁用 Nginx 的响应缓冲，确保数据立即发送
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"流式聊天API错误: {str(e)}"
        logger.error(error_msg, exc_info=True)
        # 记录处理总时间
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.error(f"流式聊天请求失败，耗时: {elapsed:.2f}秒")
        raise HTTPException(status_code=500, detail=str(e))

# 主函数
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 