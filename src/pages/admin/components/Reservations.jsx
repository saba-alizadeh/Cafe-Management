import { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Chip, Stack, Divider, CircularProgress, IconButton, Button, Alert } from '@mui/material';
import { TableRestaurant, Person, People, BookOnline, Cancel } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const Reservations = () => {
	const { apiBaseUrl, token } = useAuth();
	const [reservations, setReservations] = useState([
		{
			id: 1,
			table: { name: 'میز ۵', number: 5, capacity: 4, location: 'سالن اصلی' },
			people: 2,
			customer: { username: 'customer1', name: 'مهدی احمدی', phone: '09123456789' },
			date: '1403/10/15',
			time: '10:30',
			status: 'confirmed'
		},
		{
			id: 2,
			table: { name: 'میز ۲', number: 2, capacity: 2, location: 'تراس' },
			people: 2,
			customer: { username: 'customer2', name: 'ندا رضایی', phone: '09123456790' },
			date: '1403/10/15',
			time: '12:00',
			status: 'confirmed'
		},
		{
			id: 3,
			table: { name: 'میز ۸', number: 8, capacity: 6, location: 'سالن اصلی' },
			people: 4,
			customer: { username: 'customer3', name: 'آرمان کریمی', phone: '09123456791' },
			date: '1403/10/16',
			time: '14:00',
			status: 'pending'
		},
		{
			id: 4,
			table: { name: 'میز ۳', number: 3, capacity: 4, location: 'سالن اصلی' },
			people: 3,
			customer: { username: 'customer4', name: 'لاله محمدی', phone: '09123456792' },
			date: '1403/10/17',
			time: '13:00',
			status: 'cancelled'
		}
	];

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed':
				return 'success';
			case 'pending':
				return 'warning';
			case 'cancelled':
				return 'error';
			default:
				return 'default';
		}
	};

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const getStatusLabel = (status) => {
		switch (status) {
			case 'confirmed':
				return 'تأیید شده';
			case 'pending':
				return 'در انتظار';
			case 'cancelled':
				return 'لغو شده';
			default:
				return status;
		}
	};

	const handleCancel = async (reservationId) => {
		if (!window.confirm('آیا از لغو این رزرو اطمینان دارید؟')) return;
		
		setLoading(true);
		setError('');
		try {
			// TODO: Replace with actual API endpoint when available
			// const res = await fetch(`${apiBaseUrl}/reservations/${reservationId}/cancel`, {
			// 	method: 'PUT',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		Authorization: `Bearer ${token}`
			// 	}
			// });
			// if (!res.ok) {
			// 	const data = await res.json().catch(() => ({}));
			// 	setError(data.detail || 'خطا در لغو رزرو');
			// 	setLoading(false);
			// 	return;
			// }
			// const data = await res.json();
			
			// For now, update local state
			setReservations((prev) =>
				prev.map((r) =>
					r.id === reservationId ? { ...r, status: 'cancelled' } : r
				)
			);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<BookOnline sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>رزروها</Typography>
			</Stack>
			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
				مشاهده و مدیریت رزروهای میزها
			</Typography>
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
							<Typography variant="h6" sx={{ fontWeight: 'bold' }}>لیست رزروها</Typography>
							<Chip label={reservations.length} color="primary" size="small" />
						</Stack>
					</Stack>
					<Divider sx={{ mb: 2 }} />
					{reservations.length === 0 ? (
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
								رزروی ثبت نشده است.
							</Typography>
						</Paper>
					) : (
						<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
							<Table>
									<TableHead>
									<TableRow sx={{ bgcolor: 'grey.100' }}>
										<TableCell sx={{ fontWeight: 'bold' }}>جزئیات میز</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>تعداد نفرات</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>نام کاربری مشتری</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>نام مشتری</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>تاریخ و زمان</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
										<TableCell align="right" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{reservations.map((reservation) => (
										<TableRow key={reservation.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
											<TableCell>
												<Stack direction="row" alignItems="center" spacing={1}>
													<TableRestaurant color="primary" fontSize="small" />
													<Box>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{reservation.table.name}
														</Typography>
														<Typography variant="caption" color="text.secondary">
															ظرفیت: {reservation.table.capacity} نفر • {reservation.table.location}
														</Typography>
													</Box>
												</Stack>
											</TableCell>
											<TableCell>
												<Stack direction="row" alignItems="center" spacing={1}>
													<People color="action" fontSize="small" />
													<Typography variant="body2">{reservation.people} نفر</Typography>
												</Stack>
											</TableCell>
											<TableCell>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>
													{reservation.customer.username}
												</Typography>
											</TableCell>
											<TableCell>
												<Stack direction="row" alignItems="center" spacing={1}>
													<Person color="action" fontSize="small" />
													<Box>
														<Typography variant="body2">{reservation.customer.name}</Typography>
														<Typography variant="caption" color="text.secondary">
															{reservation.customer.phone}
														</Typography>
													</Box>
												</Stack>
											</TableCell>
											<TableCell>
												<Typography variant="body2">{reservation.date}</Typography>
												<Typography variant="caption" color="text.secondary">
													{reservation.time}
												</Typography>
											</TableCell>
											<TableCell>
												<Chip
													label={getStatusLabel(reservation.status)}
													color={getStatusColor(reservation.status)}
													size="small"
												/>
											</TableCell>
											<TableCell align="right">
												{reservation.status !== 'cancelled' && (
													<Button
														variant="outlined"
														color="error"
														size="small"
														startIcon={<Cancel />}
														onClick={() => handleCancel(reservation.id)}
														disabled={loading}
														sx={{ borderRadius: 2 }}
													>
														لغو
													</Button>
												)}
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
