import { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TableContainer,
	Paper,
	Chip,
	Stack,
	Divider,
	CircularProgress,
	Button,
	Alert,
	ToggleButtonGroup,
	ToggleButton
} from '@mui/material';
import { TableRestaurant, BookOnline, Cancel, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const Reservations = () => {
	const { apiBaseUrl, token, user } = useAuth();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [typeFilter, setTypeFilter] = useState('all');

	const authToken = token || localStorage.getItem('authToken');
	const cafeId = user?.cafe_id;

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed':
				return 'success';
			case 'pending':
				return 'warning';
			case 'completed':
				return 'default';
			case 'cancelled':
				return 'error';
			default:
				return 'default';
		}
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case 'confirmed':
				return 'تایید شده';
			case 'pending':
				return 'در انتظار';
			case 'completed':
				return 'انجام شده';
			case 'cancelled':
				return 'لغو شده';
			default:
				return status || 'نامشخص';
		}
	};

	const getTypeLabel = (reservationType, kind) => {
		if (kind === 'order') return 'سفارش محصولات';
		switch (reservationType) {
			case 'table':
				return 'رزرو میز';
			case 'coworking':
				return 'فضای مشترک';
			case 'cinema':
				return 'سینما';
			case 'event':
				return 'رویداد';
			default:
				return 'رزرو';
		}
	};

	const fetchData = async () => {
		if (!authToken || !cafeId) {
			setError('احراز هویت یا شناسه کافه در دسترس نیست');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const [reservationsRes, ordersRes] = await Promise.all([
				fetch(
					`${apiBaseUrl}/reservations?cafe_id=${encodeURIComponent(
						cafeId
					)}`,
					{
						headers: { Authorization: `Bearer ${authToken}` }
					}
				),
				fetch(
					`${apiBaseUrl}/orders?cafe_id=${encodeURIComponent(
						cafeId
					)}`,
					{
						headers: { Authorization: `Bearer ${authToken}` }
					}
				)
			]);

			if (!reservationsRes.ok) {
				const data = await reservationsRes.json().catch(() => ({}));
				throw new Error(data.detail || 'خطا در دریافت رزروها');
			}
			if (!ordersRes.ok) {
				const data = await ordersRes.json().catch(() => ({}));
				throw new Error(data.detail || 'خطا در دریافت سفارش‌ها');
			}

			const reservationsData = await reservationsRes.json();
			const ordersData = await ordersRes.json();

			const mappedReservations = Array.isArray(reservationsData)
				? reservationsData.map((r) => ({
						id: r.id,
						kind: 'reservation',
						reservation_type: r.reservation_type,
						date: r.date,
						time: r.time,
						status: r.status,
						number_of_people: r.number_of_people,
						resource_info:
							r.reservation_type === 'table'
								? `میز ${r.table_id ?? ''}`
								: r.reservation_type === 'coworking'
								? `میز اشتراکی ${r.table_id ?? ''}`
								: r.reservation_type === 'cinema'
								? `سینما - جلسه ${r.session_id ?? ''}`
								: r.reservation_type === 'event'
								? `رویداد ${r.event_id ?? ''}`
								: '',
						customer_name: '', // user details are not stored on reservation yet
						customer_phone: ''
				  }))
				: [];

			const mappedOrders = Array.isArray(ordersData)
				? ordersData.map((o) => ({
						id: o.id,
						kind: 'order',
						reservation_type: 'order',
						date: new Date(o.created_at).toLocaleDateString('fa-IR'),
						time: new Date(o.created_at).toLocaleTimeString('fa-IR', {
							hour: '2-digit',
							minute: '2-digit'
						}),
						status: o.status,
						number_of_people: null,
						resource_info: `سفارش محصولات (${o.items.length} آیتم)`,
						customer_name: o.customer_name || '',
						customer_phone: o.customer_phone || ''
				  }))
				: [];

			setItems([...mappedReservations, ...mappedOrders]);
		} catch (err) {
			console.error(err);
			setError(err.message || 'خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiBaseUrl, authToken, cafeId]);

	const handleUpdateStatus = async (item, newStatus) => {
		if (item.kind === 'order') {
			if (!window.confirm('آیا از تغییر وضعیت این سفارش اطمینان دارید؟')) return;
			try {
				setLoading(true);
				setError('');

				const res = await fetch(
					`${apiBaseUrl}/orders/${encodeURIComponent(
						item.id
					)}?cafe_id=${encodeURIComponent(cafeId)}&status_update=${encodeURIComponent(
						newStatus
					)}`,
					{
						method: 'PUT',
						headers: {
							Authorization: `Bearer ${authToken}`
						}
					}
				);
				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					throw new Error(data.detail || 'خطا در به‌روزرسانی سفارش');
				}
				const updated = await res.json();
				setItems((prev) =>
					prev.map((it) =>
						it.kind === 'order' && it.id === updated.id
							? { ...it, status: updated.status }
							: it
					)
				);
			} catch (err) {
				console.error(err);
				setError(err.message || 'خطا در ارتباط با سرور');
			} finally {
				setLoading(false);
			}
			return;
		}

		// reservation
		if (!window.confirm('آیا از تغییر وضعیت این رزرو اطمینان دارید؟')) return;
		try {
			setLoading(true);
			setError('');
			const res = await fetch(
				`${apiBaseUrl}/reservations/${encodeURIComponent(
					item.id
				)}?cafe_id=${encodeURIComponent(
					cafeId
				)}&status_update=${encodeURIComponent(newStatus)}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${authToken}`
					}
				}
			);
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.detail || 'خطا در به‌روزرسانی رزرو');
			}
			const updated = await res.json();
			setItems((prev) =>
				prev.map((it) =>
					it.kind === 'reservation' && it.id === updated.id
						? { ...it, status: updated.status }
						: it
				)
			);
		} catch (err) {
			console.error(err);
			setError(err.message || 'خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const filteredItems = useMemo(() => {
		return items.filter((it) => {
			if (statusFilter !== 'all' && it.status !== statusFilter) return false;
			if (typeFilter !== 'all') {
				if (typeFilter === 'order' && it.kind !== 'order') return false;
				if (typeFilter !== 'order' && it.kind === 'reservation' && it.reservation_type !== typeFilter)
					return false;
			}
			return true;
		});
	}, [items, statusFilter, typeFilter]);

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<BookOnline sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>رزروها</Typography>
			</Stack>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				مشاهده و مدیریت تمام رزروها و سفارش‌های پرداخت‌شده
			</Typography>

			<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="flex-start">
				<ToggleButtonGroup
					size="small"
					color="primary"
					value={statusFilter}
					exclusive
					onChange={(_, val) => {
						if (val !== null) setStatusFilter(val);
					}}
				>
					<ToggleButton value="all">همه وضعیت‌ها</ToggleButton>
					<ToggleButton value="pending">در انتظار</ToggleButton>
					<ToggleButton value="confirmed">تایید شده</ToggleButton>
					<ToggleButton value="completed">انجام شده</ToggleButton>
					<ToggleButton value="cancelled">لغو شده</ToggleButton>
				</ToggleButtonGroup>

				<ToggleButtonGroup
					size="small"
					color="primary"
					value={typeFilter}
					exclusive
					onChange={(_, val) => {
						if (val !== null) setTypeFilter(val);
					}}
				>
					<ToggleButton value="all">همه انواع</ToggleButton>
					<ToggleButton value="table">میز</ToggleButton>
					<ToggleButton value="coworking">فضای مشترک</ToggleButton>
					<ToggleButton value="cinema">سینما</ToggleButton>
					<ToggleButton value="event">رویداد</ToggleButton>
					<ToggleButton value="order">سفارش محصولات</ToggleButton>
				</ToggleButtonGroup>
			</Stack>
			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}
			<Card elevation={3} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 3 }}>
					<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
						<Stack direction="row" alignItems="center" spacing={1}>
							<BookOnline color="primary" />
							<Typography variant="h6" sx={{ fontWeight: 'bold' }}>لیست رزروها و سفارش‌ها</Typography>
							<Chip label={filteredItems.length} color="primary" size="small" />
						</Stack>
					</Stack>
					<Divider sx={{ mb: 2 }} />
					{loading && (
						<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
							<CircularProgress />
						</Box>
					)}
					{!loading && filteredItems.length === 0 ? (
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
								رزرو یا سفارشی برای نمایش وجود ندارد.
							</Typography>
						</Paper>
					) : (
						<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
							<Table>
								<TableHead>
									<TableRow sx={{ bgcolor: 'grey.100' }}>
										<TableCell sx={{ fontWeight: 'bold' }}>نوع</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>جزئیات</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>تعداد نفرات</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>تاریخ و زمان</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredItems.map((item) => (
										<TableRow key={`${item.kind}-${item.id}`} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
											<TableCell>
												<Chip
													label={getTypeLabel(item.reservation_type, item.kind)}
													size="small"
													color={item.kind === 'order' ? 'secondary' : 'primary'}
												/>
											</TableCell>
											<TableCell>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>
													{item.resource_info}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{item.number_of_people != null ? `${item.number_of_people} نفر` : '-'}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">{item.date}</Typography>
												<Typography variant="caption" color="text.secondary">
													{item.time}
												</Typography>
											</TableCell>
											<TableCell>
												<Chip
													label={getStatusLabel(item.status)}
													color={getStatusColor(item.status)}
													size="small"
												/>
											</TableCell>
											<TableCell align="right">
												<Stack direction="row" spacing={1} justifyContent="flex-end">
													{item.status !== 'confirmed' && item.status !== 'cancelled' && (
														<Button
															variant="outlined"
															size="small"
															startIcon={<CheckCircle />}
															onClick={() => handleUpdateStatus(item, 'confirmed')}
															disabled={loading}
															sx={{ borderRadius: 2 }}
														>
															تایید
														</Button>
													)}
													{item.status !== 'cancelled' && (
														<Button
															variant="outlined"
															color="error"
															size="small"
															startIcon={<Cancel />}
															onClick={() => handleUpdateStatus(item, 'cancelled')}
															disabled={loading}
															sx={{ borderRadius: 2 }}
														>
															رد / لغو
														</Button>
													)}
												</Stack>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Paper>
					)}
				</CardContent>
			</Card>
		</Box>
	);
};

export default Reservations;
