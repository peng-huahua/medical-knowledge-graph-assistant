import React, { useState } from 'react';
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
  Divider,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import api from '../services/api';
import { GuidanceFormData, GuidanceResponse } from '../types/guidance';

const initialFormData: GuidanceFormData = {
  symptoms: '',
  patient_info: '',
  medical_history: '',
  include_knowledge_graph: true,
};

const GuidancePage: React.FC = () => {
  const [formData, setFormData] = useState<GuidanceFormData>(initialFormData);
  const [result, setResult] = useState<GuidanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKnowledgeGraphToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      include_knowledge_graph: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) {
      setError('请描述您的症状');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.guidance.getGuidance({
        symptoms: formData.symptoms,
        patient_info: formData.patient_info || undefined,
        medical_history: formData.medical_history || undefined,
        include_knowledge_graph: formData.include_knowledge_graph,
      });
      setResult(response);
    } catch (err) {
      console.error('获取导医建议失败:', err);
      setError('无法获取导医建议，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        智能导医服务
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        描述您的症状，AI将分析可能适合就诊的科室，并提供就医建议。
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={result ? 5 : 8}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={2}
            sx={{ p: 3, borderRadius: 2 }}
          >
            <Typography variant="h6" gutterBottom>
              填写症状信息
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                症状描述 *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                placeholder="请详细描述您的症状、不适感、发病时间、严重程度等"
                variant="outlined"
                error={!!error}
                helperText={error}
                required
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                个人基本信息
              </Typography>
              <TextField
                fullWidth
                name="patient_info"
                value={formData.patient_info}
                onChange={handleInputChange}
                placeholder="年龄、性别、身高、体重等基本信息（可选）"
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                既往病史
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                name="medical_history"
                value={formData.medical_history}
                onChange={handleInputChange}
                placeholder="既往疾病、手术史、过敏史等（可选）"
                variant="outlined"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.include_knowledge_graph}
                    onChange={handleKnowledgeGraphToggle}
                    color="primary"
                  />
                }
                label="使用医疗知识图谱辅助分析"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                重置
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !formData.symptoms.trim()}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? '分析中...' : '获取导医建议'}
              </Button>
            </Box>
          </Paper>

          {!result && !loading && (
            <Card sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  导医服务说明
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" paragraph>
                  • 精确描述症状可以获得更准确的科室推荐
                </Typography>
                <Typography variant="body2" paragraph>
                  • 填写个人基本信息和既往病史有助于更精准分析
                </Typography>
                <Typography variant="body2" paragraph>
                  • 如有急症或紧急情况，请立即前往医院急诊科就诊
                </Typography>
                <Typography variant="body2" paragraph>
                  • 本系统提供的建议仅供参考，不能替代医生的诊断
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {result && (
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                导医建议
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {result.is_emergency && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>紧急提示</AlertTitle>
                  {result.emergency_advice || '您的症状可能需要紧急医疗干预，建议立即就医。'}
                </Alert>
              )}

              <Typography variant="subtitle1" gutterBottom>
                主要建议
              </Typography>
              <Typography variant="body1" paragraph>
                {result.primary_recommendation}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                推荐科室
              </Typography>
              <Box sx={{ mb: 3 }}>
                {result.departments.length > 0 ? (
                  <Grid container spacing={1}>
                    {result.departments.map((dept, index) => (
                      <Grid item key={index}>
                        <Chip
                          icon={<LocalHospitalIcon />}
                          label={dept.name}
                          color={index === 0 ? 'primary' : 'default'}
                          variant={index === 0 ? 'filled' : 'outlined'}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    无法确定具体科室，建议先咨询全科医生。
                  </Typography>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">就医前准备</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {result.preparation_advice.length > 0 ? (
                        <List dense disablePadding>
                          {result.preparation_advice.map((advice, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={advice} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          无特殊准备建议
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScienceIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">可能的检查项目</Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      {result.possible_examinations.length > 0 ? (
                        <List dense disablePadding>
                          {result.possible_examinations.map((exam, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <MedicalServicesIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={exam.name}
                                secondary={exam.description}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          无法预测具体检查项目，医生会根据实际情况安排检查。
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <AlertTitle>温馨提示</AlertTitle>
                  本系统提供的导医建议仅供参考，具体诊疗方案请遵医嘱。如症状加重，请及时就医。
                </Alert>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default GuidancePage; 