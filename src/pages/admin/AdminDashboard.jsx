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
	Business,
	Analytics,
	Settings,
	Logout,
	People,
	Schedule,
	EmojiEvents,
	Rule,
	Inventory2,
	Sms,
	Percent,
	BookOnline,
	ShoppingBag,
	Group,
	RateReview,
	AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../../components/profile/UserProfile';

// Admin Components
import AdminOverview from './components/AdminOverview';
import CafeManagement from './components/CafeManagement';
import SalesAnalytics from './components/SalesAnalytics';
import SystemSettings from './components/SystemSettings';
// Newly added admin pages
import EmployeeManagement from './components/EmployeeManagement';
import ShiftScheduling from './components/ShiftScheduling';
import RewardsPenalties from './components/RewardsPenalties';
import RulesManagement from './components/RulesManagement';
import InventoryControl from './components/InventoryControl';
import AdvertisingMessages from './components/AdvertisingMessages';
import DiscountCodes from './components/DiscountCodes';
import Reservations from './components/Reservations';
import ProductManagement from './components/ProductManagement';
import UserManagement from './components/UserManagement';
import CustomerFeedback from './components/CustomerFeedback';

const drawerWidth = 240;

const AdminDashboard = () => {
	const theme = useTheme();
	const [mobileOpen, setMobileOpen] = useState(false);
	const { logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const basePath = '/admin';

	const menuItems = [
		{ text: 'نمای کلی', icon: <Dashboard />, to: basePath },
		{ text: 'آمار فروش', icon: <Analytics />, to: `${basePath}/analytics` },
		{ text: 'مدیریت کارکنان', icon: <People />, to: `${basePath}/employees` },
		{ text: 'زمان بندی شیفت', icon: <Schedule />, to: `${basePath}/shifts` },
		{ text: 'پاداش و جریمه', icon: <EmojiEvents />, to: `${basePath}/rewards` },
		{ text: 'مدیریت قوانین', icon: <Rule />, to: `${basePath}/rules` },
		{ text: 'کنترل موجودی', icon: <Inventory2 />, to: `${basePath}/inventory` },
		{ text: 'پیام های تبلیغاتی', icon: <Sms />, to: `${basePath}/ads` },
		{ text: 'کدهای تخفیف', icon: <Percent />, to: `${basePath}/discounts` },
		{ text: 'رزروها', icon: <BookOnline />, to: `${basePath}/reservations` },
		{ text: 'مدیریت محصولات', icon: <ShoppingBag />, to: `${basePath}/products` },
		{ text: 'مدیریت کاربران', icon: <Group />, to: `${basePath}/users` },
		{ text: 'بازخورد مشتریان', icon: <RateReview />, to: `${basePath}/feedback` },
		{ text: 'مدیریت کافه', icon: <Business />, to: `${basePath}/cafes` },
		{ text: 'تنظیمات سیستم', icon: <Settings />, to: `${basePath}/settings` },
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
			<Toolbar>
				<Typography variant="h6" noWrap component="div">
					پنل مدیریت
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
		<Box sx={{ display: 'flex' }} dir="rtl">
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
						سامانه مدیریت کافه - ادمین
					</Typography>
				</Toolbar>
			</AppBar>
			<Box
				component="nav"
				sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
			>
				<Drawer
					anchor="right"
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{ keepMounted: true }}
					sx={{
						display: { xs: 'block', sm: 'none' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
					}}
				>
					{drawer}
				</Drawer>
				<Drawer
					anchor="right"
					variant="permanent"
					sx={{
						display: { xs: 'none', sm: 'block' },
						'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
					}}
					open
				>
					{drawer}
				</Drawer>
			</Box>
			<Box
				component="main"
				sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
			>
				<Toolbar />
				<Routes>
					<Route index element={<AdminOverview />} />
					<Route path="analytics" element={<SalesAnalytics />} />
					<Route path="employees" element={<EmployeeManagement />} />
					<Route path="shifts" element={<ShiftScheduling />} />
					<Route path="rewards" element={<RewardsPenalties />} />
					<Route path="rules" element={<RulesManagement />} />
					<Route path="inventory" element={<InventoryControl />} />
					<Route path="ads" element={<AdvertisingMessages />} />
					<Route path="discounts" element={<DiscountCodes />} />
					<Route path="reservations" element={<Reservations />} />
					<Route path="products" element={<ProductManagement />} />
					<Route path="users" element={<UserManagement />} />
					<Route path="feedback" element={<CustomerFeedback />} />
					<Route path="cafes" element={<CafeManagement />} />
					<Route path="settings" element={<SystemSettings />} />
					<Route path="profile" element={<UserProfile />} />
				</Routes>
			</Box>
		</Box>
	);
};

export default AdminDashboard;
