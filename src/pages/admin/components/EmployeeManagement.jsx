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
	CircularProgress
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const roles = [
	{ value: 'waiter', label: 'گارسون' },
	{ value: 'floor_staff', label: 'پرسنل سالن' },
	{ value: 'bartender', label: 'باریستا' }
];

const EmployeeManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [form, setForm] = useState({
		nationalId: '',
		phone: '',
		firstName: '',
		lastName: '',
		role: 'waiter'
	});

	useEffect(() => {
		if (token) fetchEmployees();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchEmployees = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری کارکنان');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setEmployees(data);
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

	const handleAdd = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(form)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در افزودن کارمند');
				setSaving(false);
				return;
			}
			setEmployees((prev) => [data, ...prev]);
			setForm({
				nationalId: '',
				phone: '',
				firstName: '',
				lastName: '',
				role: 'waiter'
			});
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('آیا از حذف این کارمند اطمینان دارید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف کارمند ناموفق بود');
				return;
			}
			setEmployees((prev) => prev.filter((e) => e.id !== id));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const handleToggle = async (id, is_active) => {
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees/${id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ is_active })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || 'بروزرسانی وضعیت ناموفق بود');
				return;
			}
			setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت کارکنان</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>افزودن کارمند جدید</Typography>
							<Box component="form" onSubmit={handleAdd}>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											label="کد ملی"
											fullWidth
											value={form.nationalId}
											onChange={handleChange('nationalId')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="شماره تماس"
											fullWidth
											value={form.phone}
											onChange={handleChange('phone')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="نام"
											fullWidth
											value={form.firstName}
											onChange={handleChange('firstName')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="نام خانوادگی"
											fullWidth
											value={form.lastName}
											onChange={handleChange('lastName')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											select
											label="نقش"
											fullWidth
											value={form.role}
											onChange={handleChange('role')}
											required
											disabled={saving}
										>
											{roles.map((r) => (
												<MenuItem key={r.value} value={r.value}>
													{r.label}
												</MenuItem>
											))}
										</TextField>
									</Grid>
									<Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
										{saving && <CircularProgress size={22} />}
										<Button
											type="submit"
											variant="contained"
											sx={{ borderRadius: 999, px: 4, backgroundColor: 'var(--color-accent)' }}
											disabled={saving || !form.nationalId || !form.phone || !form.firstName || !form.lastName}
										>
											افزودن
										</Button>
									</Grid>
								</Grid>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6">لیست کارکنان</Typography>
								{loading && <CircularProgress size={22} />}
							</Stack>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : employees.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									کارمندی ثبت نشده است.
								</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>کد ملی</TableCell>
											<TableCell>نام و نام خانوادگی</TableCell>
											<TableCell>شماره تماس</TableCell>
											<TableCell>نقش</TableCell>
											<TableCell>وضعیت</TableCell>
											<TableCell align="right">حذف</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{employees.map((e) => (
											<TableRow key={e.id}>
												<TableCell>{e.nationalId}</TableCell>
												<TableCell>{`${e.firstName} ${e.lastName}`}</TableCell>
												<TableCell>{e.phone}</TableCell>
												<TableCell>
													<Chip size="small" label={roles.find((r) => r.value === e.role)?.label || e.role} />
												</TableCell>
												<TableCell>
													<Stack direction="row" alignItems="center" spacing={1}>
														<Typography variant="body2">غیرفعال</Typography>
														<Switch
															checked={e.is_active}
															onChange={(ev) => handleToggle(e.id, ev.target.checked)}
															color="success"
														/>
														<Typography variant="body2">فعال</Typography>
													</Stack>
												</TableCell>
												<TableCell align="right">
													<IconButton color="error" onClick={() => handleDelete(e.id)}>
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

export default EmployeeManagement;
