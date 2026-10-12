import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItemButton,
  IconButton,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Collapse,
  useTheme,
  alpha,
  Avatar,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';

import historyService from '../services/historyService';
import { ChatHistory, Message } from '../types/chat';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectHistory: (history: ChatHistory) => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ open, onClose, onSelectHistory }) => {
  const theme = useTheme();
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载历史记录
  useEffect(() => {
    if (open) {
      loadHistories();
    }
  }, [open]);

  // 加载历史记录
  const loadHistories = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const loadedHistories = historyService.getHistories();
        setHistories(loadedHistories);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 短暂延迟以显示加载效果
  };

  // 展开/收起详情
  const handleToggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  // 选择历史记录
  const handleSelectHistory = (history: ChatHistory) => {
    onSelectHistory(history);
    onClose();
  };

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  // 删除历史记录
  const handleDeleteConfirm = () => {
    if (historyToDelete) {
      historyService.deleteHistory(historyToDelete);
      loadHistories();
      setDeleteDialogOpen(false);
      setHistoryToDelete(null);
    }
  };

  // 打开清空确认对话框
  const handleOpenClearAllDialog = () => {
    setClearAllDialogOpen(true);
  };

  // 清空所有历史记录
  const handleClearAllConfirm = () => {
    historyService.clearAllHistories();
    setHistories([]);
    setClearAllDialogOpen(false);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取预览内容
  const getPreviewContent = (history: ChatHistory) => {
    const assistantMessage = history.messages.find(msg => msg.role === 'assistant');
    if (assistantMessage) {
      const content = assistantMessage.content.trim();
      return content.length > 30 ? `${content.substring(0, 30)}...` : content;
    }
    return '无回复内容';
  };

  // 获取对话消息数量
  const getMessageCount = (messages: Message[]): number => {
    return messages.length;
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '90%', sm: 450 },
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(145deg, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})` 
            : `linear-gradient(145deg, ${alpha('#fff', 0.9)}, ${alpha('#f5f7fa', 0.95)})`,
          backdropFilter: 'blur(16px)',
        },
      }}
    >
      {/* 标题栏 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2.5,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        background: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(8px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              mr: 1.5,
            }}
          >
            <HistoryIcon />
          </Avatar>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.text.primary,
            fontWeight: 600,
          }}>
            历史对话记录
            <Chip 
              label={histories.length} 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ ml: 1, height: 20, minWidth: 28 }}
            />
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ 
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.9) }
        }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 加载状态指示器 */}
      {isLoading && (
        <LinearProgress color="primary" sx={{ height: 2 }} />
      )}

      {/* 内容区域 */}
      <Box sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* 空状态显示 */}
        {!isLoading && histories.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            p: 3,
            textAlign: 'center'
          }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.text.secondary
              }}
            >
              <HourglassEmptyIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              暂无历史对话记录
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 300, mb: 3 }}>
              您的对话历史将显示在这里，可以方便地查看和继续之前的对话。
            </Typography>
            <Button
              startIcon={<RestoreIcon />}
              variant="outlined"
              onClick={onClose}
              sx={{ borderRadius: 28 }}
            >
              返回对话
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 历史记录列表 */}
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
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
              <List disablePadding>
                {histories.map((history) => (
                  <Box key={history.id} sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => handleSelectHistory(history)}
                      sx={{
                        p: 0,
                        borderRadius: 0,
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.7),
                        },
                      }}
                    >
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 0, 
                          width: '100%',
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          boxShadow: 'none',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.15),
                          }
                        }}
                      >
                        {/* 卡片顶部 */}
                        <Box sx={{ 
                          p: 2, 
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: alpha(theme.palette.background.default, 0.4),
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                width: 36,
                                height: 36,
                                mr: 1.5,
                              }}
                            >
                              <ChatIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                                {history.title || '未命名对话'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(history.timestamp)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={`${getMessageCount(history.messages)}条消息`}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ height: 24, mr: 1 }}
                            />
                            <Tooltip title="删除对话">
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleOpenDeleteDialog(history.id, e)}
                                sx={{ 
                                  color: theme.palette.error.main, 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.15),
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
                        {/* 预览内容 */}
                        <Box 
                          sx={{ 
                            p: 2, 
                            backgroundColor: 'background.paper',
                            position: 'relative'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              lineHeight: 1.5,
                              mb: 1
                            }}
                          >
                            {getPreviewContent(history)}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ExpandMoreIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleExpand(history.id);
                              }}
                              sx={{ 
                                borderRadius: 20,
                                textTransform: 'none',
                                px: 1.5,
                                fontSize: '0.75rem',
                                height: 28,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: 'primary.main',
                              }}
                            >
                              {expanded === history.id ? '收起详情' : '查看详情'}
                            </Button>
                            
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectHistory(history);
                              }}
                              sx={{ 
                                borderRadius: 20,
                                textTransform: 'none',
                                px: 1.5,
                                fontSize: '0.75rem',
                                height: 28,
                              }}
                            >
                              继续对话
                            </Button>
                          </Box>
                          
                          {/* 对话详情折叠区域 */}
                          <Collapse in={expanded === history.id} timeout="auto" unmountOnExit>
                            <Box sx={{ mt: 2, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`, pt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                对话内容
                              </Typography>
                              <List disablePadding>
                                {history.messages.map((msg, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 1,
                                      mb: 1,
                                      backgroundColor: msg.role === 'user' 
                                        ? alpha(theme.palette.primary.main, 0.05)
                                        : alpha(theme.palette.secondary.main, 0.05),
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                      <Chip
                                        label={msg.role === 'user' ? '用户' : 'AI'}
                                        size="small"
                                        color={msg.role === 'user' ? 'primary' : 'secondary'}
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.6rem' }}
                                      />
                                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                      {msg.content}
                                    </Typography>
                                  </Box>
                                ))}
                              </List>
                            </Box>
                          </Collapse>
                        </Box>
                      </Paper>
                    </ListItemButton>
                  </Box>
                ))}
              </List>
            </Box>
            
            {/* 底部按钮区域 */}
            {histories.length > 0 && (
              <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backdropFilter: 'blur(8px)',
                background: alpha(theme.palette.background.paper, 0.6),
              }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<ClearAllIcon />}
                  onClick={handleOpenClearAllDialog}
                  sx={{ 
                    borderRadius: 28,
                    py: 1
                  }}
                >
                  清空所有历史记录
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* 删除对话确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle id="delete-dialog-title">确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除这条对话记录吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary" variant="outlined" sx={{ borderRadius: 28 }}>
            取消
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ borderRadius: 28 }}>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 清空所有历史记录确认对话框 */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        aria-labelledby="clear-all-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle id="clear-all-dialog-title">确认清空所有历史</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要清空所有对话历史记录吗？此操作将永久删除所有记录且无法恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setClearAllDialogOpen(false)} color="primary" variant="outlined" sx={{ borderRadius: 28 }}>
            取消
          </Button>
          <Button onClick={handleClearAllConfirm} color="error" variant="contained" sx={{ borderRadius: 28 }}>
            清空
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default HistoryDrawer; 