import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  useScrollTrigger,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// 导航项
const navItems = [
  { label: '首页', path: '/', icon: <HomeIcon /> },
  { label: '智能问答', path: '/chat', icon: <ChatIcon /> },
  { label: '知识图谱', path: '/knowledge', icon: <LocalHospitalIcon /> },
  { label: '关于我们', path: '/about', icon: <InfoIcon /> },
];

// 滚动时改变AppBar效果
function ElevationScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 2 : 0,
    sx: {
      backgroundColor: trigger ? 
        'rgba(255, 255, 255, 0.95)' : 
        'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
    }
  } as React.HTMLAttributes<HTMLDivElement>);
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 导航抽屉（移动端）
  const drawer = (
    <Box 
      sx={{ 
        width: 280, 
        height: '100%',
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.95)})`,
        backdropFilter: 'blur(10px)',
        borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
      }}
      role="presentation"
      onClick={handleDrawerToggle}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalHospitalIcon 
            sx={{ 
              color: theme.palette.primary.main,
              fontSize: 32,
              mr: 1 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI医疗助手
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ flexGrow: 1, p: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, textAlign: 'center', opacity: 0.7 }}>
        <Typography variant="caption" color="textSecondary">
          © {new Date().getFullYear()} AI医疗智能问答系统
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 应用栏 */}
      <ElevationScroll>
        <AppBar 
          position="fixed" 
          color="inherit"
          sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters>
              {/* Logo和标题 */}
              <Box 
                component={RouterLink} 
                to="/"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  textDecoration: 'none', 
                  color: 'inherit',
                  mr: 4
                }}
              >
                <LocalHospitalIcon 
                  sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    color: theme.palette.primary.main,
                    fontSize: 32,
                    mr: 1 
                  }} 
                />
                <Typography 
                  variant="h6" 
                  noWrap
                  sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    fontWeight: 700,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI医疗智能问答系统
                </Typography>
                
                {/* 移动端Logo */}
                <LocalHospitalIcon 
                  sx={{ 
                    display: { xs: 'flex', md: 'none' },
                    color: theme.palette.primary.main,
                    fontSize: 28,
                    mr: 1 
                  }} 
                />
                <Typography 
                  variant="h6" 
                  noWrap
                  sx={{ 
                    display: { xs: 'flex', md: 'none' },
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI医疗助手
                </Typography>
              </Box>

              {/* 桌面版导航 */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      mx: 1,
                      py: 1,
                      px: 2,
                      borderRadius: '50px',
                      color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                      backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': {
                        backgroundColor: location.pathname === item.path 
                          ? alpha(theme.palette.primary.main, 0.15) 
                          : alpha(theme.palette.primary.main, 0.05),
                      },
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>

              {/* 移动端菜单按钮 */}
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton 
                  size="large" 
                  edge="end" 
                  onClick={handleDrawerToggle}
                  color="primary"
                  sx={{ 
                    ml: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
      
      {/* 移动端导航抽屉 */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* 主要内容 */}
      <Box component="main" sx={{ flexGrow: 1, pt: '64px' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 