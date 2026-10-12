import axios from 'axios';

// 创建axios实例
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 在发送请求前做些什么
    return config;
  },
  error => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => {
    // 处理响应数据
    return response;
  },
  error => {
    // 处理响应错误
    return Promise.reject(error);
  }
);

// 导出合并了axios实例和API方法的对象
const api = {
  // 直接从axios实例继承方法
  get: axiosInstance.get.bind(axiosInstance),
  post: axiosInstance.post.bind(axiosInstance),
  put: axiosInstance.put.bind(axiosInstance),
  delete: axiosInstance.delete.bind(axiosInstance),
  
  // 聊天相关API
  chat: {
    // 发送聊天消息
    sendMessage: async (content: any, history: any[] = []) => {
      try {
        const response = await axiosInstance.post('/api/chat', {
          content,
          history
        });
        return response.data;
      } catch (error) {
        console.error('发送聊天消息出错:', error);
        throw error;
      }
    },
    
    // 流式聊天（使用SSE）
    sendMessageStream: (chatRequest: any, onChunk: any, onComplete: any, onError: any, startPosition = 0) => {
      let fullText = '';
      let abortController = new AbortController();
      let isCancelled = false;
      
      // 使用fetch API代替EventSource
      fetch(`${axiosInstance.defaults.baseURL}/api/chat/stream?start_position=${startPosition}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Content-Position': startPosition.toString()
        },
        body: JSON.stringify(chatRequest),
        signal: abortController.signal
      })
      .then(async response => {
        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const detail = typeof errorBody?.detail === 'string' ? errorBody.detail : null;
          throw new Error(detail || `请求失败（HTTP ${response.status}）`);
        }
        
        console.log("流式请求成功，开始读取...");
        
        // 获取响应的reader
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('无法获取响应流');
        }
        
        // 处理数据流
        const processStream = async () => {
          const decoder = new TextDecoder();
          let buffer = '';
          
          try {
            while (true) {
              // 已取消，中断读取
              if (isCancelled) {
                break;
              }
              
              const { done, value } = await reader.read();
              if (done) {
                console.log("读取完成");
                break;
              }
              
              // 解码二进制数据
              const chunk = decoder.decode(value, { stream: true });
              console.log("收到数据块:", chunk.length, "字节");
              buffer += chunk;
              
              // 处理完整的SSE消息
              const messages = buffer.split('\n\n');
              buffer = messages.pop() || ''; // 保留最后可能不完整的消息
              
              console.log("拆分成", messages.length, "条SSE消息");
              
              for (const message of messages) {
                if (!message.trim()) continue;
                
                // 解析SSE消息
                const lines = message.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6); // 去掉 'data: '
                    
                    if (data === '[DONE]') {
                      console.log("收到结束标记 [DONE]");
                      onComplete && onComplete(fullText);
                      return;
                    }
                    
                    try {
                      const parsedData = JSON.parse(data);
                      console.log("收到消息数据:", parsedData);
                      
                      // 如果是完成信号
                      if (parsedData.status === 'complete') {
                        console.log("收到完成信号");
                        continue;
                      }
                      
                      // 如果是错误信息
                      if (parsedData.error) {
                        console.error('流式聊天错误:', parsedData.error);
                        onError && onError(new Error(parsedData.error));
                        return;
                      }
                      
                      // 处理内容块
                      if (parsedData.content) {
                        fullText += parsedData.content;
                        console.log("处理内容块:", parsedData.content);
                        onChunk && onChunk(parsedData.content, parsedData.position);
                      }
                    } catch (e) {
                      console.error('解析服务器消息出错:', e, "原始数据:", data);
                      onError && onError(e);
                    }
                  }
                }
              }
            }
          } catch (error) {
            // 如果不是由取消导致的错误，才报告
            if (!isCancelled) {
              console.error('读取流出错:', error);
              onError && onError(error);
            }
          } finally {
            reader.releaseLock();
          }
        };
        
        // 开始处理流
        processStream().catch(error => {
          if (!isCancelled) {
            console.error('处理流出错:', error);
            onError && onError(error);
          }
        });
      })
      .catch(error => {
        // 如果不是由取消导致的错误，才报告
        if (!isCancelled) {
          console.error('发起流式请求出错:', error);
          onError && onError(error);
        }
      });
      
      // 返回一个方法，允许调用者关闭连接
      return {
        cancel: () => {
          isCancelled = true;
          abortController.abort();
        }
      };
    }
  },
  
  // 知识图谱相关API
  knowledge: {
    // 获取实体关系
    getEntityRelationships: async (entity: string) => {
      try {
        const response = await axiosInstance.get(`/api/knowledge_graph/entity/${encodeURIComponent(entity)}`);
        return response.data;
      } catch (error) {
        console.error('获取实体关系出错:', error);
        throw error;
      }
    },
    
    // 获取可视化数据
    getVisualizationData: async (entityId: string, depth: number) => {
      try {
        const response = await axiosInstance.get(`/api/knowledge_graph/visualization/${encodeURIComponent(entityId)}`, {
          params: { depth }
        });
        return response.data;
      } catch (error) {
        console.error('获取可视化数据出错:', error);
        throw error;
      }
    },
    
    // 获取疾病列表
    getDiseases: async () => {
      try {
        const response = await axiosInstance.get('/api/knowledge_graph/diseases');
        return response.data;
      } catch (error) {
        console.error('获取疾病列表出错:', error);
        throw error;
      }
    },
    
    // 获取症状列表
    getSymptoms: async () => {
      try {
        const response = await axiosInstance.get('/api/knowledge_graph/symptoms');
        return response.data;
      } catch (error) {
        console.error('获取症状列表出错:', error);
        throw error;
      }
    }
  },
  
  // 诊疗指导相关API
  guidance: {
    // 获取诊疗指导
    getGuidance: async (params: any) => {
      try {
        const response = await axiosInstance.post('/api/guidance', params);
        return response.data;
      } catch (error) {
        console.error('获取诊疗指导出错:', error);
        throw error;
      }
    }
  },
  
  // 健康检查
  healthCheck: async () => {
    try {
      const response = await axiosInstance.get('/health');
      return response.data;
    } catch (error) {
      console.error('健康检查出错:', error);
      throw error;
    }
  }
};

export default api; 
