import { useEffect, useState } from 'react';
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
	ToggleButtonGroup,
	ToggleButton,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Alert,
	CircularProgress,
	IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const reasons = ['خدمت عالی', 'تاخیر در ورود', 'شکایت مشتری', 'اضافه‌کاری', 'رفتار مناسب', 'رعایت قوانین'];

const RewardsPenalties = () => {
	const { apiBaseUrl, token } = useAuth();
	const [employees, setEmployees] = useState([]);
	const [rewards, setRewards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [form, setForm] = useState({
		employee_id: '',
		title: '',
		reason: '',
		amount: 0,
		reward_type: 'bonus',
		date: new Date().toISOString().split('T')[0],
		note: ''
	});

	useEffect(() => {
		if (token) {
			fetchEmployees();
			fetchRewards();
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
			console.error(err);
		}
	};

	const fetchRewards = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/rewards`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری پاداش/جریمه‌ها');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setRewards(data);
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
			const res = await fetch(`${apiBaseUrl}/rewards`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(form)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در ثبت پاداش/جریمه');
				setSaving(false);
				return;
			}
			setRewards((prev) => [data, ...prev]);
			setForm({
				employee_id: '',
				title: '',
				reason: '',
				amount: 0,
				reward_type: 'bonus',
				date: new Date().toISOString().split('T')[0],
				note: ''
			});
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('حذف این رکورد؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/rewards/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف ناموفق بود');
				return;
			}
			setRewards((prev) => prev.filter((r) => r.id !== id));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const getEmployeeName = (id) => {
		const emp = employees.find((e) => e.id === id);
		return emp ? `${emp.firstName} ${emp.lastName}` : 'نامشخص';
	};

	return (
		<Box>
			<Typography variant="h4" gutterBottom>پاداش و جریمه</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12} md={5}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>ثبت پاداش/جریمه</Typography>
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
													{`${e.firstName} ${e.lastName}`}
												</MenuItem>
											))
										)}
									</TextField>
									<TextField
										select
										label="دلیل"
										fullWidth
										value={form.reason}
										onChange={handleChange('reason')}
										SelectProps={{ displayEmpty: true }}
										placeholder="انتخاب دلیل"
									>
										<MenuItem value="">-</MenuItem>
										{reasons.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
									</TextField>
									<TextField
										label="عنوان (اختیاری)"
										fullWidth
										value={form.title}
										onChange={handleChange('title')}
									/>
									<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
										<TextField
											label="مبلغ"
											type="number"
											fullWidth
											required
											value={form.amount}
											onChange={handleChange('amount')}
											inputProps={{ min: 0, step: 0.01 }}
										/>
										<ToggleButtonGroup
											exclusive
											value={form.reward_type}
											onChange={(_, val) => val && setForm((p) => ({ ...p, reward_type: val }))}
										>
											<ToggleButton value="bonus">پاداش</ToggleButton>
											<ToggleButton value="penalty">جریمه</ToggleButton>
										</ToggleButtonGroup>
									</Stack>
									<TextField
										type="date"
										label="تاریخ"
										fullWidth
										value={form.date}
										onChange={handleChange('date')}
										InputLabelProps={{ shrink: true }}
									/>
									<TextField
										label="توضیحات (اختیاری)"
										fullWidth
										multiline
										minRows={2}
										value={form.note}
										onChange={handleChange('note')}
									/>
									<Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
										{saving && <CircularProgress size={22} />}
										<Button
											type="submit"
											variant="contained"
											disabled={saving || !form.employee_id || form.amount < 0}
											sx={{ backgroundColor: 'var(--color-accent)' }}
										>
											ثبت
										</Button>
									</Stack>
								</Stack>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={7}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>سوابق پاداش/جریمه</Typography>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : rewards.length === 0 ? (
								<Typography variant="body2" color="text.secondary">رکوردی ثبت نشده است.</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>کارمند</TableCell>
											<TableCell>نوع</TableCell>
											<TableCell>مبلغ</TableCell>
											<TableCell>دلیل/عنوان</TableCell>
											<TableCell>تاریخ</TableCell>
											<TableCell align="right">حذف</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{rewards.map((r) => (
											<TableRow key={r.id} hover>
												<TableCell>{getEmployeeName(r.employee_id)}</TableCell>
												<TableCell>{r.reward_type === 'bonus' ? 'پاداش' : 'جریمه'}</TableCell>
												<TableCell>{r.amount}</TableCell>
												<TableCell>{r.title || r.reason || '-'}</TableCell>
												<TableCell>{r.date || '-'}</TableCell>
												<TableCell align="right">
													<IconButton color="error" size="small" onClick={() => handleDelete(r.id)}>
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

export default RewardsPenalties;
