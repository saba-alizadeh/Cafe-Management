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
	Chip,
	Autocomplete,
	InputAdornment,
	MenuItem
} from '@mui/material';
import { Edit, Delete, CloudUpload, LocalOffer } from '@mui/icons-material';
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
		image_url: '',
		discount_percent: 0,
		labels: [],
		coffee_blends: [],
		coffee_type: ''
	});
	const [uploadingImage, setUploadingImage] = useState(false);
	const [availableLabels, setAvailableLabels] = useState([
		'نوشیدنی گرم',
		'نوشیدنی سرد',
		'قهوه',
		'چای',
		'دسر',
		'غذا',
		'اسنک',
		'صبحانه'
	]);
	const [availableCoffeeTypes, setAvailableCoffeeTypes] = useState([
		'Robusta',
		'Arabica'
	]);
	const [editingBlendIndex, setEditingBlendIndex] = useState(null);
	const [blendForm, setBlendForm] = useState({ ratio: '', price: 0 });
	const isCoffeeProduct = form.labels && form.labels.some(label => 
		label.toLowerCase().includes('قهوه') || label.toLowerCase().includes('coffee')
	);
	const availableBlendRatios = ['100%', '80-20', '60-40', '50-50'];

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
				image_url: product.image_url || '',
				discount_percent: product.discount_percent || 0,
				labels: product.labels || [],
				coffee_blends: product.coffee_blends || [],
				coffee_type: product.coffee_type || ''
			});
		} else {
			setEditingProduct(null);
			setForm({
				name: '',
				price: 0,
				is_active: true,
				description: '',
				image_url: '',
				discount_percent: 0,
				labels: [],
				coffee_blends: [],
				coffee_type: ''
			});
		}
		setEditingBlendIndex(null);
		setBlendForm({ ratio: '', price: 0 });
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setEditingProduct(null);
		setEditingBlendIndex(null);
		setBlendForm({ ratio: '', price: 0 });
		setForm({
			name: '',
			price: 0,
			is_active: true,
			description: '',
			image_url: '',
			discount_percent: 0,
			labels: [],
			coffee_blends: [],
			coffee_type: ''
		});
	};

	const handleAddBlend = () => {
		if (!blendForm.ratio || blendForm.price <= 0) {
			setError('لطفاً نسبت و قیمت را وارد کنید');
			return;
		}
		// Check if ratio already exists
		if (form.coffee_blends.some(b => b.ratio === blendForm.ratio)) {
			setError('این نسبت قبلاً اضافه شده است');
			return;
		}
		setForm(prev => ({
			...prev,
			coffee_blends: [...prev.coffee_blends, { ratio: blendForm.ratio, price: blendForm.price }]
		}));
		setBlendForm({ ratio: '', price: 0 });
		setError('');
	};

	const handleEditBlend = (index) => {
		const blend = form.coffee_blends[index];
		setBlendForm({ ratio: blend.ratio, price: blend.price });
		setEditingBlendIndex(index);
	};

	const handleUpdateBlend = () => {
		if (!blendForm.ratio || blendForm.price <= 0) {
			setError('لطفاً نسبت و قیمت را وارد کنید');
			return;
		}
		// Check if ratio already exists in another blend
		if (form.coffee_blends.some((b, idx) => b.ratio === blendForm.ratio && idx !== editingBlendIndex)) {
			setError('این نسبت قبلاً اضافه شده است');
			return;
		}
		setForm(prev => ({
			...prev,
			coffee_blends: prev.coffee_blends.map((b, idx) => 
				idx === editingBlendIndex ? { ratio: blendForm.ratio, price: blendForm.price } : b
			)
		}));
		setBlendForm({ ratio: '', price: 0 });
		setEditingBlendIndex(null);
		setError('');
	};

	const handleRemoveBlend = (index) => {
		setForm(prev => ({
			...prev,
			coffee_blends: prev.coffee_blends.filter((_, idx) => idx !== index)
		}));
	};

	const handleImageUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		setError('');

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`${apiBaseUrl}/products/upload-image`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`
				},
				body: formData
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در آپلود تصویر');
				setUploadingImage(false);
				return;
			}

			const imageUrl = data.url;
			if (!imageUrl) {
				setError('آدرس فایل بازگشتی نامعتبر است');
				setUploadingImage(false);
				return;
			}

			setForm(prev => ({ ...prev, image_url: imageUrl }));
		} catch (err) {
			console.error('Image upload exception:', err);
			setError('خطا در ارتباط با سرور هنگام آپلود تصویر: ' + err.message);
		} finally {
			setUploadingImage(false);
		}
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
								InputProps={{
									endAdornment: <InputAdornment position="end">تومان</InputAdornment>
								}}
							/>
							<TextField
								label="تخفیف (درصد)"
								type="number"
								fullWidth
								value={form.discount_percent}
								onChange={(e) =>
									setForm((prev) => ({ 
										...prev, 
										discount_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
									}))
								}
								disabled={saving}
								inputProps={{ min: 0, max: 100, step: 1 }}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LocalOffer />
										</InputAdornment>
									),
									endAdornment: <InputAdornment position="end">%</InputAdornment>
								}}
								helperText={form.discount_percent > 0 ? `قیمت با تخفیف: ${(form.price * (1 - form.discount_percent / 100)).toLocaleString('fa-IR')} تومان` : ''}
							/>
							<Autocomplete
								multiple
								options={availableLabels}
								freeSolo
								value={form.labels}
								onChange={(event, newValue) => {
									setForm(prev => ({ ...prev, labels: newValue }));
								}}
								renderTags={(value, getTagProps) =>
									value.map((option, index) => (
										<Chip
											variant="outlined"
											label={option}
											{...getTagProps({ index })}
											key={index}
										/>
									))
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label="برچسب‌ها (مثال: نوشیدنی گرم)"
										placeholder="برچسب اضافه کنید"
									/>
								)}
								disabled={saving}
							/>
							{isCoffeeProduct && (
								<>
									<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
										<Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
											گزینه‌های ترکیب قهوه (هر ترکیب با قیمت خود)
										</Typography>
										
										{/* Existing Blends */}
										{form.coffee_blends && form.coffee_blends.length > 0 && (
											<Box sx={{ mb: 2 }}>
												{form.coffee_blends.map((blend, index) => (
													<Box key={index} sx={{ 
														display: 'flex', 
														alignItems: 'center', 
														gap: 1, 
														mb: 1,
														p: 1,
														bgcolor: 'grey.50',
														borderRadius: 1
													}}>
														<Chip label={blend.ratio} color="primary" />
														<Typography variant="body2" sx={{ flexGrow: 1 }}>
															{blend.price.toLocaleString('fa-IR')} تومان
														</Typography>
														<IconButton 
															size="small" 
															onClick={() => handleEditBlend(index)}
															disabled={saving}
														>
															<Edit fontSize="small" />
														</IconButton>
														<IconButton 
															size="small" 
															color="error"
															onClick={() => handleRemoveBlend(index)}
															disabled={saving}
														>
															<Delete fontSize="small" />
														</IconButton>
													</Box>
												))}
											</Box>
										)}

										{/* Add/Edit Blend Form */}
										<Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
											<Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
												{editingBlendIndex !== null ? 'ویرایش ترکیب' : 'افزودن ترکیب جدید'}
											</Typography>
											<Box sx={{ mb: 2 }}>
												<Typography variant="body2" sx={{ mb: 1 }}>نسبت ترکیب:</Typography>
												<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
													{availableBlendRatios.map((ratio) => {
														const isSelected = blendForm.ratio === ratio;
														const isUsed = form.coffee_blends.some(b => b.ratio === ratio && 
															(editingBlendIndex === null || form.coffee_blends.findIndex(b => b.ratio === ratio) !== editingBlendIndex));
														return (
															<Button
																key={ratio}
																variant={isSelected ? 'contained' : 'outlined'}
																size="small"
																onClick={() => {
																	if (!isUsed) {
																		setBlendForm(prev => ({ ...prev, ratio }));
																	}
																}}
																disabled={saving || (editingBlendIndex !== null && !isSelected) || isUsed}
																sx={{
																	minWidth: 70,
																	...(isSelected && {
																		backgroundColor: 'var(--color-accent)',
																		'&:hover': { backgroundColor: 'var(--color-accent)' }
																	}),
																	...(isUsed && {
																		opacity: 0.5,
																		cursor: 'not-allowed'
																	})
																}}
															>
																{ratio}
															</Button>
														);
													})}
												</Box>
											</Box>
											<Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
												<TextField
													label="قیمت"
													type="number"
													size="small"
													value={blendForm.price}
													onChange={(e) => setBlendForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
													disabled={saving}
													inputProps={{ min: 0, step: 0.01 }}
													InputProps={{
														endAdornment: <InputAdornment position="end">تومان</InputAdornment>
													}}
													sx={{ flexGrow: 1 }}
												/>
												{editingBlendIndex !== null ? (
													<>
														<Button
															variant="contained"
															size="small"
															onClick={handleUpdateBlend}
															disabled={saving}
														>
															ذخیره
														</Button>
														<Button
															variant="outlined"
															size="small"
															onClick={() => {
																setEditingBlendIndex(null);
																setBlendForm({ ratio: '', price: 0 });
															}}
															disabled={saving}
														>
															انصراف
														</Button>
													</>
												) : (
													<Button
														variant="contained"
														size="small"
														onClick={handleAddBlend}
														disabled={saving || !blendForm.ratio || blendForm.price <= 0}
													>
														افزودن
													</Button>
												)}
											</Box>
										</Box>
									</Box>
									<Autocomplete
										options={availableCoffeeTypes}
										freeSolo
										value={form.coffee_type}
										onChange={(event, newValue) => {
											setForm(prev => ({ ...prev, coffee_type: newValue || '' }));
											// Add new custom option if it doesn't exist
											if (newValue && !availableCoffeeTypes.includes(newValue)) {
												setAvailableCoffeeTypes(prev => [...prev, newValue]);
											}
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												label="نوع قهوه (Robusta, Arabica و ...)"
												placeholder="نوع قهوه را انتخاب یا وارد کنید"
											/>
										)}
										disabled={saving}
									/>
								</>
							)}
							<TextField
								label="توضیحات (اختیاری)"
								fullWidth
								multiline
								rows={3}
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								disabled={saving}
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
								{form.image_url && (
									<Box sx={{ mt: 2, textAlign: 'center' }}>
										<Avatar
											variant="rounded"
											src={form.image_url.startsWith('/') ? `${apiBaseUrl}${form.image_url}` : form.image_url}
											alt="Product preview"
											sx={{ width: 120, height: 120, mx: 'auto', mb: 1 }}
											onError={(e) => {
												e.target.style.display = 'none';
											}}
										/>
										<Button
											size="small"
											color="error"
											onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
											disabled={saving}
										>
											حذف تصویر
										</Button>
									</Box>
								)}
								<TextField
									label="یا آدرس تصویر را وارد کنید"
									fullWidth
									value={form.image_url}
									onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
									disabled={saving}
									placeholder="https://example.com/image.jpg"
									sx={{ mt: 2 }}
								/>
							</Box>
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
