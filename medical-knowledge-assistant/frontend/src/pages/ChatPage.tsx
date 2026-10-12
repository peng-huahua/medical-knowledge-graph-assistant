import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  Avatar,
  useTheme,
  alpha,
  List,
  ListItemButton,
  Slider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FaceIcon from '@mui/icons-material/Face';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import DeleteIcon from '@mui/icons-material/Delete';
import SchemaIcon from '@mui/icons-material/Schema';
import StopIcon from '@mui/icons-material/Stop';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, MessageType, BubbleStyleType, ChatHistory, CHAT_HISTORY_KEY } from '../types/chat';
import api from '../services/api';
import historyService from '../services/historyService';
import HistoryDrawer from '../components/HistoryDrawer';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// 更现代化的气泡样式
const BubbleStyle: BubbleStyleType = {
  [MessageRole.USER]: {
    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
    backgroundImage: (theme: any) => `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.04)})`,
    borderRadius: '18px 18px 4px 18px',
    padding: '14px 18px',
    marginBottom: '12px',
    maxWidth: '85%',
    minWidth: '60px',
    alignSelf: 'flex-end',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
    position: 'relative',
    border: (theme: any) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    willChange: 'transform, opacity',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: '-8px',
      width: '12px',
      height: '14px',
      backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
      backgroundImage: (theme: any) => `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.04)})`,
      borderBottomLeftRadius: '50%',
      border: (theme: any) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      borderTop: 'none',
      borderRight: 'none',
    }
  },
  [MessageRole.ASSISTANT]: {
    backgroundColor: (theme: any) => alpha(theme.palette.secondary.main, 0.04),
    backgroundImage: (theme: any) => `linear-gradient(145deg, ${alpha(theme.palette.secondary.light, 0.08)}, ${alpha(theme.palette.secondary.main, 0.04)})`,
    borderRadius: '18px 18px 18px 4px',
    padding: '14px 18px',
    marginBottom: '12px',
    maxWidth: '85%',
    minWidth: '60px',
    minHeight: '36px',
    alignSelf: 'flex-start',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
    position: 'relative',
    border: (theme: any) => `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    willChange: 'transform, opacity',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '-8px',
      width: '12px',
      height: '14px',
      backgroundColor: (theme: any) => alpha(theme.palette.secondary.main, 0.04),
      backgroundImage: (theme: any) => `linear-gradient(145deg, ${alpha(theme.palette.secondary.light, 0.08)}, ${alpha(theme.palette.secondary.main, 0.04)})`,
      borderBottomRightRadius: '50%',
      border: (theme: any) => `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
      borderTop: 'none',
      borderLeft: 'none',
    }
  }
};

