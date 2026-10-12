import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Slider,
  IconButton,
  Tooltip,
  Alert,
  InputAdornment,
  Fade,
  Zoom,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import api from '../services/api';
import { VisGraph } from '../types/knowledge';
import { visualizeGraph } from '../utils/graphUtils';
import '../styles/graph.css';

const KnowledgeGraphPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [graphData, setGraphData] = useState<VisGraph | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<number>(2);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  const graphRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);

  // 绘制图谱
  useEffect(() => {
    if (graphData && graphRef.current) {
      try {
        networkRef.current?.dispose();
        const chart = visualizeGraph(graphData, graphRef.current.id);
        networkRef.current = chart;
        
        // 添加节点点击事件 - 修复为使用 ECharts 的事件API
        if (chart) {
          chart.on('click', function(params: any) {
            if (params.dataType === 'node') {
              const nodeId = params.data.id;
              const selectedNode = graphData.nodes.find(node => node.id === nodeId);
              if (selectedNode) {
                setSelectedEntity(selectedNode.label);
              }
            }
          });
        }
      } catch (e) {
        console.error('可视化图谱失败:', e);
      }
    }
    return () => { networkRef.current?.dispose(); networkRef.current = null; };
  }, [graphData]);

  // 搜索实体并获取图谱数据
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    setGraphData(null);
    setSelectedEntity(null);
    
    try {
      // 获取实体详情
      const details = await api.knowledge.getEntityRelationships(searchTerm);
      
      if (details.entity) {
        setSelectedEntity(details.entity.name);
        
        // 获取可视化数据
        const visData = await api.knowledge.getVisualizationData(details.entity.id, depth);
        setGraphData(visData);
      } else {
        setError('未找到相关医学实体，请尝试其他关键词');
      }
    } catch (err) {
      console.error('获取知识图谱数据失败:', err);
      setError('无法获取知识图谱数据，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 处理按键事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 调整图谱深度
  const changeDepth = async (newDepth: number) => {
    if (!selectedEntity) return;
    
    setError(null);
    setDepth(newDepth);
    setLoading(true);
    
    try {
      // 需要先获取实体ID
      const details = await api.knowledge.getEntityRelationships(selectedEntity);
      
      if (details.entity) {
        const visData = await api.knowledge.getVisualizationData(
          details.entity.id,
          newDepth
        );
        setGraphData(visData);
      }
    } catch (err) {
      console.error('获取图谱数据失败:', err);
      setError('无法获取知识图谱数据，请检查后端连接');
    } finally {
      setLoading(false);
    }
  };

  // 图谱缩放控制
  const handleZoom = (zoomIn: boolean) => {
    if (networkRef.current) {
      try {
        // 获取当前视图
        const option = networkRef.current.getOption();
        const series = option.series[0];
        
        // 根据缩放方向调整缩放比例
        const currentZoom = series.zoom || 1;
        const newZoom = zoomIn ? currentZoom * 1.2 : currentZoom / 1.2;
        
        // 设置新的缩放比例
        networkRef.current.setOption({
          series: [{
            zoom: newZoom
          }]
        });
      } catch (e) {
        console.error('缩放图谱失败:', e);
      }
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            医疗知识图谱可视化
          </Typography>
          <Typography 
            variant="h6" 
            color="textSecondary"
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 3,
              fontWeight: 400,
              opacity: 0.8
            }}
          >
            通过交互式图谱浏览医学知识的复杂关联网络，直观展示疾病、症状、器官和治疗方法之间的关系
          </Typography>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入疾病、症状或药物名称..."
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NetworkCheckOutlinedIcon />}
              >
                查询知识图谱
              </Button>
            </Grid>
          </Grid>
          
          {error && (
            <Alert 
              severity="warning" 
              sx={{ mt: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
        </Paper>

        {graphData && <Alert severity="info" sx={{ mb: 2 }}>
          当前展示局部关系网络，最多 300 个节点；数据来自项目附带的 OpenCMKG，医学内容需进一步核实。
        </Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            <Paper 
              elevation={0} 
              sx={{ 
                height: '70vh', 
                p: 2, 
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              {loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%' 
                }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>正在生成知识图谱...</Typography>
                </Box>
              ) : !graphData ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%',
                  color: 'text.secondary' 
                }}>
                  <NetworkCheckOutlinedIcon sx={{ fontSize: 80, opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6">
                    请输入关键词查询知识图谱
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, maxWidth: '80%', textAlign: 'center' }}>
                    您可以搜索疾病（如"高血压"）、症状（如"头痛"）、药物或治疗方法，来浏览相关的医学知识网络
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box 
                    id="knowledge-graph-visualization" 
                    ref={graphRef} 
                    sx={{ 
                      width: '100%', 
                      height: '100%' 
                    }}
                  />
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    right: 16,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: 2,
                    p: 1
                  }}>
                    <Tooltip title="缩小">
                      <IconButton onClick={() => handleZoom(false)} size="small">
                        <ZoomOutIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="放大">
                      <IconButton onClick={() => handleZoom(true)} size="small">
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                height: '100%',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoOutlinedIcon sx={{ mr: 1 }} color="primary" />
                  图谱信息
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                {selectedEntity && (
                  <Zoom in={Boolean(selectedEntity)} timeout={500}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        当前中心实体
                      </Typography>
                      <Chip 
                        label={selectedEntity} 
                        color="primary" 
                        variant="outlined" 
                        icon={<HealthAndSafetyOutlinedIcon />} 
                        sx={{ mb: 3 }}
                      />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        关系深度控制
                      </Typography>
                      <Box sx={{ px: 1 }}>
                        <Slider
                          value={depth}
                          min={1}
                          max={4}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          onChange={(_, value) => changeDepth(value as number)}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        深度越大，展示的关系网络越复杂
                      </Typography>
                    </Box>
                  </Zoom>
                )}
                
                {!selectedEntity && !loading && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      请搜索医学实体以查看图谱信息
                    </Typography>
                  </Box>
                )}

                {graphData && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      图谱统计
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        节点数量:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {graphData.nodes.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        关系数量:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {graphData.edges.length}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    提示: 点击节点可以查看详细信息，双击节点可以将其设为中心重新展开图谱，拖拽和滚轮可以调整视图。
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default KnowledgeGraphPage; 