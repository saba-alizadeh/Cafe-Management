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
	Paper
} from '@mui/material';
import { Delete } from '@mui/icons-material';
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
		<Box>
			<Typography variant="h4" gutterBottom>زمان‌بندی شیفت</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>تعریف/ویرایش شیفت</Typography>
							<Box component="form" onSubmit={handleSubmit}>
								<Stack spacing={2}>
									<TextField
										select
										label="کارمند"
										fullWidth
										value={form.employee_id}
										onChange={handleChange('employee_id')}
										required
										disabled={saving || employees.length === 0}
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
										/>
									</Stack>
									<Stack direction="row" spacing={1} justifyContent="flex-end">
										{saving && <CircularProgress size={22} />}
										<Button
											type="submit"
											variant="contained"
											disabled={saving || !form.employee_id}
											sx={{ borderRadius: 999, px: 4, backgroundColor: 'var(--color-accent)' }}
										>
											ذخیره شیفت
										</Button>
									</Stack>
								</Stack>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>شیفت‌های فعلی</Typography>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : shifts.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									هیچ شیفتی ثبت نشده است.
								</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>کارمند</TableCell>
											<TableCell>تاریخ</TableCell>
											<TableCell>ساعت</TableCell>
											<TableCell align="right">حذف</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{shifts.map((shift) => (
											<TableRow key={shift.id} hover>
												<TableCell>{getEmployeeName(shift.employee_id)}</TableCell>
												<TableCell>{shift.date}</TableCell>
												<TableCell>
													{shift.start_time} - {shift.end_time}
												</TableCell>
												<TableCell align="right">
													<IconButton
														size="small"
														color="error"
														onClick={() => handleDelete(shift.id)}
													>
														<Delete />
													</IconButton>
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

export default ShiftScheduling;
