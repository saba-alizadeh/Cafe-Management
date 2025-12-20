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
	Autocomplete,
	Chip,
	Alert,
	CircularProgress,
	Checkbox,
	FormControlLabel,
	Divider
} from '@mui/material';
import { Sms, Send } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const AdvertisingMessages = () => {
	const { apiBaseUrl, token } = useAuth();
	const [customers, setCustomers] = useState([]);
	const [selectedCustomers, setSelectedCustomers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [formData, setFormData] = useState({
		title: '',
		message: '',
		targetAll: false
	});

	useEffect(() => {
		if (token) {
			fetchCustomers();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchCustomers = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/users`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری مشتریان');
				setLoading(false);
				return;
			}
			const data = await res.json();
			// Filter to show only customers
			const customerList = data.filter((u) => u.role === 'customer' && u.phone);
			setCustomers(customerList);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleSelectAll = () => {
		if (selectedCustomers.length === customers.length) {
			setSelectedCustomers([]);
		} else {
			setSelectedCustomers([...customers]);
		}
	};

	const handleSend = () => {
		if (!formData.title || !formData.message) {
			setError('لطفاً عنوان و متن پیام را وارد کنید');
			return;
		}
		if (!formData.targetAll && selectedCustomers.length === 0) {
			setError('لطفاً حداقل یک مشتری را انتخاب کنید یا گزینه "ارسال به همه" را فعال کنید');
			return;
		}
		// TODO: Implement actual SMS sending logic
		console.log('Sending to:', formData.targetAll ? 'All customers' : selectedCustomers.map(c => c.phone));
		setError('');
		alert('پیام با موفقیت ارسال شد');
	};

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<Sms sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>پیام‌های تبلیغاتی</Typography>
			</Stack>
			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}
			<Grid container spacing={3}>
				<Grid item xs={12} md={8}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<Send color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>ارسال کمپین</Typography>
							</Stack>
							<Stack spacing={2.5}>
								<TextField
									label="عنوان"
									fullWidth
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
								<TextField
									label="متن پیام"
									fullWidth
									multiline
									minRows={5}
									value={formData.message}
									onChange={(e) => setFormData({ ...formData, message: e.target.value })}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
								<FormControlLabel
									control={
										<Checkbox
											checked={formData.targetAll}
											onChange={(e) => {
												setFormData({ ...formData, targetAll: e.target.checked });
												if (e.target.checked) {
													setSelectedCustomers([]);
												}
											}}
										/>
									}
									label="ارسال به همه مشتریان"
								/>
								{!formData.targetAll && (
									<>
										<Box display="flex" justifyContent="space-between" alignItems="center">
											<Typography variant="body2" color="text.secondary">
												انتخاب مشتریان ({selectedCustomers.length} نفر انتخاب شده)
											</Typography>
											<Button size="small" onClick={handleSelectAll} sx={{ borderRadius: 2 }}>
												{selectedCustomers.length === customers.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
											</Button>
										</Box>
										{loading ? (
											<Box display="flex" justifyContent="center" p={2}>
												<CircularProgress />
											</Box>
										) : (
											<Autocomplete
												multiple
												options={customers}
												getOptionLabel={(option) => {
													const name = option.firstName && option.lastName
														? `${option.firstName} ${option.lastName}`
														: option.name || option.phone || 'نامشخص';
													return `${name} - ${option.phone || ''}`;
												}}
												value={selectedCustomers}
												onChange={(event, newValue) => {
													setSelectedCustomers(newValue);
												}}
												renderTags={(value, getTagProps) =>
													value.map((option, index) => (
														<Chip
															{...getTagProps({ index })}
															key={option.id}
															label={`${option.firstName || ''} ${option.lastName || ''} - ${option.phone || ''}`.trim()}
															sx={{ borderRadius: 1 }}
														/>
													))
												}
												renderInput={(params) => (
													<TextField
														{...params}
														label="انتخاب مشتریان (شماره تلفن)"
														placeholder="جستجو و انتخاب مشتریان..."
														variant="outlined"
														sx={{
															'& .MuiOutlinedInput-root': {
																borderRadius: 2
															}
														}}
													/>
												)}
											/>
										)}
									</>
								)}
								<Divider />
								<Stack direction="row" spacing={2} justifyContent="flex-end">
									<Button
										variant="outlined"
										sx={{ borderRadius: 2 }}
									>
										زمانبندی
									</Button>
									<Button
										variant="contained"
										onClick={handleSend}
										startIcon={<Send />}
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
										ارسال پیامک
									</Button>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default AdvertisingMessages;
