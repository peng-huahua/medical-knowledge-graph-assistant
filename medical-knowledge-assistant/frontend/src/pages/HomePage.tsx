import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  useTheme, 
  alpha, 
  Paper, 
  Zoom,
  Fade,
  useMediaQuery,
  Divider,
  Avatar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as framerMotion from 'framer-motion';

const { motion } = framerMotion;

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [animateHero, setAnimateHero] = useState(false);
  
  // 动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateHero(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // 功能卡片数据
  const features = [
    {
      title: '智能医疗问答',
      description: '基于大模型的智能问答系统，提供准确的医疗健康咨询服务，解答您的健康疑问。',
      icon: <ChatIcon fontSize="large" />,
      link: '/chat',
      color: theme.palette.primary.main,
      delay: 100,
      benefits: ['即时回答医疗问题', '专业医学知识支持', '24/7全天候服务']
    },
    {
      title: '关于我们',
      description: '了解我们的团队和使命，我们致力于通过AI技术让医疗信息变得更加透明和易于获取。',
      icon: <InfoIcon fontSize="large" />,
      link: '/about',
      color: theme.palette.success.main,
      delay: 200,
      benefits: ['专业医疗团队支持', '尖端AI技术应用', '持续更新与优化']
    }
  ];

  return (
    <Box sx={{ 
      overflow: 'hidden',
      position: 'relative',
      minHeight: 'calc(100vh - 148px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.background.default
    }}>
      {/* 动态背景效果 - 简化背景效果 */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -250, 
          right: -250, 
          width: 700, 
          height: 700, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.10)} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(70px)',
          zIndex: -1,
          animation: 'pulse 15s infinite alternate',
          '@keyframes pulse': {
            '0%': { opacity: 0.4, transform: 'scale(1)' },
            '100%': { opacity: 0.7, transform: 'scale(1.05)' }
          }
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -150, 
          left: -150, 
          width: 600, 
          height: 600, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.06)} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(60px)',
          zIndex: -1,
          animation: 'float 18s infinite alternate',
          '@keyframes float': {
            '0%': { transform: 'translateY(0)' },
            '100%': { transform: 'translateY(25px)' }
          }
        }} 
      />
      
      {/* 英雄区 */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 6, position: 'relative' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Zoom
              in={animateHero}
              style={{ transitionDelay: '100ms' }}
            >
              <Box>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    py: 0.8,
                    px: 2,
                    mb: 3,
                    borderRadius: '50px',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <MedicalServicesIcon 
                    fontSize="small" 
                    sx={{ color: theme.palette.primary.main, mr: 1 }} 
                  />
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 600 
                    }}
                  >
                    专业医疗咨询，触手可及
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h1" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
                    lineHeight: 1.2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                  }}
                >
                  AI医疗智能问答系统
                </Typography>
                
                <Typography 
                  variant="h5" 
                  color="textSecondary"
                  sx={{ 
                    maxWidth: '650px', 
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  利用先进的人工智能技术，为您提供精准的医疗咨询服务，
                  让复杂的医学知识变得简单易懂，随时随地解答您的健康疑问。
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                  <Button
                    component={RouterLink}
                    to="/chat"
                    variant="contained"
                    size="large"
                    startIcon={<ChatIcon />}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '50px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 28px rgba(37, 99, 235, 0.35)',
                        transform: 'translateY(-3px)',
                      }
                    }}
                  >
                    开始咨询
                  </Button>
                </Box>
                
                {/* 信任标识 - 优化样式 */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2.5,
                  mt: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  backdropFilter: 'blur(10px)',
                  maxWidth: 'fit-content',
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.03)}`
                }}>
                  <VerifiedIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                  <Typography 
                    variant="body1" 
                    color="textSecondary"
                    sx={{ 
                      fontWeight: 500,
                      letterSpacing: '0.01em'
                    }}
                  >
                    基于先进AI技术，提供专业医疗咨询服务
                  </Typography>
                </Box>
              </Box>
            </Zoom>
          </Grid>
          
          {/* 右侧装饰图形 */}
          <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Zoom
              in={animateHero}
              style={{ transitionDelay: '300ms' }}
            >
              <Box sx={{ 
                position: 'relative',
                height: '500px',
                width: '100%',
              }}>
                {/* 抽象医疗图形 - 使用多个圆形和线条创建抽象的医疗图形 */}
                <Box sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '400px',
                  height: '400px',
                  borderRadius: '50%',
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'rotate 30s linear infinite',
                  '@keyframes rotate': {
                    '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                  }
                }}>
                  <Box sx={{ 
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    animation: 'rotate 20s linear infinite reverse',
                  }} />
                </Box>
                
                {/* 中心图标 */}
                <Avatar 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 100,
                    height: 100,
                    bgcolor: theme.palette.primary.main,
                    boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <MedicalServicesIcon sx={{ fontSize: 50 }} />
                </Avatar>
                
                {/* 点缀小圆点 */}
                {[...Array(8)].map((_, i) => (
                  <Box 
                    key={i}
                    sx={{ 
                      position: 'absolute',
                      top: `${30 + Math.random() * 60}%`,
                      left: `${30 + Math.random() * 60}%`,
                      width: 8 + Math.random() * 12,
                      height: 8 + Math.random() * 12,
                      borderRadius: '50%',
                      bgcolor: i % 2 ? theme.palette.primary.main : theme.palette.secondary.main,
                      opacity: 0.6 + Math.random() * 0.4,
                      animation: `pulse 3s infinite alternate ${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </Box>
            </Zoom>
          </Grid>
        </Grid>
      </Container>
      
      {/* 分隔线 - 优化样式 */}
      <Container maxWidth="lg">
        <Divider sx={{ 
          my: { xs: 5, md: 6 }, 
          opacity: 0.5,
          '&::before, &::after': {
            borderColor: alpha(theme.palette.divider, 0.15),
          }
        }}>
          <Typography 
            variant="h6" 
            component="span"
            sx={{ 
              px: 2, 
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: '0.95rem',
              letterSpacing: '0.02em'
            }}
          >
            我们的服务
          </Typography>
        </Divider>
      </Container>
      
      {/* 特性卡片部分 - 优化样式 */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.03)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.08)}`,
                    '& .feature-icon-wrapper': {
                      transform: 'scale(1.05)',
                    }
                  }
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay / 1000 }}
              >
                {/* 顶部彩色边框 */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: 6, 
                    bgcolor: feature.color,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4
                  }} 
                />
                
                {/* 图标 */}
                <Box 
                  className="feature-icon-wrapper"
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    mb: 3,
                    color: 'white',
                    bgcolor: feature.color,
                    transition: 'transform 0.3s ease',
                    boxShadow: `0 8px 20px ${alpha(feature.color, 0.25)}`
                  }}
                >
                  {feature.icon}
                </Box>
                
                {/* 标题和描述 */}
                <Typography 
                  variant="h5" 
                  component="h3"
                  sx={{ 
                    mb: 1.5, 
                    fontWeight: 600,
                    position: 'relative'
                  }}
                >
                  {feature.title}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                  sx={{ 
                    mb: 3,
                    lineHeight: 1.7
                  }}
                >
                  {feature.description}
                </Typography>
                
                {/* 功能点列表 */}
                <Box sx={{ mt: 'auto' }}>
                  {feature.benefits.map((benefit, i) => (
                    <Box 
                      key={i} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: i < feature.benefits.length - 1 ? 1.5 : 0
                      }}
                    >
                      <CheckCircleIcon 
                        sx={{ 
                          mr: 1.5, 
                          fontSize: 20,
                          color: feature.color
                        }} 
                      />
                      <Typography variant="body2">
                        {benefit}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                {/* 链接按钮 */}
                <Button
                  component={RouterLink}
                  to={feature.link}
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    mt: 4,
                    alignSelf: 'flex-start',
                    borderColor: alpha(feature.color, 0.5),
                    color: feature.color,
                    '&:hover': {
                      borderColor: feature.color,
                      bgcolor: alpha(feature.color, 0.05)
                    }
                  }}
                >
                  {feature.title === '智能医疗问答' ? '开始咨询' : '了解更多'}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* 底部信息 - 优化样式 */}
      <Box 
        sx={{ 
          mt: 'auto', 
          py: 3.5, 
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5
            }}
          >
            <Typography 
              variant="body2" 
              color="textSecondary"
              sx={{ opacity: 0.85 }}
            >
              {new Date().getFullYear()} AI医疗智能问答系统 · 基于大模型技术构建
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 3
              }}
            >
              <Typography 
                variant="body2" 
                component={RouterLink} 
                to="/about"
                sx={{ 
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                关于我们
              </Typography>
              <Typography 
                variant="body2" 
                component={RouterLink} 
                to="/chat"
                sx={{ 
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  '&:hover': { color: theme.palette.primary.main }
                }}
              >
                开始咨询
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;