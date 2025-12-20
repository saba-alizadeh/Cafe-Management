import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	TextField,
	Button,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	Alert,
	CircularProgress,
	Paper,
	Chip,
	Divider
} from '@mui/material';
import { Delete, Schedule, Add, AccessTime } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const ShiftScheduling = () => {
	const { apiBaseUrl, token } = useAuth();
	const [employees, setEmployees] = useState([]);
	const [shifts, setShifts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [form, setForm] = useState({
		employee_id: '',
		date: new Date().toISOString().split('T')[0],
		start_time: '09:00',
		end_time: '17:00'
	});

	useEffect(() => {
		if (token) {
			fetchEmployees();
			fetchShifts();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchEmployees = async () => {
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				setEmployees(data);
			}
		} catch (err) {
			console.error('Error fetching employees:', err);
		}
	};

	const fetchShifts = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/shifts`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری شیفت‌ها');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setShifts(data);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field) => (e) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }));
		if (error) setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.employee_id) {
			setError('لطفاً کارمند را انتخاب کنید');
			return;
		}
		setSaving(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/shifts`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(form)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در ذخیره شیفت');
				setSaving(false);
				return;
			}
			setShifts((prev) => [data, ...prev]);
			setForm({
				employee_id: '',
				date: new Date().toISOString().split('T')[0],
				start_time: '09:00',
				end_time: '17:00'
			});
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (shiftId) => {
		if (!window.confirm('آیا از حذف این شیفت اطمینان دارید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/shifts/${shiftId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف شیفت ناموفق بود');
				return;
			}
			setShifts((prev) => prev.filter((s) => s.id !== shiftId));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const getEmployeeName = (employeeId) => {
		const emp = employees.find((e) => e.id === employeeId);
		return emp ? `${emp.firstName} ${emp.lastName}` : 'نامشخص';
	};

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<Schedule sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>زمان‌بندی شیفت</Typography>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}

			<Grid container spacing={3}>
				<Grid item xs={12} md={5}>
					<Card elevation={3} sx={{ borderRadius: 3, height: 'fit-content' }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<Add color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>تعریف شیفت جدید</Typography>
							</Stack>
							<Box component="form" onSubmit={handleSubmit}>
								<Stack spacing={2.5}>
									<TextField
										select
										label="کارمند"
										fullWidth
										value={form.employee_id}
										onChange={handleChange('employee_id')}
										required
										disabled={saving || employees.length === 0}
										variant="outlined"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: 2
											}
										}}
									>
										{employees.length === 0 ? (
											<MenuItem disabled>کارمندی یافت نشد</MenuItem>
										) : (
											employees.map((e) => (
												<MenuItem key={e.id} value={e.id}>
													{`${e.firstName} ${e.lastName} - ${e.role === 'waiter' ? 'گارسون' : e.role === 'floor_staff' ? 'پرسنل سالن' : 'باریستا'}`}
												</MenuItem>
											))
										)}
									</TextField>
									<TextField
										type="date"
										label="تاریخ"
										fullWidth
										value={form.date}
										onChange={handleChange('date')}
										required
										disabled={saving}
										InputLabelProps={{ shrink: true }}
										variant="outlined"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: 2
											}
										}}
									/>
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
										<TextField
											type="time"
											label="ساعت شروع"
											InputLabelProps={{ shrink: true }}
											fullWidth
											value={form.start_time}
											onChange={handleChange('start_time')}
											required
											disabled={saving}
											variant="outlined"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2
												}
											}}
										/>
										<TextField
											type="time"
											label="ساعت پایان"
											InputLabelProps={{ shrink: true }}
											fullWidth
											value={form.end_time}
											onChange={handleChange('end_time')}
											required
											disabled={saving}
											variant="outlined"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2
												}
											}}
										/>
									</Stack>
									<Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
										{saving && <CircularProgress size={22} />}
										<Button
											type="submit"
											variant="contained"
											disabled={saving || !form.employee_id}
											startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Add />}
											sx={{
												borderRadius: 2,
												py: 1.5,
												px: 3,
												backgroundColor: 'var(--color-accent)',
												'&:hover': {
													backgroundColor: 'var(--color-accent)',
													opacity: 0.9
												}
											}}
										>
											ذخیره شیفت
										</Button>
									</Stack>
								</Stack>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={7}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<Schedule color="primary" />
									<Typography variant="h6" sx={{ fontWeight: 'bold' }}>شیفت‌های فعلی</Typography>
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
										هیچ شیفتی ثبت نشده است.
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>کارمند</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>تاریخ</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>ساعت</TableCell>
												<TableCell align="right" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{shifts.map((shift) => (
												<TableRow key={shift.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{getEmployeeName(shift.employee_id)}
														</Typography>
													</TableCell>
													<TableCell>
														<Chip label={shift.date} size="small" variant="outlined" />
													</TableCell>
													<TableCell>
														<Stack direction="row" alignItems="center" spacing={1}>
															<AccessTime fontSize="small" color="action" />
															<Typography variant="body2">
																{shift.start_time} - {shift.end_time}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell align="right">
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDelete(shift.id)}
															sx={{
																bgcolor: 'error.light',
																'&:hover': { bgcolor: 'error.main' }
															}}
														>
															<Delete fontSize="small" />
														</IconButton>
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

export default ShiftScheduling;
