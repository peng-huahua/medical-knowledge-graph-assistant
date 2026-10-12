from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from enum import Enum
from datetime import datetime


class MessageRole(str, Enum):
    """消息角色枚举"""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    

class MessageType(str, Enum):
    """消息类型枚举"""
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    AUDIO = "audio"


class Message(BaseModel):
    """基本消息模型"""
    role: MessageRole
    content: str
    type: MessageType = MessageType.TEXT
    timestamp: datetime = Field(default_factory=datetime.now)
    

class ChatMessage(BaseModel):
    """聊天消息请求模型"""
    content: str
    history: List[Dict[str, str]] = []
    use_kg: bool = True
    user_info: Optional[Dict[str, Any]] = None
    

class ChatResponse(BaseModel):
    """聊天响应模型"""
    content: str
    history: List[Dict[str, str]] = []
    sources: List[str] = []
    suggestions: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.now) 