// 自定义CSS样式，用于打字机效果
const typingStyles = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  
  .cursor-blink {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: #666;
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: blink 1s infinite;
  }
  
  .typing-container {
    min-height: 20px;
    position: relative;
    width: 100%;
    overflow: hidden;
    transform: translateZ(0);
    will-change: contents;
    transition: all 0.1s ease;
    line-height: 1.6;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateY(5px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .typing-char {
    display: inline-block;
    opacity: 0;
    animation: fadeIn 10ms ease-out forwards;
    animation-fill-mode: both;
    will-change: opacity;
  }
  
  .chat-container {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  
  .chat-container::-webkit-scrollbar {
    width: 6px;
  }
  
  .chat-container::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .chat-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .chat-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  .message-appear {
    animation: slideIn 0.3s ease-out forwards;
  }
`;

// ChatContext，用于在组件之间共享聊天相关的状态
const ChatContext = createContext<{
  typingSpeed: number;
  setTypingSpeed: (speed: number) => void;
}>({
  typingSpeed: 2,
  setTypingSpeed: () => {},
});

// 用于打字机效果的组件
const TypewriterText = ({ text, speed = 1 }: { text: string, speed?: number }) => {
  const { typingSpeed } = useContext(ChatContext);
  const effectiveSpeed = speed * typingSpeed; // 将组件传入的速度与全局设置结合
  
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  // 当文本变化时重置
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
  }, [text]);
  
  // 流式显示文本
  useEffect(() => {
    if (displayedText.length >= text.length) {
      setIsComplete(true);
      return;
    }
    
    // 大幅提高处理速度，特别是长文本
    const batchSize = Math.max(5, Math.floor(text.length / 50)); // 批量处理更多字符
    const charDelay = Math.max(1, Math.min(5, 200 / (text.length * effectiveSpeed))); // 降低延迟
    
    const timer = setTimeout(() => {
      // 批量添加多个字符，而不是一次只添加一个
      const nextIndex = Math.min(displayedText.length + batchSize, text.length);
      const nextChars = text.substring(displayedText.length, nextIndex);
      setDisplayedText(prev => prev + nextChars);
    }, charDelay);
    
    return () => clearTimeout(timer);
  }, [displayedText, text, effectiveSpeed]);

  // 如果打字效果完成，直接使用ReactMarkdown渲染
  if (isComplete) {
    return <ReactMarkdown>{text}</ReactMarkdown>;
  }

  return (
    <>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      <span className="cursor-blink"></span>
    </>
  );
};

// 常见医疗问题分类
const MEDICAL_CATEGORIES = [
  {
    category: "常见疾病",
    questions: [
      "感冒和流感有什么区别？",
      "高血压患者的饮食注意事项有哪些？",
      "糖尿病的早期症状和自我管理方法？",
      "过敏性鼻炎怎样缓解症状？"
    ]
  },
  {
    category: "健康咨询",
    questions: [
      "如何预防心脑血管疾病？",
      "每天应该保持多少运动量才健康？",
      "长期失眠对身体有什么危害？",
      "中老年人体检应该关注哪些指标？"
    ]
  },
  {
    category: "用药指导",
    questions: [
      "服用药物时饮食有哪些禁忌？",
      "抗生素的正确使用方法是什么？",
      "降压药需要终身服用吗？",
      "常见药物相互作用有哪些？"
    ]
  }
];

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: MessageRole.ASSISTANT,
      content: '您好！我是您的医疗AI助手。我可以回答医疗相关问题，提供健康建议，并协助您了解各种疾病和症状。请问有什么我可以帮您的吗？',
      timestamp: new Date().toISOString(),
      type: MessageType.TEXT
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [streamController, setStreamController] = useState<any>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openTutorial, setOpenTutorial] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(5); // 打字速度提高到5
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [useKnowledgeGraph, setUseKnowledgeGraph] = useState(true);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 监听滚动事件，判断是否需要禁用自动滚动
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 判断是否滚动到底部附近
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setAutoScrollEnabled(isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 在流式响应更新时，如果用户处于底部，才自动滚动
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.isStreaming && autoScrollEnabled && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, autoScrollEnabled]);
  
  // 初始加载时获取历史记录数量
  useEffect(() => {
    historyService.getHistories();
  }, []);

  // 打开历史记录抽屉
  const handleOpenHistoryDrawer = () => {
    setHistoryDrawerOpen(true);
  };

  // 关闭历史记录抽屉
  const handleCloseHistoryDrawer = () => {
    setHistoryDrawerOpen(false);
  };

  // 加载历史记录
  const handleSelectHistory = (history: any) => {
    // 设置消息
    setMessages(history.messages);
    // 记录当前历史ID
    setCurrentHistoryId(history.id);
  };

  // 保存当前会话
  const saveCurrentChat = () => {
    // 如果没有消息，不保存
    if (messages.length <= 1) {
      return;
    }
    
    // 创建新的历史记录或更新现有的
    if (currentHistoryId) {
      // 更新已存在的历史记录
      const existingHistory = historyService.getHistoryById(currentHistoryId);
      if (existingHistory) {
        historyService.saveHistory({
          ...existingHistory,
          messages: [...messages],
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      // 创建新的历史记录
      const newHistory = historyService.createHistory(messages);
      historyService.saveHistory(newHistory);
      setCurrentHistoryId(newHistory.id);
    }
  };

  // 滚动到最新消息
  useEffect(() => {
    if (chatEndRef.current) {
      // 只在用户发送消息或者AI完成回复时才自动滚动，流式响应过程中不会自动滚动
      const lastMessage = messages[messages.length - 1];
      const shouldScroll = 
        lastMessage?.role === MessageRole.USER || 
        (lastMessage?.role === MessageRole.ASSISTANT && !lastMessage.isStreaming);
      
      if (shouldScroll) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || loading) {
      return;
    }
    
    console.log("准备发送消息:", currentMessage);
    console.log("当前消息列表长度:", messages.length);
    
    // 创建用户消息对象
    const userMessage: Message = {
      role: MessageRole.USER,
      content: currentMessage,
      type: MessageType.TEXT,
      timestamp: new Date().toISOString(),
    };
    
    // 添加用户消息
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    
    // 自动滚动到底部
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    // 添加AI思考中的消息
    const thinkingMessage: Message = {
      role: MessageRole.ASSISTANT,
      content: '',
      type: MessageType.TEXT,
      timestamp: new Date().toISOString(),
      isLoading: true,
      isStreaming: true
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    setLoading(true);
    setIsError(false);
    
    try {
      console.log("开始请求AI回复...");
      // 开始生成回复
      const typingStartTime = Date.now();
      
      // 格式化历史消息
      const chatHistory = messages
        .filter(msg => !msg.isLoading) // 过滤掉加载中的消息
        .filter(msg => !msg.isStreaming) // 过滤掉流式消息
        .filter(msg => msg.type === MessageType.TEXT) // 只保留文本消息
        .map(msg => ({
          role: msg.role === MessageRole.USER ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // 调试日志
      console.log("发送完整历史消息数量:", chatHistory.length);
      console.log("消息角色顺序:", chatHistory.map(msg => msg.role).join(" -> "));
      
      // 创建请求对象
      const chatRequest = {
        content: currentMessage,
        history: chatHistory
      };

      // 使用流式API
      const controller = api.chat.sendMessageStream(
        chatRequest,
        (chunk: string, position: number) => {
          // 收到新块
          console.log("收到消息块:", chunk);
          setMessages(prev => {
            const newMessages = [...prev];
            const assistantMessageIndex = newMessages.findIndex(
              msg => msg.role === MessageRole.ASSISTANT && (msg.isLoading || msg.isStreaming)
            );
            
            if (assistantMessageIndex !== -1) {
              // 更新助手消息的内容
              newMessages[assistantMessageIndex] = {
                ...newMessages[assistantMessageIndex],
                content: position ? newMessages[assistantMessageIndex].content + chunk : chunk,
                isLoading: false,
                isStreaming: true
              };
            }
            
            return newMessages;
          });
          
          // 自动滚动到底部
          if (chatEndRef.current && autoScrollEnabled) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        },
        (fullText: string) => {
          // 流式传输完成
          console.log("流式传输完成:", fullText.length, "个字符");
          setLoading(false);
          setStreamController(null);
          
          // 更新最后一条消息，设置isStreaming为false并确保消息格式正确
          setMessages(prev => {
            const newMessages = [...prev];
            const assistantMessageIndex = newMessages.findIndex(
              msg => msg.role === MessageRole.ASSISTANT && msg.isStreaming
            );
            
            if (assistantMessageIndex !== -1) {
              newMessages[assistantMessageIndex] = {
                ...newMessages[assistantMessageIndex],
                isStreaming: false,
                content: fullText, // 确保内容完整
                timestamp: new Date().toISOString() // 更新时间戳
              };
              
              console.log("完成的消息已更新:", 
                `角色=${newMessages[assistantMessageIndex].role}, ` +
                `内容长度=${newMessages[assistantMessageIndex].content.length}`);
            }
            
            return newMessages;
          });
          
          // 记录总耗时
          const totalTime = Date.now() - typingStartTime;
          console.log(`总共生成 ${fullText.length} 个字符，耗时 ${totalTime}ms`);
          
          // 保存会话到本地存储
          setTimeout(() => {
            saveCurrentChat();
            console.log("对话已保存到本地，当前消息数:", messages.length);
          }, 100);
        },
        (error: any) => {
          // 错误处理
          console.error('生成回复时出错:', error);
          setIsError(true);
          setLoading(false);
          setStreamController(null);
          
          // 显示错误消息
          setMessages(prev => {
            const newMessages = [...prev];
            const loadingMsgIndex = newMessages.findIndex(msg => msg.isLoading);
            
            if (loadingMsgIndex !== -1) {
              newMessages[loadingMsgIndex] = {
                ...newMessages[loadingMsgIndex],
                content: `生成回复时出错: ${error.message || '未知错误'}`,
                error: true,
                isLoading: false
              };
            }
            
            return newMessages;
          });
        }
      );

      setStreamController(controller);
    } catch (error: any) {
      console.error('聊天请求出错:', error);
      setIsError(true);
      setLoading(false);
      setStreamController(null);
      
      // 更新错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingMsgIndex = newMessages.findIndex(msg => msg.isLoading);
        
        if (loadingMsgIndex !== -1) {
          newMessages[loadingMsgIndex] = {
            ...newMessages[loadingMsgIndex],
            content: `生成回复时出错: ${error.message || '未知错误'}`,
            error: true,
            isLoading: false
          };
        }
        
        return newMessages;
      });
    }
  };

  const clearChat = () => {
    if (streamController) {
      streamController.cancel();
      setStreamController(null);
    }
    
    setMessages([
      {
        role: MessageRole.ASSISTANT,
        content: '聊天已清除。您可以继续向我咨询医疗健康问题，或从下方常见医疗问题分类中选择。',
        timestamp: new Date().toISOString(),
        type: MessageType.TEXT
      }
    ]);
    setSelectedCategory(null);
    // 重置当前历史ID
    setCurrentHistoryId(null);
  };
  
  // 取消生成
  const stopGeneration = () => {
    if (streamController) {
      streamController.cancel();
      setStreamController(null);
      setLoading(false);
    }
  };

  // 选择预设问题
  const handleSelectPresetQuestion = (question: string) => {
    setCurrentMessage(question);
    
    // 创建一个新的提交事件并调用handleSubmit
    const event = new Event('submit') as unknown as React.FormEvent;
    setTimeout(() => handleSubmit(event), 100);
  };

  return (
    <ChatContext.Provider value={{ typingSpeed, setTypingSpeed }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
        position: 'relative',
        pb: { xs: 4, sm: 6 }
      }}>
        {/* 页面标题区域 */}
        <Box
          sx={{
            position: 'relative',
            pt: { xs: 2, sm: 4 },
            pb: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            backgroundImage: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.12)}, ${alpha(theme.palette.secondary.light, 0.08)})`,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: 'text.primary', 
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '3px',
                bgcolor: 'primary.main',
                borderRadius: '4px',
              }
            }}
          >
            智能医疗问答
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '600px',
              mb: 2
            }}
          >
            基于先进医疗知识图谱，为您提供专业的健康咨询和医疗问题解答
          </Typography>
          
          {/* 操作按钮组 */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1.5, 
              flexWrap: 'wrap',
              justifyContent: 'center',
              mt: 1
            }}
          >
            <Button
              startIcon={<HistoryIcon />}
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleOpenHistoryDrawer}
              sx={{ 
                borderRadius: '20px',
                px: 2,
              }}
            >
              历史记录
            </Button>
            
            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              size="small"
              onClick={clearChat}
              sx={{ 
                borderRadius: '20px',
                px: 2
              }}
              disabled={messages.length === 0}
            >
              清空对话
            </Button>
            
            <Button
              startIcon={<BookmarkIcon />}
              variant="outlined"
              color="secondary"
              size="small"
              onClick={saveCurrentChat}
              sx={{ 
                borderRadius: '20px',
                px: 2
              }}
              disabled={messages.length === 0}
            >
              保存对话
            </Button>
          </Box>
        </Box>

        {/* 主要内容区域 - 自适应布局 */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            flexGrow: 1,
            py: { xs: 2, sm: 3 },
            gap: 3,
            height: '100%',
          }}
        >
          {/* 聊天区域 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: { xs: '100%', md: '70%' },
              height: '100%',
            }}
          >
            {/* 聊天消息容器 */}
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                borderRadius: 3,
                overflow: 'hidden',
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
                backgroundColor: 'background.paper',
                mb: 2,
              }}
            >
              {/* 消息历史区域 */}
              <Box
                ref={chatContainerRef}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  overflowY: 'auto',
                  p: { xs: 2, sm: 3 },
                  minHeight: '400px',
                  maxHeight: 'calc(100vh - 350px)',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  },
                }}
                className="chat-container"
              >
                {/* 欢迎消息 */}
                {messages.length === 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      height: '100%',
                      px: 2,
                      py: 6,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 3,
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <LocalHospitalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Avatar>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      欢迎使用AI医疗助手
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, maxWidth: '600px' }}
                    >
                      我可以回答您的医疗健康问题，提供专业的参考意见和健康建议。请在下方输入您的问题，或从右侧选择常见问题开始对话。
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ maxWidth: '500px', fontStyle: 'italic', mt: 2 }}
                    >
                      注意：AI提供的建议仅供参考，重要健康决策请咨询专业医生。
                    </Typography>
                  </Box>
                )}

                {/* 消息列表 */}
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      mb: 3,
                      alignItems: message.role === MessageRole.USER ? 'flex-end' : 'flex-start',
                      maxWidth: '100%',
                      opacity: 0,
                      animation: `slideIn 0.3s ease-out forwards ${index * 0.1}s`,
                    }}
                    className="message-appear"
                  >
                    {/* 消息头部 - 用户/助手标识 */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 0.5,
                        ml: message.role === MessageRole.USER ? 'auto' : 0,
                        mr: message.role === MessageRole.ASSISTANT ? 'auto' : 0,
                        px: 1,
                      }}
                    >
                      {message.role === MessageRole.ASSISTANT && (
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            bgcolor: 'secondary.main',
                            fontSize: '0.8rem',
                          }}
                        >
                          <MedicalInformationIcon sx={{ fontSize: '16px' }} />
                        </Avatar>
                      )}
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {message.role === MessageRole.USER ? '您' : 'AI医疗助手'}
                      </Typography>
                      {message.role === MessageRole.USER && (
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            ml: 1,
                            bgcolor: 'primary.main',
                            fontSize: '0.8rem',
                          }}
                        >
                          <FaceIcon sx={{ fontSize: '16px' }} />
                        </Avatar>
                      )}
                    </Box>

                    {/* 消息气泡 */}
                    <Box
                      sx={{
                        ...BubbleStyle[message.role],
                        position: 'relative',
                      }}
                    >
                      {/* 如果是回复正在生成中 */}
                      {message.role === MessageRole.ASSISTANT && message.isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                          <CircularProgress size={20} thickness={5} sx={{ mr: 2, animation: 'pulse 1.5s infinite' }} />
                          <Typography variant="body2" sx={{ animation: 'pulse 1.5s infinite' }}>正在思考...</Typography>
                        </Box>
                      ) : (
                        // 已完成的消息内容
                        <Box sx={{ position: 'relative' }}>
                          {message.role === MessageRole.ASSISTANT ? (
                            <Typography
                              variant="body1"
                              component="div"
                              sx={{
                                color: 'text.primary',
                                lineHeight: 1.6,
                                '& p': { m: 0, mb: 1.5 },
                                '& p:last-child': { mb: 0 },
                                '& ul, & ol': { pl: 2, mb: 1.5 },
                                '& li': { mb: 0.5 },
                                '& a': {
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' },
                                },
                                '& code': {
                                  backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  fontFamily: 'monospace',
                                  fontSize: '0.9em',
                                },
                                '& pre': {
                                  backgroundColor: (theme) => alpha(theme.palette.action.selected, 0.15),
                                  borderRadius: 1,
                                  p: 1.5,
                                  overflowX: 'auto',
                                },
                                '& table': {
                                  borderCollapse: 'collapse',
                                  width: '100%',
                                  mb: 1.5,
                                },
                                '& th, & td': {
                                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                  p: 0.5,
                                },
                                '& th': {
                                  backgroundColor: (theme) => alpha(theme.palette.action.selected, 0.1),
                                  fontWeight: 'bold',
                                },
                              }}
                            >
                              {message.isLoading ? (
                                <TypewriterText text={message.content} speed={3} />
                              ) : message.isStreaming ? (
                                // 流式内容直接渲染，不使用打字机效果
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              ) : (
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              )}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body1"
                              component="div"
                              sx={{
                                color: 'text.primary',
                                lineHeight: 1.6,
                                '& p': { m: 0, mb: 1.5 },
                                '& p:last-child': { mb: 0 },
                              }}
                            >
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </Typography>
                          )}
                          
                          {/* 消息底部 - 时间戳等信息 */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                              mt: 1,
                              gap: 1,
                              opacity: 0.7,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}

                {/* 停止生成按钮 */}
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<StopIcon />}
                      onClick={stopGeneration}
                      sx={{ 
                        borderRadius: '20px',
                        boxShadow: 2
                      }}
                    >
                      停止生成
                    </Button>
                  </Box>
                )}
              </Box>

              {/* 输入区域 */}
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  backgroundColor: (theme) => alpha(theme.palette.background.default, 0.4),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  <TextField
                    fullWidth
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="输入您的医疗问题..."
                    variant="outlined"
                    multiline
                    maxRows={4}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '24px',
                        pr: 1,
                        transition: 'all 0.3s ease',
                        backgroundColor: 'background.paper',
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.05)',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          type="submit"
                          color="primary"
                          variant="contained"
                          disabled={!currentMessage.trim() || loading}
                          sx={{
                            minWidth: 'unset',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            p: 0,
                          }}
                        >
                          <SendIcon />
                        </Button>
                      ),
                    }}
                  />
                </Box>

                {/* 输入区域下方的辅助文本 */}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {loading ? '正在生成回答...' : '有问题随时问我'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* 右侧常见问题区域 */}
          <Box
            sx={{
              width: { xs: '100%', md: '30%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* 常见问题卡片 */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  backgroundImage: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)}, ${alpha(theme.palette.primary.main, 0.04)})`,
                }}
              >
                <LightbulbIcon color="primary" sx={{ mr: 1.5 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  常见医疗问题
                </Typography>
              </Box>

              <Box sx={{ 
                overflowY: 'auto', 
                flexGrow: 1,
                p: 0,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  },
                },
              }}>
                {MEDICAL_CATEGORIES.map((categoryData, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
                        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        {categoryData.category}
                      </Typography>
                    </Box>
                    
                    <List disablePadding>
                      {categoryData.questions.map((question, qIndex) => (
                        <ListItemButton
                          key={qIndex}
                          onClick={() => handleSelectPresetQuestion(question)}
                          sx={{
                            px: 2.5,
                            py: 1,
                            transition: 'all 0.2s ease',
                            borderLeft: '3px solid transparent',
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                              borderLeftColor: (theme) => theme.palette.primary.main,
                            },
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              fontWeight: 400,
                              lineHeight: 1.5
                            }}>
                            {question}
                          </Typography>
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Container>

        {/* 历史记录抽屉 */}
        <HistoryDrawer
          open={historyDrawerOpen}
          onClose={handleCloseHistoryDrawer}
          onSelectHistory={handleSelectHistory}
        />

        {/* 样式 */}
        <style>{typingStyles}</style>
      </Box>
    </ChatContext.Provider>
  );
};

export default ChatPage; 