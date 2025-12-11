import { useEffect, useState } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	TextField,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Chip,
	Stack,
	Button,
	MenuItem,
	Switch,
	IconButton,
	Alert,
	CircularProgress,
	Paper
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const roles = [
	{ value: 'waiter', label: 'گارسون' },
	{ value: 'floor_staff', label: 'پرسنل سالن' },
	{ value: 'bartender', label: 'باریستا' },
	{ value: 'admin', label: 'مدیر' },
	{ value: 'manager', label: 'مدیر کافه' },
	{ value: 'barista', label: 'باریستا' },
	{ value: 'customer', label: 'مشتری' }
];

const UserManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (token) fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchUsers = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/users`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری کاربران');
				setLoading(false);
				return;
			}
			const data = await res.json();
			// Filter to show only customers
			const customers = data.filter((u) => u.role === 'customer');
			setUsers(customers);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const getRoleLabel = (role) => {
		return roles.find((r) => r.value === role)?.label || role;
	};

	const formatDate = (dateString) => {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('fa-IR');
		} catch {
			return dateString;
		}
	};

	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت مشتریان</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6">لیست مشتریان</Typography>
								{loading && <CircularProgress size={22} />}
							</Stack>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : users.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									مشتری ثبت نشده است.
								</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>نام</TableCell>
											<TableCell>نام کاربری</TableCell>
											<TableCell>ایمیل</TableCell>
											<TableCell>شماره تماس</TableCell>
											<TableCell>نقش</TableCell>
											<TableCell>آدرس</TableCell>
											<TableCell>تاریخ ثبت</TableCell>
											<TableCell>وضعیت</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{users.map((u) => (
											<TableRow key={u.id} hover>
												<TableCell>
													{u.firstName && u.lastName
														? `${u.firstName} ${u.lastName}`
														: u.name || '-'}
												</TableCell>
												<TableCell>{u.username || '-'}</TableCell>
												<TableCell>{u.email || '-'}</TableCell>
												<TableCell>{u.phone || '-'}</TableCell>
												<TableCell>
													<Chip
														size="small"
														label={getRoleLabel(u.role)}
														color={
															u.role === 'admin'
																? 'error'
																: u.role === 'manager'
																? 'warning'
																: u.role === 'customer'
																? 'info'
																: 'default'
														}
													/>
												</TableCell>
												<TableCell>{u.address || '-'}</TableCell>
												<TableCell>{formatDate(u.created_at)}</TableCell>
												<TableCell>
													<Chip
														label={u.is_active ? 'فعال' : 'غیرفعال'}
														color={u.is_active ? 'success' : 'default'}
														size="small"
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default UserManagement;
