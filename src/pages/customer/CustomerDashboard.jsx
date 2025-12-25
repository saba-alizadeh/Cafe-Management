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
    Schedule,
    Star,
    Logout,
    AccountCircle,
    ShoppingCart,
    Restaurant,
    Event,
    Movie,
    BusinessCenter
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../../components/profile/UserProfile';

// Customer Components
import CustomerOverview from './components/CustomerOverview';
import Reservations from './components/Reservations';
import Reviews from './components/Reviews';
import ShoppingCartPage from './components/ShoppingCartPage';
import TableReservations from './components/TableReservations';
import EventReservations from './components/EventReservations';
import CinemaReservations from './components/CinemaReservations';
import SharedSpaceReservations from './components/SharedSpaceReservations';

const drawerWidth = 240;

const CustomerDashboard = () => {
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const basePath = '/customer';

    const menuItems = [
        { text: 'نمای کلی', icon: <Dashboard />, to: basePath },
        { text: 'سبد خرید', icon: <ShoppingCart />, to: `${basePath}/cart` },
        { text: 'رزرو میز کافه', icon: <Restaurant />, to: `${basePath}/reservations/tables` },
        { text: 'رزرو رویدادها', icon: <Event />, to: `${basePath}/reservations/events` },
        { text: 'رزرو سینما', icon: <Movie />, to: `${basePath}/reservations/cinema` },
        { text: 'رزرو فضای مشترک', icon: <BusinessCenter />, to: `${basePath}/reservations/shared` },
        { text: 'نظرات و امتیازها', icon: <Star />, to: `${basePath}/reviews` },
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
        <div>
            <Toolbar sx={{ justifyContent: 'center' }}>
                <Typography variant="h6" noWrap component="div">
                    پنل مشتری
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ direction: 'rtl' }}>
                {menuItems.map((item) => {
                    const isSelected = location.pathname === item.to || location.pathname === `${item.to}/`;
                    return (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={() => navigate(item.to)}
                            selected={isSelected}
                            sx={{
                                borderRadius: 2,
                                flexDirection: 'row-reverse',
                                justifyContent: 'flex-end',
                                textAlign: 'right',
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
                            <ListItemIcon
                                sx={{
                                    minWidth: 32,
                                    color: 'rgba(102, 123, 104, 0.68)',
                                    ml: 1
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ sx: { textAlign: 'right' } }}
                            />
                        </ListItemButton>
                    </ListItem>
                );
                })}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon sx={{ minWidth: 32, ml: 1 }}><Logout /></ListItemIcon>
                        <ListItemText primary="خروج" primaryTypographyProps={{ sx: { textAlign: 'right' } }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', direction: 'rtl' }}>
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
                        sx={{ ml: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        سامانه مدیریت کافه - مشتری
                    </Typography>
                    <Button color="inherit" size="small" onClick={() => {
                        const storedCafe = localStorage.getItem('selectedCafe');
                        if (storedCafe) {
                            try {
                                const cafe = JSON.parse(storedCafe);
                                const createCafeSlug = (name) => {
                                    return name
                                        .toLowerCase()
                                        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
                                        .replace(/^-+|-+$/g, '');
                                };
                                const slug = createCafeSlug(cafe.name);
                                navigate(`/${slug}`);
                            } catch (e) {
                                navigate('/select-cafe');
                            }
                        } else {
                            navigate('/select-cafe');
                        }
                    }} sx={{ position: 'absolute', left: 8 }}>
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
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            direction: 'rtl'
                        },
                    }}
                    anchor="right"
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            direction: 'rtl'
                        },
                    }}
                    anchor="right"
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mr: { sm: `${drawerWidth}px` },
                    direction: 'rtl'
                }}
            >
                <Toolbar />
                <Routes>
                    <Route index element={<CustomerOverview />} />
                    <Route path="cart" element={<ShoppingCartPage />} />
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="reservations/tables" element={<TableReservations />} />
                    <Route path="reservations/events" element={<EventReservations />} />
                    <Route path="reservations/cinema" element={<CinemaReservations />} />
                    <Route path="reservations/shared" element={<SharedSpaceReservations />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="profile" element={<UserProfile />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default CustomerDashboard;
