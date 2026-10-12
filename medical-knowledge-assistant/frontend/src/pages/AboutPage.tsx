import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Button,
  CardActionArea,
  CardActions,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StorageIcon from '@mui/icons-material/Storage';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ApiIcon from '@mui/icons-material/Api';
import LayersIcon from '@mui/icons-material/Layers';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const AboutPage: React.FC = () => {
  const technologies = [
    {
      name: '大模型技术',
      description: '基于OpenAI或百度文心大模型，提供准确的医疗信息和建议。',
      icon: <PsychologyIcon color="primary" />,
    },
    {
      name: '知识图谱',
      description: '构建医疗实体关系网络，展示疾病、症状、治疗等要素间的关联。',
      icon: <StorageIcon color="secondary" />,
    },
    {
      name: '医疗数据',
      description: '系统基于可靠的医学知识库和临床指南构建，确保信息准确性。',
      icon: <LocalHospitalIcon color="success" />,
    },
    {
      name: '前后端架构',
      description: '采用React+FastAPI构建的现代化前后端分离架构，提供流畅用户体验。',
      icon: <ApiIcon color="info" />,
    },
  ];

  const faqs = [
    {
      question: '系统的医疗建议是否可靠？',
      answer:
        '系统提供的建议基于医学知识和大模型分析，但仅供参考，不能替代专业医生的诊断。如有健康问题，请及时就医。',
    },
    {
      question: '知识图谱的数据来源是什么？',
      answer:
        '知识图谱基于公开的医学文献、临床指南和医学教科书构建，由医学专业人员审核，确保数据准确性。',
    },
    {
      question: '系统会保存我的问诊记录吗？',
      answer:
        '系统不会长期存储您的问诊记录和个人健康信息。您的会话数据仅在当前会话期间用于提供服务，并在会话结束后自动清除。',
    },
    {
      question: '导医建议是如何生成的？',
      answer:
        '导医建议基于您提供的症状描述，结合医学知识图谱和大模型分析，参考各科室诊疗范围生成可能适合就诊的科室推荐。',
    },
  ];

  const quickLinks = [
    {
      title: '医疗问答',
      description: '向AI提问医疗相关问题，获取专业医学信息参考',
      icon: <QuestionAnswerIcon sx={{ fontSize: 40 }} color="primary" />,
      path: '/chat',
    },
    {
      title: '智能导医',
      description: '描述症状，获取就诊科室建议和相关医疗建议',
      icon: <MedicalServicesIcon sx={{ fontSize: 40 }} color="secondary" />,
      path: '/guidance',
    },
    {
      title: '知识图谱',
      description: '探索疾病、症状、药物之间的关系，了解医学知识网络',
      icon: <AccountTreeIcon sx={{ fontSize: 40 }} color="success" />,
      path: '/knowledge',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        关于系统
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        AI医疗知识图谱问答与导医系统是一个基于大模型和知识图谱技术的智能医疗服务平台。
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">系统介绍</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              本系统旨在通过人工智能技术为用户提供医疗健康信息咨询和导医服务。系统主要包含三大核心功能：医疗问答、智能导医和知识图谱可视化。
            </Typography>
            <Typography variant="body1" paragraph>
              通过整合大语言模型和医疗知识图谱，系统能够理解用户的医疗健康问题，提供专业的参考信息，并在必要时引导用户及时就医。
            </Typography>
            <Typography variant="body1" paragraph>
              系统采用前后端分离架构，前端使用React框架构建用户界面，后端基于Python FastAPI实现API服务，Neo4j图数据库存储知识图谱数据。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LayersIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="h6">核心技术</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              {technologies.map((tech, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>{tech.icon}</ListItemIcon>
                  <ListItemText primary={tech.name} secondary={tech.description} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HelpOutlineIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="h6">常见问题</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {faqs.map((faq, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {faq.question}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {faq.answer}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6">免责声明</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1" paragraph>
              本系统提供的所有信息和建议仅供参考，不构成医疗建议、诊断或治疗方案。用户在做出任何医疗决策前，应当咨询合格的医疗专业人士。
            </Typography>
            <Typography variant="body1" paragraph>
              系统不保证所提供信息的绝对准确性和完整性。在任何情况下，系统开发者和运营方对因使用本系统而导致的任何直接或间接损失不承担责任。
            </Typography>
            <Typography variant="body1" paragraph>
              如有紧急医疗情况，请立即拨打急救电话或前往最近的医院就诊。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 3 }}>
            开始使用
          </Typography>
          <Grid container spacing={3}>
            {quickLinks.map((link, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} elevation={3}>
                  <CardActionArea component={RouterLink} to={link.path} sx={{ flexGrow: 1 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        {link.icon}
                      </Box>
                      <Typography variant="h6" component="h3" align="center" gutterBottom>
                        {link.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" align="center">
                        {link.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button 
                      component={RouterLink} 
                      to={link.path} 
                      endIcon={<ArrowForwardIcon />} 
                      sx={{ width: '100%' }}
                    >
                      开始使用
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} AI医疗知识图谱问答与导医系统
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutPage; 