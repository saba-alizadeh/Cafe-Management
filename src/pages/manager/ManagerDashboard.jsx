import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Analytics,
    People,
    Inventory,
    Campaign,
    Settings,
    Logout
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Manager Components
import ManagerOverview from './components/ManagerOverview';
import SalesReports from './components/SalesReports';
import EmployeeManagement from './components/EmployeeManagement';
import InventoryManagement from './components/InventoryManagement';
import Promotions from './components/Promotions';
import CafeSettings from './components/CafeSettings';

const drawerWidth = 240;

const ManagerDashboard = () => {
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const basePath = '/manager';

    const menuItems = [
        { text: 'نمای کلی', icon: <Dashboard />, to: basePath },
        { text: 'گزارش‌های فروش', icon: <Analytics />, to: `${basePath}/reports` },
        { text: 'مدیریت کارکنان', icon: <People />, to: `${basePath}/employees` },
        { text: 'مدیریت موجودی', icon: <Inventory />, to: `${basePath}/inventory` },
        { text: 'کمپین‌ها و تخفیف‌ها', icon: <Campaign />, to: `${basePath}/promotions` },
        { text: 'تنظیمات کافه', icon: <Settings />, to: `${basePath}/settings` }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const drawer = (
        <div style={{ direction: 'rtl' }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    پنل مدیر
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => {
                    const isSelected = location.pathname === item.to || location.pathname === `${item.to}/`;
                    return (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => navigate(item.to)}
                            selected={isSelected}
                            sx={{
                                borderRadius: 2,
                                mx: 1,
                                my: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(102, 123, 104, 0.18)',
                                    color: theme.palette.text.primary,
                                    '& .MuiListItemIcon-root': {
                                        color: 'var(--color-accent)'
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(252, 238, 233, 0.7)'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: 'rgba(102, 123, 104, 0.68)' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                );
                })}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon><Logout /></ListItemIcon>
                        <ListItemText primary="خروج" />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mr: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ direction: 'rtl', flexGrow: 1, textAlign: 'right' }}>
                        سامانه مدیریت کافه - مدیر
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    anchor="right"
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    anchor="right"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            right: 0,
                            left: 'auto'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, direction: 'rtl' }}
            >
                <Toolbar />
                <Routes>
                    <Route index element={<ManagerOverview />} />
                    <Route path="reports" element={<SalesReports />} />
                    <Route path="employees" element={<EmployeeManagement />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="promotions" element={<Promotions />} />
                    <Route path="settings" element={<CafeSettings />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default ManagerDashboard;
