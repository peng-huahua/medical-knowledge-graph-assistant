export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  KNOWLEDGE_GRAPH = 'knowledge_graph'
}

export interface Message {
  role: MessageRole;
  content: string;
  type: MessageType;
  timestamp: string | Date;
  knowledge_graph_data?: any;
  error?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
  isLoading?: boolean;
}

export interface ChatMessage {
  content: string;
  history?: Message[];
  use_knowledge_graph?: boolean;
  user_info?: Record<string, any>;
  role?: string;
  timestamp?: string;
  error?: boolean;
  knowledge_graph_data?: KnowledgeInfo;
}

export interface KnowledgeInfo {
  entities: any[];
  relationships: any[];
  sources: string[];
}

export interface ChatResponse {
  content: string;
  knowledge_graph_data?: KnowledgeInfo;
  sources?: string[];
  suggestions?: string[];
  timestamp?: string;
  history: Message[];
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  suggestions: string[];
}

export interface ChatProps {
  initialMessage?: string;
  useKnowledgeGraph?: boolean;
}

export type BubbleStyleType = {
  [key: string]: any;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  timestamp: string;
}

export const CHAT_HISTORY_KEY = 'medical_ai_chat_history'; 