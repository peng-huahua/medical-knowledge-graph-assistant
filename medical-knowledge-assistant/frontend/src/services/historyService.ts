import { ChatHistory, Message, CHAT_HISTORY_KEY } from '../types/chat';

/**
 * 历史记录服务 - 管理聊天历史记录
 */
class HistoryService {
  
  /**
   * 获取所有聊天历史记录
   * @returns 聊天历史记录数组
   */
  getHistories(): ChatHistory[] {
    try {
      const histories = localStorage.getItem(CHAT_HISTORY_KEY);
      return histories ? JSON.parse(histories) : [];
    } catch (error) {
      console.error('获取聊天历史记录失败:', error);
      return [];
    }
  }
  
  /**
   * 获取指定ID的聊天历史记录
   * @param id 历史记录ID
   * @returns 聊天历史记录，不存在则返回null
   */
  getHistoryById(id: string): ChatHistory | null {
    try {
      const histories = this.getHistories();
      return histories.find(history => history.id === id) || null;
    } catch (error) {
      console.error('获取指定历史记录失败:', error);
      return null;
    }
  }
  
  /**
   * 保存聊天历史记录
   * @param history 聊天历史记录
   * @returns 成功返回true，失败返回false
   */
  saveHistory(history: ChatHistory): boolean {
    try {
      const histories = this.getHistories();
      const now = new Date().toISOString();
      
      // 检查是否已存在相同ID的历史记录
      const existingIndex = histories.findIndex(h => h.id === history.id);
      
      if (existingIndex >= 0) {
        // 更新已存在的历史记录
        histories[existingIndex] = {
          ...history,
          updatedAt: now,
          timestamp: now
        };
      } else {
        // 添加新的历史记录
        histories.push({
          ...history,
          createdAt: history.createdAt || now,
          updatedAt: now,
          timestamp: history.timestamp || now
        });
      }
      
      // 按更新时间倒序排序
      histories.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      // 保存到本地存储
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(histories));
      return true;
    } catch (error) {
      console.error('保存聊天历史记录失败:', error);
      return false;
    }
  }
  
  /**
   * 删除聊天历史记录
   * @param id 历史记录ID
   * @returns 成功返回true，失败返回false
   */
  deleteHistory(id: string): boolean {
    try {
      let histories = this.getHistories();
      histories = histories.filter(history => history.id !== id);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(histories));
      return true;
    } catch (error) {
      console.error('删除聊天历史记录失败:', error);
      return false;
    }
  }
  
  /**
   * 清空所有聊天历史记录
   * @returns 成功返回true，失败返回false
   */
  clearAllHistories(): boolean {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('清空聊天历史记录失败:', error);
      return false;
    }
  }
  
  /**
   * 根据当前消息生成历史记录标题
   * @param messages 消息数组
   * @returns 生成的标题
   */
  generateHistoryTitle(messages: Message[]): string {
    // 查找第一条用户消息作为标题
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    
    if (firstUserMessage) {
      // 取前15个字符作为标题，如果超过则截断并添加省略号
      const title = firstUserMessage.content.trim();
      return title.length > 15 ? `${title.substring(0, 15)}...` : title;
    }
    
    // 如果没有用户消息，则使用时间作为标题
    return `会话 ${new Date().toLocaleString()}`;
  }
  
  /**
   * 创建新的历史记录
   * @param messages 消息数组
   * @returns 创建的历史记录
   */
  createHistory(messages: Message[]): ChatHistory {
    const now = new Date().toISOString();
    return {
      id: `history_${Date.now()}`,
      title: this.generateHistoryTitle(messages),
      messages: [...messages],
      createdAt: now,
      updatedAt: now,
      timestamp: now
    };
  }
}

// 导出单例
export const historyService = new HistoryService();
export default historyService; 