import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Button,
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
    Restaurant,
    Schedule,
    Inventory,
    Assignment,
    Logout,
    AccountCircle,
    Movie,
    Event,
    Work
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../../components/profile/UserProfile';

// Barista Components
import BaristaOverview from './components/BaristaOverview';
import OrderManagement from './components/OrderManagement';
import ReservationManagement from './components/ReservationManagement';
import CinemaReservations from './components/CinemaReservations';
import EventReservations from './components/EventReservations';
import CoworkingReservations from './components/CoworkingReservations';
import InventoryStatus from './components/InventoryStatus';
import LeaveRequests from './components/LeaveRequests';
import EmployeeShifts from './components/EmployeeShifts';

const drawerWidth = 240;

const BaristaDashboard = () => {
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const basePath = '/barista';

    const menuItems = [
        { text: 'نمای کلی', icon: <Dashboard />, to: basePath },
        { text: 'سفارش‌ها', icon: <Restaurant />, to: `${basePath}/orders` },
        { text: 'رزروها (میز و غذا)', icon: <Schedule />, to: `${basePath}/reservations` },
        { text: 'رزروهای سینما', icon: <Movie />, to: `${basePath}/cinema-reservations` },
        { text: 'رزروهای رویدادها', icon: <Event />, to: `${basePath}/event-reservations` },
        { text: 'رزروهای فضای مشترک', icon: <Work />, to: `${basePath}/coworking-reservations` },
        { text: 'شیفت‌های من', icon: <Schedule />, to: `${basePath}/shifts` },
        { text: 'موجودی', icon: <Inventory />, to: `${basePath}/inventory` },
        { text: 'درخواست‌های مرخصی', icon: <Assignment />, to: `${basePath}/leave` },
        { text: 'پروفایل من', icon: <AccountCircle />, to: `${basePath}/profile` }
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
                    پنل باریستا
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
                            سامانه مدیریت کافه - باریستا
                        </Typography>
                        <Button color="inherit" size="small" onClick={() => navigate('/')} sx={{ position: 'absolute', left: 8 }}>
                            بازگشت به خانه
                        </Button>
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
                    <Route index element={<BaristaOverview />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="reservations" element={<ReservationManagement />} />
                    <Route path="cinema-reservations" element={<CinemaReservations />} />
                    <Route path="event-reservations" element={<EventReservations />} />
                    <Route path="coworking-reservations" element={<CoworkingReservations />} />
                    <Route path="shifts" element={<EmployeeShifts />} />
                    <Route path="inventory" element={<InventoryStatus />} />
                    <Route path="leave" element={<LeaveRequests />} />
                    <Route path="profile" element={<UserProfile />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default BaristaDashboard;
