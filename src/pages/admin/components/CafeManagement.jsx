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
	Alert,
	CircularProgress,
	Avatar,
	Paper,
	Divider
} from '@mui/material';
import {
	Business,
	Save,
	CloudUpload,
	Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUtils';

const CafeManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [cafe, setCafe] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [formData, setFormData] = useState({
		name: '',
		location: '',
		phone: '',
		email: '',
		details: '',
		hours: '',
		capacity: '',
		wifi_password: '',
		logo_url: '',
		banner_url: ''
	});
	const [logoFile, setLogoFile] = useState(null);
	const [bannerFile, setBannerFile] = useState(null);
	const [logoPreview, setLogoPreview] = useState('');
	const [bannerPreview, setBannerPreview] = useState('');

	useEffect(() => {
		if (token) {
			fetchCafeInfo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchCafeInfo = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/cafes`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری اطلاعات کافه');
				setLoading(false);
				return;
			}
			const cafes = await res.json();
			if (cafes.length > 0) {
				const adminCafe = cafes[0]; // Admin's own cafe
				setCafe(adminCafe);
				setFormData({
					name: adminCafe.name || '',
					location: adminCafe.location || '',
					phone: adminCafe.phone || '',
					email: adminCafe.email || '',
					details: adminCafe.details || '',
					hours: adminCafe.hours || '',
					capacity: adminCafe.capacity?.toString() || '',
					wifi_password: adminCafe.wifi_password || '',
					logo_url: adminCafe.logo_url || '',
					banner_url: adminCafe.banner_url || ''
				});
				if (adminCafe.logo_url) {
					setLogoPreview(getImageUrl(adminCafe.logo_url, apiBaseUrl) || adminCafe.logo_url);
				}
				if (adminCafe.banner_url) {
					setBannerPreview(getImageUrl(adminCafe.banner_url, apiBaseUrl) || adminCafe.banner_url);
				}
			}
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (field) => (e) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
		if (error) setError('');
		if (success) setSuccess('');
	};

	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setLogoFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setLogoPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleBannerChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setBannerFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setBannerPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const uploadImage = async (file, type) => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('image_type', type); // 'logo' or 'banner'

		const res = await fetch(`${apiBaseUrl}/cafes/upload-cafe-image`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: formData
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.detail || `خطا در آپلود ${type === 'logo' ? 'لوگو' : 'بنر'}`);
		}

		const data = await res.json();
		return data.url;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');

		try {
			// Upload logo if new file selected
			if (logoFile) {
				const logoUrl = await uploadImage(logoFile, 'logo');
				formData.logo_url = logoUrl;
			}

			// Upload banner if new file selected
			if (bannerFile) {
				const bannerUrl = await uploadImage(bannerFile, 'banner');
				formData.banner_url = bannerUrl;
			}

			// Update cafe information
			const updateData = {
				name: formData.name,
				location: formData.location,
				phone: formData.phone,
				email: formData.email,
				details: formData.details,
				hours: formData.hours,
				capacity: formData.capacity ? parseInt(formData.capacity) : null,
				wifi_password: formData.wifi_password,
				logo_url: formData.logo_url,
				banner_url: formData.banner_url
			};

			const res = await fetch(`${apiBaseUrl}/cafes/${cafe.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(updateData)
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || 'خطا در ذخیره اطلاعات');
				setSaving(false);
				return;
			}

			setCafe(data);
			setSuccess('اطلاعات با موفقیت ذخیره شد');
			setLogoFile(null);
			setBannerFile(null);
		} catch (err) {
			console.error(err);
			setError(err.message || 'خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" p={4}>
				<CircularProgress />
			</Box>
		);
	}

	if (!cafe) {
		return (
			<Box sx={{ direction: 'rtl', p: 3 }}>
				<Alert severity="error">کافه‌ای یافت نشد</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<Business sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>
					مدیریت کافه
				</Typography>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}

			{success && (
				<Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
					{success}
				</Alert>
			)}

			<Card elevation={3} sx={{ borderRadius: 3 }}>
				<CardContent sx={{ p: 3 }}>
					<Box component="form" onSubmit={handleSubmit}>
						<Grid container spacing={3}>
							{/* Logo Upload */}
							<Grid item xs={12} md={6}>
								<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
									لوگوی کافه
								</Typography>
								<Box sx={{ mb: 2 }}>
									{logoPreview && (
										<Avatar
											src={logoPreview}
											alt="Logo Preview"
											sx={{ width: 120, height: 120, mb: 2 }}
										/>
									)}
									<Button
										variant="outlined"
										component="label"
										startIcon={<CloudUpload />}
										fullWidth
										sx={{ borderRadius: 2 }}
									>
										{logoFile ? 'تغییر لوگو' : 'انتخاب لوگو'}
										<input
											type="file"
											hidden
											accept="image/*"
											onChange={handleLogoChange}
										/>
									</Button>
									<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
										لوگو در کنار نام کافه در صفحه اصلی نمایش داده می‌شود
									</Typography>
								</Box>
							</Grid>

							{/* Banner Upload */}
							<Grid item xs={12} md={6}>
								<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
									بنر کافه
								</Typography>
								<Box sx={{ mb: 2 }}>
									{bannerPreview && (
										<Box
											component="img"
											src={bannerPreview}
											alt="Banner Preview"
											sx={{
												width: '100%',
												maxHeight: 200,
												objectFit: 'cover',
												borderRadius: 2,
												mb: 2
											}}
										/>
									)}
									<Button
										variant="outlined"
										component="label"
										startIcon={<CloudUpload />}
										fullWidth
										sx={{ borderRadius: 2 }}
									>
										{bannerFile ? 'تغییر بنر' : 'انتخاب بنر'}
										<input
											type="file"
											hidden
											accept="image/*"
											onChange={handleBannerChange}
										/>
									</Button>
									<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
										بنر در صفحه انتخاب کافه نمایش داده می‌شود
									</Typography>
								</Box>
							</Grid>

							<Grid item xs={12}>
								<Divider sx={{ my: 2 }} />
							</Grid>

							{/* Cafe Name */}
							<Grid item xs={12} md={6}>
								<TextField
									label="نام کافه"
									fullWidth
									value={formData.name}
									onChange={handleChange('name')}
									required
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Location */}
							<Grid item xs={12} md={6}>
								<TextField
									label="آدرس"
									fullWidth
									value={formData.location}
									onChange={handleChange('location')}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Phone */}
							<Grid item xs={12} md={6}>
								<TextField
									label="شماره تلفن"
									fullWidth
									value={formData.phone}
									onChange={handleChange('phone')}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Email */}
							<Grid item xs={12} md={6}>
								<TextField
									label="ایمیل"
									fullWidth
									type="email"
									value={formData.email}
									onChange={handleChange('email')}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Details */}
							<Grid item xs={12}>
								<TextField
									label="توضیحات"
									fullWidth
									multiline
									minRows={4}
									value={formData.details}
									onChange={handleChange('details')}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Hours */}
							<Grid item xs={12} md={6}>
								<TextField
									label="ساعات کاری"
									fullWidth
									value={formData.hours}
									onChange={handleChange('hours')}
									placeholder="مثال: 8:00 - 22:00"
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Capacity */}
							<Grid item xs={12} md={6}>
								<TextField
									label="ظرفیت"
									fullWidth
									type="number"
									value={formData.capacity}
									onChange={handleChange('capacity')}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* WiFi Password */}
							<Grid item xs={12} md={6}>
								<TextField
									label="رمز وای‌فای"
									fullWidth
									value={formData.wifi_password}
									onChange={handleChange('wifi_password')}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
							</Grid>

							{/* Submit Button */}
							<Grid item xs={12}>
								<Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
									{saving && <CircularProgress size={24} />}
									<Button
										type="submit"
										variant="contained"
										disabled={saving || !formData.name}
										startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
										sx={{
											borderRadius: 2,
											py: 1.5,
											px: 4,
											backgroundColor: 'var(--color-accent)',
											'&:hover': {
												backgroundColor: 'var(--color-accent)',
												opacity: 0.9
											}
										}}
									>
										ذخیره تغییرات
									</Button>
								</Stack>
							</Grid>
						</Grid>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default CafeManagement;
