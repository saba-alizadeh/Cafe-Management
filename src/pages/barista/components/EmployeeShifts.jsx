import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Paper,
	Chip,
	Stack,
	Divider,
	CircularProgress,
	Alert
} from '@mui/material';
import { Schedule, AccessTime } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const EmployeeShifts = () => {
	const { apiBaseUrl, token, user } = useAuth();
	const [shifts, setShifts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (token && user) {
			fetchShifts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl, user]);

	const fetchShifts = async () => {
		setLoading(true);
		setError('');
		try {
			// TODO: Replace with actual employee shifts endpoint when available
			// For now, try to get all shifts and filter by employee_id
			// This requires the backend to have an endpoint like: /api/shifts/my-shifts
			const res = await fetch(`${apiBaseUrl}/shifts`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			if (!res.ok) {
				// If admin-only endpoint fails, try employee-specific endpoint
				const employeeRes = await fetch(`${apiBaseUrl}/shifts/my-shifts`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (employeeRes.ok) {
					const data = await employeeRes.json();
					setShifts(data);
					setLoading(false);
					return;
				}
				
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری شیفت‌ها');
				setLoading(false);
				return;
			}
			
			const allShifts = await res.json();
			// Filter shifts for current employee (if user has employee_id)
			// This is a workaround until employee-specific endpoint is available
			const employeeShifts = user?.employee_id 
				? allShifts.filter(s => s.employee_id === user.employee_id)
				: allShifts;
			setShifts(employeeShifts);
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
				<Schedule sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>شیفت‌های من</Typography>
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
							<Schedule color="primary" />
							<Typography variant="h6" sx={{ fontWeight: 'bold' }}>لیست شیفت‌ها</Typography>
							<Chip label={shifts.length} color="primary" size="small" />
						</Stack>
						{loading && <CircularProgress size={24} />}
					</Stack>
					<Divider sx={{ mb: 2 }} />
					{loading ? (
						<Box display="flex" justifyContent="center" p={4}>
							<CircularProgress />
						</Box>
					) : shifts.length === 0 ? (
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
								هیچ شیفتی برای شما ثبت نشده است.
							</Typography>
						</Paper>
					) : (
						<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
							<Table>
								<TableHead>
									<TableRow sx={{ bgcolor: 'grey.100' }}>
										<TableCell sx={{ fontWeight: 'bold' }}>تاریخ</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>ساعت شروع</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>ساعت پایان</TableCell>
										<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{shifts.map((shift) => {
										const shiftDate = new Date(shift.date);
										const today = new Date();
										today.setHours(0, 0, 0, 0);
										const isPast = shiftDate < today;
										const isToday = shiftDate.toDateString() === today.toDateString();
										
										return (
											<TableRow key={shift.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
												<TableCell>
													<Chip 
														label={shift.date} 
														size="small" 
														variant="outlined"
														color={isToday ? 'primary' : isPast ? 'default' : 'success'}
													/>
												</TableCell>
												<TableCell>
													<Stack direction="row" alignItems="center" spacing={1}>
														<AccessTime fontSize="small" color="action" />
														<Typography variant="body2">{shift.start_time}</Typography>
													</Stack>
												</TableCell>
												<TableCell>
													<Stack direction="row" alignItems="center" spacing={1}>
														<AccessTime fontSize="small" color="action" />
														<Typography variant="body2">{shift.end_time}</Typography>
													</Stack>
												</TableCell>
												<TableCell>
													<Chip
														label={isPast ? 'گذشته' : isToday ? 'امروز' : 'آینده'}
														color={isPast ? 'default' : isToday ? 'primary' : 'success'}
														size="small"
													/>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</Paper>
					)}
				</CardContent>
			</Card>
		</Box>
	);
};

export default EmployeeShifts;

