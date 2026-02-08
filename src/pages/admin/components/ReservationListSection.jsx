import { useEffect, useMemo, useState } from 'react';
import {
	Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
	TableBody, Paper, Chip, Button, Stack, CircularProgress, Alert
} from '@mui/material';
import { CheckCircle, Close, Cancel } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

/**
 * Reusable reservation list for a specific type (cinema, event, coworking).
 * Used in CinemaManagement, EventsManagement, CoworkingManagement.
 */
const ReservationListSection = ({ reservationType, typeLabel, getResourceInfo }) => {
	const { apiBaseUrl, token, user } = useAuth();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const authToken = token || localStorage.getItem('authToken');
	const cafeId = user?.cafe_id;
	const queryParams = new URLSearchParams();
	if (cafeId) queryParams.set('cafe_id', cafeId);
	queryParams.set('reservation_type', reservationType);
	const queryString = queryParams.toString();
	const urlSuffix = queryString ? `?${queryString}` : '';

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed': return 'success';
			case 'pending':
			case 'pending_approval': return 'warning';
			case 'completed': return 'default';
			case 'cancelled':
			case 'rejected': return 'error';
			default: return 'default';
		}
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case 'confirmed': return 'تایید شده';
			case 'pending':
			case 'pending_approval': return 'در انتظار تایید';
			case 'completed': return 'انجام شده';
			case 'cancelled': return 'لغو شده';
			case 'rejected': return 'رد شده';
			default: return status || 'نامشخص';
		}
	};

	const fetchData = async () => {
		if (!authToken) return;
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/reservations${urlSuffix}`, {
				headers: { Authorization: `Bearer ${authToken}` }
			});
			if (!res.ok) throw new Error('خطا در دریافت رزروها');
			const data = await res.json();
			setItems(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(err.message || 'خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [apiBaseUrl, authToken, cafeId, reservationType]);

	const handleUpdateStatus = async (item, newStatus) => {
		const itemCafeId = item.cafe_id ?? cafeId;
		if (!itemCafeId) return;
		setLoading(true);
		setError('');
		try {
			const res = await fetch(
				`${apiBaseUrl}/reservations/${item.id}?cafe_id=${encodeURIComponent(itemCafeId)}&status_update=${encodeURIComponent(newStatus)}`,
				{ method: 'PUT', headers: { Authorization: `Bearer ${authToken}` } }
			);
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.detail || 'خطا در به‌روزرسانی');
			}
			setItems((prev) =>
				prev.map((it) => (it.id === item.id ? { ...it, status: newStatus } : it))
			);
		} catch (err) {
			setError(err.message || 'خطا');
		} finally {
			setLoading(false);
		}
	};

	if (!authToken) return null;

	return (
		<Card sx={{ mt: 3 }}>
			<CardContent>
				<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
					رزروهای {typeLabel}
				</Typography>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
						{error}
					</Alert>
				)}
				{loading && items.length === 0 ? (
					<Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
						<CircularProgress />
					</Box>
				) : items.length === 0 ? (
					<Typography color="text.secondary">رزروی برای نمایش وجود ندارد.</Typography>
				) : (
					<Paper elevation={0} sx={{ overflow: 'hidden' }}>
						<Table size="small">
							<TableHead>
								<TableRow sx={{ bgcolor: 'grey.100' }}>
									<TableCell sx={{ fontWeight: 'bold' }}>جزئیات</TableCell>
									<TableCell sx={{ fontWeight: 'bold' }}>تاریخ و زمان</TableCell>
									<TableCell sx={{ fontWeight: 'bold' }}>تعداد نفرات</TableCell>
									<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
									<TableCell align="right" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{items.map((item) => (
									<TableRow key={item.id} hover>
										<TableCell>
											<Typography variant="body2">{getResourceInfo ? getResourceInfo(item) : item.table_id || item.session_id || '-'}</Typography>
										</TableCell>
										<TableCell>
											<Typography variant="body2">{item.date}</Typography>
											<Typography variant="caption" color="text.secondary">{item.time}</Typography>
										</TableCell>
										<TableCell>{item.number_of_people || '-'} نفر</TableCell>
										<TableCell>
											<Chip label={getStatusLabel(item.status)} color={getStatusColor(item.status)} size="small" />
										</TableCell>
										<TableCell align="right">
											<Stack direction="row" spacing={1} justifyContent="flex-end">
												{(item.status === 'pending_approval' || item.status === 'pending') && (
													<>
														<Button size="small" variant="outlined" startIcon={<CheckCircle />} onClick={() => handleUpdateStatus(item, 'confirmed')} disabled={loading}>
															تایید
														</Button>
														<Button size="small" variant="outlined" color="error" startIcon={<Close />} onClick={() => handleUpdateStatus(item, 'rejected')} disabled={loading}>
															رد
														</Button>
													</>
												)}
												{item.status !== 'cancelled' && item.status !== 'rejected' && (item.status === 'confirmed' || item.status === 'completed') && (
													<Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => handleUpdateStatus(item, 'cancelled')} disabled={loading}>
														لغو
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
	);
};

export default ReservationListSection;
