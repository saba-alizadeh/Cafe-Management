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
	IconButton,
	Alert,
	CircularProgress,
	Chip,
	InputAdornment
} from '@mui/material';
import { Edit, Delete, CloudUpload } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUtils';

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
		image_url: ''
	});
	const [uploadingImage, setUploadingImage] = useState(false);
	const [imagePreview, setImagePreview] = useState(null);

	useEffect(() => {
		if (token) fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchProducts = async () => {
		setLoading(true);
		setError('');
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			setLoading(false);
			window.location.href = '/admin-login';
			return;
		}
		try {
			const res = await fetch(`${apiBaseUrl}/products`, {
				headers: { Authorization: `Bearer ${authToken}` }
			});
			if (!res.ok) {
				if (res.status === 401) {
					// Token expired or invalid
					localStorage.removeItem('authToken');
					localStorage.removeItem('cafeUser');
					setError('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
					setTimeout(() => {
						window.location.href = '/admin-login';
					}, 2000);
					setLoading(false);
					return;
				}
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
				image_url: product.image_url || ''
			});
			setImagePreview(product.image_url ? getImageUrl(product.image_url, apiBaseUrl) || product.image_url : null);
		} else {
			setEditingProduct(null);
			setForm({
				name: '',
				price: 0,
				image_url: ''
			});
			setImagePreview(null);
		}
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingProduct(null);
		setForm({
			name: '',
			price: 0,
			image_url: ''
		});
		setImagePreview(null);
	};

	const handleImageUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setError('لطفاً یک فایل تصویری انتخاب کنید');
			return;
		}

		// Create preview
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(file);

		setUploadingImage(true);
		setError('');

		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			setUploadingImage(false);
			setImagePreview(null);
			window.location.href = '/admin-login';
			return;
		}

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`${apiBaseUrl}/products/upload-image`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`
				},
				body: formData
			});

			if (res.status === 401) {
				localStorage.removeItem('authToken');
				localStorage.removeItem('cafeUser');
				setError('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
				setUploadingImage(false);
				setImagePreview(null);
				setTimeout(() => {
					window.location.href = '/admin-login';
				}, 2000);
				return;
			}

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در آپلود تصویر');
				setUploadingImage(false);
				setImagePreview(null);
				return;
			}

			const imageUrl = data.url;
			if (!imageUrl) {
				setError('آدرس فایل بازگشتی نامعتبر است');
				setUploadingImage(false);
				setImagePreview(null);
				return;
			}

			setForm(prev => ({ ...prev, image_url: imageUrl }));
		} catch (err) {
			console.error('Image upload exception:', err);
			setError('خطا در ارتباط با سرور هنگام آپلود تصویر: ' + err.message);
			setImagePreview(null);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			setSaving(false);
			window.location.href = '/admin-login';
			return;
		}
		try {
			const url = editingProduct
				? `${apiBaseUrl}/products/${editingProduct.id}`
				: `${apiBaseUrl}/products`;
			const method = editingProduct ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(form)
			});
			if (res.status === 401) {
				localStorage.removeItem('authToken');
				localStorage.removeItem('cafeUser');
				setError('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
				setSaving(false);
				setTimeout(() => {
					window.location.href = '/admin-login';
				}, 2000);
				return;
			}
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
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			window.location.href = '/admin-login';
			return;
		}
		try {
			const res = await fetch(`${apiBaseUrl}/products/${productId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify({ is_active: !currentStatus })
			});
			if (res.status === 401) {
				localStorage.removeItem('authToken');
				localStorage.removeItem('cafeUser');
				setError('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
				setTimeout(() => {
					window.location.href = '/admin-login';
				}, 2000);
				return;
			}
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
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			window.location.href = '/admin-login';
			return;
		}
		try {
			const res = await fetch(`${apiBaseUrl}/products/${productId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${authToken}` }
			});
			if (res.status === 401) {
				localStorage.removeItem('authToken');
				localStorage.removeItem('cafeUser');
				setError('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
				setTimeout(() => {
					window.location.href = '/admin-login';
				}, 2000);
				return;
			}
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
														src={getImageUrl(p.image_url, apiBaseUrl) || p.image_url}
														alt={p.name}
														sx={{ width: 56, height: 56 }}
													>
														{p.name.charAt(0)}
													</Avatar>
												</TableCell>
												<TableCell>
													<Box>
														<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
															{p.name}
														</Typography>
														{p.labels && p.labels.length > 0 && (
															<Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
																{p.labels.map((label, idx) => (
																	<Chip
																		key={idx}
																		label={label}
																		size="small"
																		variant="outlined"
																		sx={{ fontSize: '0.7rem', height: 20 }}
																	/>
																))}
															</Box>
														)}
													</Box>
												</TableCell>
												<TableCell>
													<Box>
														{p.discount_percent > 0 ? (
															<>
																<Typography
																	variant="body2"
																	sx={{
																		textDecoration: 'line-through',
																		color: 'text.secondary',
																		fontSize: '0.85rem'
																	}}
																>
																	{p.price.toLocaleString('fa-IR')} تومان
																</Typography>
																<Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
																	{(p.price * (1 - p.discount_percent / 100)).toLocaleString('fa-IR')} تومان
																</Typography>
																<Chip
																	label={`${p.discount_percent}% تخفیف`}
																	size="small"
																	color="error"
																	sx={{ mt: 0.5, fontSize: '0.7rem' }}
																/>
															</>
														) : (
															<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
																{p.price.toLocaleString('fa-IR')} تومان
															</Typography>
														)}
													</Box>
												</TableCell>
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
						<Stack spacing={3} sx={{ mt: 1 }}>
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
								InputProps={{
									endAdornment: <InputAdornment position="end">تومان</InputAdornment>
								}}
							/>
							<Box>
								<input
									accept="image/*"
									style={{ display: 'none' }}
									id="product-image-upload"
									type="file"
									onChange={handleImageUpload}
									disabled={saving || uploadingImage}
								/>
								<label htmlFor="product-image-upload">
									<Button
										variant="outlined"
										component="span"
										startIcon={<CloudUpload />}
										disabled={saving || uploadingImage}
										fullWidth
										sx={{ mb: 2 }}
									>
										{uploadingImage ? 'در حال آپلود...' : 'آپلود تصویر محصول'}
									</Button>
								</label>
								{imagePreview && (
									<Box sx={{ mt: 2, textAlign: 'center' }}>
										<Box
											component="img"
											src={imagePreview}
											alt="Product preview"
											sx={{
												width: '100%',
												maxWidth: 300,
												height: 'auto',
												maxHeight: 300,
												objectFit: 'contain',
												border: '1px solid',
												borderColor: 'divider',
												borderRadius: 2,
												p: 1,
												mb: 2,
												mx: 'auto',
												display: 'block'
											}}
										/>
										<Button
											size="small"
											color="error"
											variant="outlined"
											onClick={() => {
												setForm(prev => ({ ...prev, image_url: '' }));
												setImagePreview(null);
											}}
											disabled={saving}
										>
											حذف تصویر
										</Button>
									</Box>
								)}
							</Box>
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
