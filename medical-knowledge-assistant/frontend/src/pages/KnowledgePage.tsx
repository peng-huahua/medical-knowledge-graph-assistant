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
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  InputAdornment,
  Fade,
  Zoom,
  Badge,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NetworkCheckOutlinedIcon from '@mui/icons-material/NetworkCheckOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import api from '../services/api';
import { KnowledgeEntityDetails, VisGraph } from '../types/knowledge';
import { visualizeGraph } from '../utils/graphUtils';
import '../styles/graph.css';

const KnowledgePage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entityDetails, setEntityDetails] = useState<KnowledgeEntityDetails | null>(null);
  const [graphData, setGraphData] = useState<VisGraph | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<number>(2);
  const [tabValue, setTabValue] = useState<number>(0);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  
  const graphRef = useRef<HTMLDivElement>(null);

  // 初始加载常见疾病和症状
  useEffect(() => {
    fetchDiseasesAndSymptoms();
  }, []);
  
  // 绘制图谱
  useEffect(() => {
    if (graphData && graphRef.current) {
      try {
        visualizeGraph(graphData, graphRef.current.id);
      } catch (e) {
        console.error('可视化图谱失败:', e);
      }
    }
  }, [graphData]);

  // 获取疾病和症状列表
  const fetchDiseasesAndSymptoms = async () => {
    setLoadingList(true);
    try {
      const [diseasesResponse, symptomsResponse] = await Promise.all([
        api.knowledge.getDiseases(),
        api.knowledge.getSymptoms()
      ]);
      setDiseases(diseasesResponse.diseases || []);
      setSymptoms(symptomsResponse.symptoms || []);
    } catch (err) {
      console.error('获取疾病和症状列表失败:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // 搜索实体
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    setEntityDetails(null);
    setGraphData(null);
    
    try {
      // 获取实体详情
      const details = await api.knowledge.getEntityRelationships(searchTerm);
      setEntityDetails(details);
      
      if (details.entity) {
        // 获取可视化数据
        const visData = await api.knowledge.getVisualizationData(details.entity.id, depth);
        setGraphData(visData);
      }
    } catch (err) {
      console.error('搜索知识图谱实体失败:', err);
      setError('无法查找相关医学知识，请尝试其他关键词');
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

  // 处理Tab切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 选择列表项目
  const handleListItemClick = (name: string) => {
    setSearchTerm(name);
    handleSearch();
  };

  // 调整图谱深度
  const changeDepth = async (newDepth: number) => {
    if (!entityDetails?.entity) return;
    
    setDepth(newDepth);
    setLoading(true);
    
    try {
      const visData = await api.knowledge.getVisualizationData(
        entityDetails.entity.id,
        newDepth
      );
      setGraphData(visData);
    } catch (err) {
      console.error('获取图谱数据失败:', err);
    } finally {
      setLoading(false);
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
            医疗知识图谱
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
            探索疾病、症状、药物和治疗方法之间的关联，获取全面的医学知识
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
                variant="outlined"
                placeholder="搜索疾病、症状或药物..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                size="large"
                sx={{
                  height: '56px',
                  px: 4,
                  fontWeight: 600,
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                  }
                }}
              >
                搜索
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
              正在构建知识图谱...
            </Typography>
          </Box>
        )}

        {error && (
          <Zoom in={true}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 4,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                '& .MuiAlert-icon': {
                  fontSize: '2rem',
                }
              }}
            >
              <Typography variant="subtitle1">{error}</Typography>
            </Alert>
          </Zoom>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Card 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                <Box 
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`,
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    aria-label="knowledge lists"
                    TabIndicatorProps={{
                      style: {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        height: 3,
                      }
                    }}
                  >
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalHospitalOutlinedIcon sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">常见疾病</Typography>
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HealthAndSafetyOutlinedIcon sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">常见症状</Typography>
                        </Box>
                      } 
                    />
                  </Tabs>
                </Box>
                <CardContent
                  sx={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    p: 0,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: alpha(theme.palette.primary.main, 0.4),
                    },
                  }}
                >
                  {loadingList ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : (
                    <>
                      {tabValue === 0 && (
                        <List disablePadding>
                          {diseases.map((disease, index) => (
                            <ListItem
                              key={index}
                              divider
                              onClick={() => handleListItemClick(disease.name)}
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  paddingLeft: '24px',
                                }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {disease.name}
                                  </Typography>
                                }
                                secondary={
                                  disease.description
                                    ? disease.description.substring(0, 60) + '...'
                                    : '无描述'
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}

                      {tabValue === 1 && (
                        <List disablePadding>
                          {symptoms.map((symptom, index) => (
                            <ListItem
                              key={index}
                              divider
                              onClick={() => handleListItemClick(symptom.name)}
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  paddingLeft: '24px',
                                }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {symptom.name}
                                  </Typography>
                                }
                                secondary={
                                  symptom.description
                                    ? symptom.description.substring(0, 60) + '...'
                                    : '无描述'
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} md={8}>
            {/* 知识图谱可视化 */}
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  height: '600px',
                  mb: 4,
                  p: 0,
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                {/* 背景装饰元素 */}
                <div className="tech-bg-element tech-bg-element-1"></div>
                <div className="tech-bg-element tech-bg-element-2"></div>
                
                <Box 
                  ref={graphRef}
                  id="knowledge-graph-container"
                  className="graph-container"
                  sx={{ height: '100%', position: 'relative' }}
                >
                  {!graphData && !loading && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        p: 3,
                        textAlign: 'center'
                      }}
                    >
                      <NetworkCheckOutlinedIcon 
                        sx={{ 
                          fontSize: 100, 
                          color: alpha(theme.palette.primary.main, 0.2),
                          mb: 3 
                        }} 
                      />
                      <Typography variant="h5" color="textSecondary" gutterBottom>
                        搜索医学实体以查看知识图谱
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: '550px', mb: 4 }}>
                        输入疾病、症状或药物名称，探索它们之间的关联关系，获取全面的医学知识图谱
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['糖尿病', '高血压', '头痛', '阿司匹林', '肺炎'].map((term, index) => (
                          <Chip
                            key={index}
                            label={term}
                            onClick={() => {
                              setSearchTerm(term);
                              handleSearch();
                            }}
                            color="primary"
                            variant="outlined"
                            sx={{
                              borderRadius: '16px',
                              px: 1,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Zoom>

            {/* 实体详情 */}
            {entityDetails && (
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    position: 'relative'
                  }}
                >
                  {entityDetails.entity && entityDetails.entity.is_mock_data && (
                    <Alert 
                      severity="info" 
                      variant="outlined"
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          fontSize: '1.5rem',
                        }
                      }}
                    >
                      <Typography variant="body2">
                        当前显示的是模拟数据，Neo4j知识图谱数据库未连接。这些数据仅用于演示目的。
                      </Typography>
                    </Alert>
                  )}
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {entityDetails.entity && entityDetails.entity.name}
                    </Typography>
                    {entityDetails.entity && entityDetails.entity.description && (
                      <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>
                        {entityDetails.entity.description}
                      </Typography>
                    )}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mt: 1, 
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }}
                    >
                      <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        数据来源: {entityDetails.entity && entityDetails.entity.sources && entityDetails.entity.sources.length > 0 
                          ? entityDetails.entity.sources.join(', ') 
                          : '未知来源'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {entityDetails.relationships && entityDetails.relationships.length > 0 ? (
                    <Grid container spacing={2}>
                      {entityDetails.relationships.map((rel, index) => (
                        <Grid item xs={12} key={index}>
                          <Box 
                            sx={{ 
                              mb: 2,
                              backgroundColor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                              }
                            }}
                          >
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2,
                                backgroundColor: 'transparent',
                                borderColor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" fontWeight={500}>
                                  <Badge 
                                    color="primary" 
                                    variant="dot" 
                                    sx={{ mr: 1 }}
                                  />
                                  {rel.type}
                                </Typography>
                                <Typography variant="subtitle2">
                                  {rel.target.name}
                                </Typography>
                              </Box>
                              
                              <Divider sx={{ my: 1.5 }} />
                              
                              {rel.target.description && (
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                                  {rel.target.description.length > 120 
                                    ? rel.target.description.substring(0, 120) + '...' 
                                    : rel.target.description}
                                </Typography>
                              )}
                              
                              {rel.properties && Object.keys(rel.properties).length > 0 && (
                                <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {Object.entries(rel.properties).map(([key, value]) => (
                                    <Chip 
                                      key={key}
                                      label={`${key}: ${value}`} 
                                      size="small" 
                                      sx={{ 
                                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                        color: theme.palette.secondary.dark,
                                        fontWeight: 400,
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Paper>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                      未找到相关关系数据
                    </Typography>
                  )}
                </Paper>
              </Zoom>
            )}
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default KnowledgePage; 