import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	Button,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Avatar,
	Stack,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Switch,
	FormControlLabel,
	IconButton,
	Alert,
	CircularProgress,
	Chip
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const ProductManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [openDialog, setOpenDialog] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [form, setForm] = useState({
		name: '',
		price: 0,
		is_active: true,
		description: '',
		image_url: ''
	});

	useEffect(() => {
		if (token) fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchProducts = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/products`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری محصولات');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setProducts(data);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (product = null) => {
		if (product) {
			setEditingProduct(product);
			setForm({
				name: product.name,
				price: product.price,
				is_active: product.is_active,
				description: product.description || '',
				image_url: product.image_url || ''
			});
		} else {
			setEditingProduct(null);
			setForm({
				name: '',
				price: 0,
				is_active: true,
				description: '',
				image_url: ''
			});
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingProduct(null);
		setForm({
			name: '',
			price: 0,
			is_active: true,
			description: '',
			image_url: ''
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const url = editingProduct
				? `${apiBaseUrl}/products/${editingProduct.id}`
				: `${apiBaseUrl}/products`;
			const method = editingProduct ? 'PUT' : 'POST';
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
				setError(data.detail || data.message || 'خطا در ذخیره محصول');
				setSaving(false);
				return;
			}
			if (editingProduct) {
				setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data : p)));
			} else {
				setProducts((prev) => [data, ...prev]);
			}
			handleCloseDialog();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleToggleActive = async (productId, currentStatus) => {
		try {
			const res = await fetch(`${apiBaseUrl}/products/${productId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ is_active: !currentStatus })
			});
			if (res.ok) {
				const data = await res.json();
				setProducts((prev) => prev.map((p) => (p.id === productId ? data : p)));
			}
		} catch (err) {
			console.error(err);
			setError('خطا در بروزرسانی وضعیت محصول');
		}
	};

	const handleDelete = async (productId) => {
		if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/products/${productId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف محصول ناموفق بود');
				return;
			}
			setProducts((prev) => prev.filter((p) => p.id !== productId));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت محصولات</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" mb={2}>
								<Typography variant="h6">محصولات</Typography>
								<Button
									variant="contained"
									onClick={() => handleOpenDialog()}
									sx={{ backgroundColor: 'var(--color-accent)' }}
								>
									افزودن محصول
								</Button>
							</Stack>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : products.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									محصولی ثبت نشده است.
								</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>تصویر</TableCell>
											<TableCell>نام</TableCell>
											<TableCell>قیمت</TableCell>
											<TableCell>وضعیت</TableCell>
											<TableCell align="right">اقدامات</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{products.map((p) => (
											<TableRow key={p.id} hover>
												<TableCell>
													<Avatar
														variant="rounded"
														src={p.image_url}
														alt={p.name}
														sx={{ width: 56, height: 56 }}
													>
														{p.name.charAt(0)}
													</Avatar>
												</TableCell>
												<TableCell>{p.name}</TableCell>
												<TableCell>${p.price.toFixed(2)}</TableCell>
												<TableCell>
													<Chip
														label={p.is_active ? 'فعال' : 'غیرفعال'}
														color={p.is_active ? 'success' : 'default'}
														size="small"
													/>
												</TableCell>
												<TableCell align="right">
													<Stack direction="row" spacing={1} justifyContent="flex-end">
														<IconButton size="small" onClick={() => handleOpenDialog(p)}>
															<Edit />
														</IconButton>
														<Button
															size="small"
															color={p.is_active ? 'warning' : 'success'}
															onClick={() => handleToggleActive(p.id, p.is_active)}
														>
															{p.is_active ? 'غیرفعال' : 'فعال'}
														</Button>
														<IconButton
															size="small"
															color="error"
															onClick={() => handleDelete(p.id)}
														>
															<Delete />
														</IconButton>
													</Stack>
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

			<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>{editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}</DialogTitle>
				<Box component="form" onSubmit={handleSubmit}>
					<DialogContent>
						<Stack spacing={2} sx={{ mt: 1 }}>
							<TextField
								label="نام محصول"
								fullWidth
								value={form.name}
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								required
								disabled={saving}
							/>
							<TextField
								label="قیمت"
								type="number"
								fullWidth
								value={form.price}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
								}
								required
								disabled={saving}
								inputProps={{ min: 0, step: 0.01 }}
							/>
							<TextField
								label="توضیحات (اختیاری)"
								fullWidth
								multiline
								rows={3}
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								disabled={saving}
							/>
							<TextField
								label="آدرس تصویر (اختیاری)"
								fullWidth
								value={form.image_url}
								onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
								disabled={saving}
								placeholder="https://example.com/image.jpg"
							/>
							<FormControlLabel
								control={
									<Switch
										checked={form.is_active}
										onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
										disabled={saving}
									/>
								}
								label="فعال"
							/>
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={handleCloseDialog} disabled={saving}>
							انصراف
						</Button>
						<Stack direction="row" spacing={1} alignItems="center">
							{saving && <CircularProgress size={22} />}
							<Button
								type="submit"
								variant="contained"
								disabled={saving || !form.name || form.price < 0}
								sx={{ backgroundColor: 'var(--color-accent)' }}
							>
								{editingProduct ? 'ذخیره تغییرات' : 'افزودن'}
							</Button>
						</Stack>
					</DialogActions>
				</Box>
			</Dialog>
		</Box>
	);
};

export default ProductManagement;
