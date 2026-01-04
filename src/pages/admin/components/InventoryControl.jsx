import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	Stack,
	TextField,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	CircularProgress,
	Paper,
	Divider,
	Chip
} from '@mui/material';
import { Add, Remove, Delete, Edit, Inventory2, Search } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const InventoryControl = () => {
	const { apiBaseUrl, token } = useAuth();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [form, setForm] = useState({
		name: '',
		quantity: 0,
		unit: '',
		min_quantity: 0,
		image_url: '',
		price: 0
	});

	useEffect(() => {
		if (token) fetchItems();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchItems = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/inventory`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری موجودی');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setItems(data);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (item = null) => {
		if (item) {
			setEditingItem(item);
			setForm({
				name: item.name,
				quantity: item.quantity,
				unit: item.unit,
				min_quantity: item.min_quantity || 0,
				image_url: item.image_url || '',
				price: item.price || 0
			});
		} else {
			setEditingItem(null);
			setForm({
				name: '',
				quantity: 0,
				unit: '',
				min_quantity: 0,
				image_url: '',
				price: 0
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingItem(null);
		setForm({
			name: '',
			quantity: 0,
			unit: '',
			min_quantity: 0,
			image_url: '',
			price: 0
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const url = editingItem
				? `${apiBaseUrl}/inventory/${editingItem.id}`
				: `${apiBaseUrl}/inventory`;
			const method = editingItem ? 'PUT' : 'POST';
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
				setError(data.detail || data.message || 'خطا در ذخیره کالا');
				setSaving(false);
				return;
			}
			if (editingItem) {
				setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data : i)));
			} else {
				setItems((prev) => [data, ...prev]);
			}
			handleCloseDialog();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleUpdateQuantity = async (itemId, delta) => {
		const item = items.find((i) => i.id === itemId);
		if (!item) return;
		const newQuantity = Math.max(0, item.quantity + delta);
		try {
			const res = await fetch(`${apiBaseUrl}/inventory/${itemId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ quantity: newQuantity })
			});
			if (res.ok) {
				const data = await res.json();
				setItems((prev) => prev.map((i) => (i.id === itemId ? data : i)));
			}
		} catch (err) {
			console.error(err);
			setError('خطا در بروزرسانی موجودی');
		}
	};

	const handleDelete = async (itemId) => {
		if (!window.confirm('آیا از حذف این کالا اطمینان دارید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/inventory/${itemId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف کالا ناموفق بود');
				return;
			}
			setItems((prev) => prev.filter((i) => i.id !== itemId));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const filteredItems = items.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<Inventory2 sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>کنترل موجودی</Typography>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={3} spacing={2}>
								<TextField
									placeholder="جستجوی کالا..."
									fullWidth
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									InputProps={{
										startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
									}}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
								<Button
									variant="contained"
									onClick={() => handleOpenDialog()}
									startIcon={<Add />}
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
									افزودن کالا
								</Button>
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{loading ? (
								<Box display="flex" justifyContent="center" p={4}>
									<CircularProgress />
								</Box>
							) : filteredItems.length === 0 ? (
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
										{searchTerm ? 'کالایی یافت نشد' : 'کالایی ثبت نشده است'}
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>کالا</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>موجودی</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>واحد</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>حداقل موجودی</TableCell>
												<TableCell align="right" sx={{ fontWeight: 'bold' }}>تغییر موجودی</TableCell>
												<TableCell align="right" sx={{ fontWeight: 'bold' }}>اقدامات</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{filteredItems.map((item) => (
												<TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{item.name}
														</Typography>
													</TableCell>
													<TableCell>
														<Chip
															label={item.quantity}
															color={item.quantity <= (item.min_quantity || 0) ? 'error' : 'success'}
															size="small"
														/>
													</TableCell>
													<TableCell>{item.unit}</TableCell>
													<TableCell>{item.min_quantity || '-'}</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={0.5} justifyContent="flex-end">
															<IconButton
																size="small"
																onClick={() => handleUpdateQuantity(item.id, -1)}
																sx={{
																	bgcolor: 'white',
																	border: '1px solid',
																	borderColor: 'error.main',
																	'&:hover': { bgcolor: 'error.light', color: 'white' }
																}}
															>
																<Remove fontSize="small" />
															</IconButton>
															<IconButton
																size="small"
																color="primary"
																onClick={() => handleUpdateQuantity(item.id, 1)}
																sx={{
																	bgcolor: 'white',
																	border: '1px solid',
																	borderColor: 'primary.main',
																	'&:hover': { bgcolor: 'primary.light', color: 'white' }
																}}
															>
																<Add fontSize="small" />
															</IconButton>
														</Stack>
													</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={1} justifyContent="flex-end">
															<IconButton size="small" onClick={() => handleOpenDialog(item)}>
																<Edit />
															</IconButton>
															<IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
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

			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: { borderRadius: 3 }
				}}
			>
				<DialogTitle sx={{ fontWeight: 'bold' }}>{editingItem ? 'ویرایش کالا' : 'افزودن کالا جدید'}</DialogTitle>
				<Box component="form" onSubmit={handleSubmit}>
					<DialogContent>
						<Stack spacing={2} sx={{ mt: 1 }}>
							<TextField
								label="نام کالا"
								fullWidth
								value={form.name}
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								required
								disabled={saving}
							/>
							<TextField
								label="موجودی"
								type="number"
								fullWidth
								value={form.quantity}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))
								}
								required
								disabled={saving}
								inputProps={{ min: 0, step: 0.01 }}
							/>
							<TextField
								label="واحد"
								fullWidth
								value={form.unit}
								onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
								required
								disabled={saving}
								placeholder="مثلاً: کیلو، لیتر، عدد"
							/>
							<TextField
								label="حداقل موجودی"
								type="number"
								fullWidth
								value={form.min_quantity}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, min_quantity: parseFloat(e.target.value) || 0 }))
								}
								disabled={saving}
								inputProps={{ min: 0, step: 0.01 }}
							/>
							<TextField
								label="قیمت (برای نوشیدنی سفارشی)"
								type="number"
								fullWidth
								value={form.price}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
								}
								disabled={saving}
								inputProps={{ min: 0, step: 0.01 }}
								helperText="قیمت برای استفاده در نوشیدنی سفارشی (اختیاری)"
							/>
							<TextField
								label="آدرس تصویر (برای نوشیدنی سفارشی)"
								fullWidth
								value={form.image_url}
								onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
								disabled={saving}
								placeholder="https://example.com/image.jpg"
								helperText="آدرس تصویر برای نمایش در نوشیدنی سفارشی (اختیاری)"
							/>
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
								disabled={saving || !form.name || !form.unit}
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
								{editingItem ? 'ذخیره تغییرات' : 'افزودن'}
							</Button>
						</Stack>
					</DialogActions>
				</Box>
			</Dialog>
		</Box>
	);
};

export default InventoryControl;
