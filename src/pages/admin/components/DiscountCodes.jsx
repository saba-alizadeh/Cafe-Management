import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	TextField,
	Button,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	Alert,
	CircularProgress,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Divider,
	Paper
} from '@mui/material';
import { Delete, Edit, Percent, Add } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const DiscountCodes = () => {
	const { apiBaseUrl, token } = useAuth();
	const [codes, setCodes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [editingCode, setEditingCode] = useState(null);
	const [form, setForm] = useState({
		code: '',
		percent: 10,
		max_uses: null,
		is_active: true
	});

	useEffect(() => {
		if (token) fetchCodes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchCodes = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/discounts`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری کدهای تخفیف');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setCodes(data);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (code = null) => {
		if (code) {
			setEditingCode(code);
			setForm({
				code: code.code,
				percent: code.percent,
				max_uses: code.max_uses || null,
				is_active: code.is_active
			});
		} else {
			setEditingCode(null);
			setForm({
				code: '',
				percent: 10,
				max_uses: null,
				is_active: true
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingCode(null);
		setForm({
			code: '',
			percent: 10,
			max_uses: null,
			is_active: true
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const url = editingCode
				? `${apiBaseUrl}/discounts/${editingCode.id}`
				: `${apiBaseUrl}/discounts`;
			const method = editingCode ? 'PUT' : 'POST';
			const payload = editingCode
				? {
						percent: form.percent,
						max_uses: form.max_uses || null,
						is_active: form.is_active
				  }
				: {
						code: form.code.toUpperCase(),
						percent: form.percent,
						max_uses: form.max_uses || null,
						is_active: form.is_active
				  };
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(payload)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در ذخیره کد تخفیف');
				setSaving(false);
				return;
			}
			if (editingCode) {
				setCodes((prev) => prev.map((c) => (c.id === editingCode.id ? data : c)));
			} else {
				setCodes((prev) => [data, ...prev]);
			}
			handleCloseDialog();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (codeId) => {
		if (!window.confirm('آیا از حذف این کد تخفیف اطمینان دارید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/discounts/${codeId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف کد تخفیف ناموفق بود');
				return;
			}
			setCodes((prev) => prev.filter((c) => c.id !== codeId));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<Percent sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>کدهای تخفیف</Typography>
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
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>ایجاد کد</Typography>
							</Stack>
							<Button
								variant="contained"
								fullWidth
								onClick={() => handleOpenDialog()}
								startIcon={<Add />}
								sx={{
									mb: 2,
									borderRadius: 2,
									py: 1.5,
									backgroundColor: 'var(--color-accent)',
									'&:hover': {
										backgroundColor: 'var(--color-accent)',
										opacity: 0.9
									}
								}}
							>
								افزودن کد جدید
							</Button>
							<Typography variant="body2" color="text.secondary">
								برای ایجاد یا ویرایش کد تخفیف، روی دکمه بالا کلیک کنید.
							</Typography>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={7}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<Percent color="primary" />
									<Typography variant="h6" sx={{ fontWeight: 'bold' }}>کدهای موجود</Typography>
									<Chip label={codes.length} color="primary" size="small" />
								</Stack>
								{loading && <CircularProgress size={24} />}
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{loading ? (
								<Box display="flex" justifyContent="center" p={4}>
									<CircularProgress />
								</Box>
							) : codes.length === 0 ? (
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
										کد تخفیفی ثبت نشده است.
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>کد</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>درصد</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>استفاده شده</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>حداکثر استفاده</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
												<TableCell align="right" sx={{ fontWeight: 'bold' }}>اقدامات</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{codes.map((c) => (
												<TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>
														<Chip label={c.code} color="primary" size="small" />
													</TableCell>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{c.percent}%
														</Typography>
													</TableCell>
													<TableCell>{c.current_uses || 0}</TableCell>
													<TableCell>{c.max_uses || 'نامحدود'}</TableCell>
													<TableCell>
														<Chip
															label={c.is_active ? 'فعال' : 'غیرفعال'}
															color={c.is_active ? 'success' : 'default'}
															size="small"
														/>
													</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={1} justifyContent="flex-end">
															<IconButton
																size="small"
																onClick={() => handleOpenDialog(c)}
																sx={{
																	bgcolor: 'white',
																	border: '1px solid',
																	borderColor: 'primary.main',
																	'&:hover': { bgcolor: 'primary.light', color: 'white' }
																}}
															>
																<Edit fontSize="small" />
															</IconButton>
															<IconButton
																size="small"
																color="error"
																onClick={() => handleDelete(c.id)}
																sx={{
																	bgcolor: 'white',
																	border: '1px solid',
																	borderColor: 'error.main',
																	'&:hover': { bgcolor: 'error.light', color: 'white' }
																}}
															>
																<Delete fontSize="small" />
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

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: { borderRadius: 3 }
				}}
			>
				<DialogTitle sx={{ fontWeight: 'bold' }}>
					{editingCode ? 'ویرایش کد تخفیف' : 'ایجاد کد تخفیف جدید'}
				</DialogTitle>
				<Box component="form" onSubmit={handleSubmit}>
					<DialogContent>
						<Stack spacing={2.5} sx={{ mt: 1 }}>
							<TextField
								label="کد"
								fullWidth
								value={form.code}
								onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
								required
								disabled={saving || !!editingCode}
								placeholder="مثلاً: OFF10"
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>
							<TextField
								label="درصد تخفیف"
								type="number"
								fullWidth
								value={form.percent}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, percent: parseFloat(e.target.value) || 0 }))
								}
								required
								disabled={saving}
								inputProps={{ min: 0, max: 100, step: 0.1 }}
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>
							<TextField
								label="حداکثر استفاده (اختیاری)"
								type="number"
								fullWidth
								value={form.max_uses || ''}
								onChange={(e) =>
									setForm((prev) => ({
										...prev,
										max_uses: e.target.value ? parseInt(e.target.value) : null
									}))
								}
								disabled={saving}
								inputProps={{ min: 1 }}
								helperText="خالی بگذارید برای نامحدود"
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>
							{editingCode && (
								<Stack direction="row" alignItems="center" spacing={2}>
									<Typography>وضعیت:</Typography>
									<Button
										variant={form.is_active ? 'contained' : 'outlined'}
										color={form.is_active ? 'success' : 'inherit'}
										onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
										disabled={saving}
										sx={{ borderRadius: 2 }}
									>
										{form.is_active ? 'فعال' : 'غیرفعال'}
									</Button>
								</Stack>
							)}
						</Stack>
					</DialogContent>
					<DialogActions sx={{ p: 2.5 }}>
						<Button onClick={handleCloseDialog} disabled={saving} sx={{ borderRadius: 2 }}>
							انصراف
						</Button>
						<Stack direction="row" spacing={1} alignItems="center">
							{saving && <CircularProgress size={22} />}
							<Button
								type="submit"
								variant="contained"
								disabled={saving || !form.code || form.percent < 0 || form.percent > 100}
								sx={{
									borderRadius: 2,
									px: 3,
									backgroundColor: 'var(--color-accent)',
									'&:hover': {
										backgroundColor: 'var(--color-accent)',
										opacity: 0.9
									}
								}}
							>
								{editingCode ? 'ذخیره تغییرات' : 'ایجاد'}
							</Button>
						</Stack>
					</DialogActions>
				</Box>
			</Dialog>
		</Box>
	);
};

export default DiscountCodes;
