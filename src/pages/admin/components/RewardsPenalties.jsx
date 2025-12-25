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
	IconButton,
	Chip,
	Paper,
	Divider
} from '@mui/material';
import { Delete, EmojiEvents, Add, TrendingUp, TrendingDown, Edit } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const reasons = ['خدمت عالی', 'تاخیر در ورود', 'شکایت مشتری', 'اضافه‌کاری', 'رفتار مناسب', 'رعایت قوانین'];

const RewardsPenalties = () => {
	const { apiBaseUrl, token } = useAuth();
	const [employees, setEmployees] = useState([]);
	const [rewards, setRewards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [editingReward, setEditingReward] = useState(null);
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
			const url = editingReward
				? `${apiBaseUrl}/rewards/${editingReward.id}`
				: `${apiBaseUrl}/rewards`;
			const method = editingReward ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
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
			if (editingReward) {
				setRewards((prev) => prev.map((r) => (r.id === editingReward.id ? data : r)));
				setEditingReward(null);
			} else {
				setRewards((prev) => [data, ...prev]);
			}
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

	const handleEdit = (reward) => {
		setEditingReward(reward);
		setForm({
			employee_id: reward.employee_id,
			title: reward.title || '',
			reason: reward.reason || '',
			amount: reward.amount,
			reward_type: reward.reward_type,
			date: reward.date,
			note: reward.note || ''
		});
	};

	const handleCancelEdit = () => {
		setEditingReward(null);
		setForm({
			employee_id: '',
			title: '',
			reason: '',
			amount: 0,
			reward_type: 'bonus',
			date: new Date().toISOString().split('T')[0],
			note: ''
		});
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
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<EmojiEvents sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>پاداش و جریمه</Typography>
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
								{editingReward ? <Edit color="primary" /> : <Add color="primary" />}
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
									{editingReward ? 'ویرایش پاداش/جریمه' : 'ثبت پاداش/جریمه'}
								</Typography>
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
										variant="outlined"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: 2
											}
										}}
									>
										<MenuItem value="">انتخاب دلیل</MenuItem>
										{reasons.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
									</TextField>
									<TextField
										label="عنوان (اختیاری)"
										fullWidth
										value={form.title}
										onChange={handleChange('title')}
										variant="outlined"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: 2
											}
										}}
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
											variant="outlined"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2
												}
											}}
										/>
										<ToggleButtonGroup
											exclusive
											value={form.reward_type}
											onChange={(_, val) => val && setForm((p) => ({ ...p, reward_type: val }))}
											sx={{ borderRadius: 2 }}
										>
											<ToggleButton value="bonus" sx={{ borderRadius: 2 }}>
												<Stack direction="row" spacing={1} alignItems="center">
													<TrendingUp fontSize="small" />
													<span>پاداش</span>
												</Stack>
											</ToggleButton>
											<ToggleButton value="penalty" sx={{ borderRadius: 2 }}>
												<Stack direction="row" spacing={1} alignItems="center">
													<TrendingDown fontSize="small" />
													<span>جریمه</span>
												</Stack>
											</ToggleButton>
										</ToggleButtonGroup>
									</Stack>
									<TextField
										type="date"
										label="تاریخ"
										fullWidth
										value={form.date}
										onChange={handleChange('date')}
										InputLabelProps={{ shrink: true }}
										variant="outlined"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: 2
											}
										}}
									/>
									<TextField
										label="توضیحات (اختیاری)"
										fullWidth
										multiline
										minRows={3}
										value={form.note}
										onChange={handleChange('note')}
										variant="outlined"
										sx={{
											'& .MuiOutlinedInput-root': {
												borderRadius: 2
											}
										}}
									/>
									<Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
										{saving && <CircularProgress size={22} />}
										{editingReward && (
											<Button
												variant="outlined"
												onClick={handleCancelEdit}
												disabled={saving}
												sx={{ borderRadius: 2, py: 1.5, px: 3 }}
											>
												لغو
											</Button>
										)}
										<Button
											type="submit"
											variant="contained"
											disabled={saving || !form.employee_id || form.amount < 0}
											startIcon={saving ? <CircularProgress size={20} color="inherit" /> : editingReward ? <Edit /> : <Add />}
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
											{editingReward ? 'ذخیره تغییرات' : 'ثبت'}
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
									<EmojiEvents color="primary" />
									<Typography variant="h6" sx={{ fontWeight: 'bold' }}>سوابق پاداش/جریمه</Typography>
									<Chip label={rewards.length} color="primary" size="small" />
								</Stack>
								{loading && <CircularProgress size={24} />}
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{loading ? (
								<Box display="flex" justifyContent="center" p={4}>
									<CircularProgress />
								</Box>
							) : rewards.length === 0 ? (
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
										رکوردی ثبت نشده است.
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>کارمند</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>نوع</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>مبلغ</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>دلیل/عنوان</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>تاریخ</TableCell>
												<TableCell align="right" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{rewards.map((r) => (
												<TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>{getEmployeeName(r.employee_id)}</TableCell>
													<TableCell>
														<Chip
															label={r.reward_type === 'bonus' ? 'پاداش' : 'جریمه'}
															color={r.reward_type === 'bonus' ? 'success' : 'error'}
															size="small"
															icon={r.reward_type === 'bonus' ? <TrendingUp /> : <TrendingDown />}
														/>
													</TableCell>
													<TableCell>
														<Typography
															variant="body2"
															sx={{
																fontWeight: 'bold',
																color: r.reward_type === 'bonus' ? 'success.main' : 'error.main'
															}}
														>
															{r.amount.toLocaleString('fa-IR')} تومان
														</Typography>
													</TableCell>
													<TableCell>{r.title || r.reason || '-'}</TableCell>
													<TableCell>{r.date || '-'}</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={1} justifyContent="flex-end">
															<IconButton size="small" onClick={() => handleEdit(r)}>
																<Edit />
															</IconButton>
															<IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
																<Delete />
															</IconButton>
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
				</Grid>
			</Grid>
		</Box>
	);
};

export default RewardsPenalties;
