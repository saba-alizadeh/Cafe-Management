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
	Paper,
	Divider
} from '@mui/material';
import { Delete, People } from '@mui/icons-material';
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
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<People sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>مدیریت مشتریان</Typography>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<People color="primary" />
									<Typography variant="h6" sx={{ fontWeight: 'bold' }}>لیست مشتریان</Typography>
									<Chip label={users.length} color="primary" size="small" />
								</Stack>
								{loading && <CircularProgress size={24} />}
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{loading ? (
								<Box display="flex" justifyContent="center" p={4}>
									<CircularProgress />
								</Box>
							) : users.length === 0 ? (
								<Paper
									elevation={0}
									sx={{
										p: 4,
										textAlign: 'center',
										bgcolor: 'grey.50',
										borderRadius: 2
									}}
								>
									<Typography variant="body1" color="text.secondary">
										مشتری ثبت نشده است.
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>نام</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>نام کاربری</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>ایمیل</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>شماره تماس</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>نقش</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>آدرس</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>تاریخ ثبت</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{users.map((u) => (
												<TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{u.firstName && u.lastName
																? `${u.firstName} ${u.lastName}`
																: u.name || '-'}
														</Typography>
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
								</Paper>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default UserManagement;
