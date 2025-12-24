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
	Divider,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper
} from '@mui/material';
import { Sms, Send, AccessTime, People } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const AdvertisingMessages = () => {
	const { apiBaseUrl, token } = useAuth();
	const [customers, setCustomers] = useState([]);
	const [selectedCustomers, setSelectedCustomers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [sentMessages, setSentMessages] = useState([]);
	const [formData, setFormData] = useState({
		title: '',
		message: '',
		targetAll: false
	});

	useEffect(() => {
		if (token) {
			fetchCustomers();
			fetchSentMessages();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchSentMessages = async () => {
		try {
			// TODO: Replace with actual API endpoint when available
			// const res = await fetch(`${apiBaseUrl}/advertising-messages`, {
			// 	headers: { Authorization: `Bearer ${token}` }
			// });
			// if (res.ok) {
			// 	const data = await res.json();
			// 	setSentMessages(data);
			// }
			
			// For now, load from localStorage as fallback
			const stored = localStorage.getItem('advertising_messages');
			if (stored) {
				setSentMessages(JSON.parse(stored));
			}
		} catch (err) {
			console.error('Error fetching sent messages:', err);
		}
	};

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

	const handleSend = async () => {
		if (!formData.title || !formData.message) {
			setError('لطفاً عنوان و متن پیام را وارد کنید');
			return;
		}
		if (!formData.targetAll && selectedCustomers.length === 0) {
			setError('لطفاً حداقل یک مشتری را انتخاب کنید یا گزینه "ارسال به همه" را فعال کنید');
			return;
		}
		
		setSending(true);
		setError('');
		setSuccess('');
		
		try {
			const targetUsers = formData.targetAll 
				? customers.map(c => ({ id: c.id, name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.phone, phone: c.phone }))
				: selectedCustomers.map(c => ({ id: c.id, name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.phone, phone: c.phone }));
			
			const messageData = {
				id: Date.now().toString(),
				title: formData.title,
				message: formData.message,
				target_users: targetUsers,
				target_all: formData.targetAll,
				sent_at: new Date().toISOString(),
				sent_at_persian: new Date().toLocaleString('fa-IR', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			};

			// TODO: Replace with actual API endpoint when available
			// const res = await fetch(`${apiBaseUrl}/advertising-messages`, {
			// 	method: 'POST',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		Authorization: `Bearer ${token}`
			// 	},
			// 	body: JSON.stringify(messageData)
			// });
			// if (!res.ok) {
			// 	const data = await res.json().catch(() => ({}));
			// 	setError(data.detail || 'خطا در ارسال پیام');
			// 	setSending(false);
			// 	return;
			// }
			// const data = await res.json();
			
			// For now, store in localStorage as fallback
			const stored = localStorage.getItem('advertising_messages');
			const messages = stored ? JSON.parse(stored) : [];
			messages.unshift(messageData);
			localStorage.setItem('advertising_messages', JSON.stringify(messages));
			setSentMessages(messages);
			
			// TODO: Implement actual SMS sending logic
			console.log('Sending to:', formData.targetAll ? 'All customers' : selectedCustomers.map(c => c.phone));
			
			setSuccess('پیام با موفقیت ارسال شد');
			setFormData({
				title: '',
				message: '',
				targetAll: false
			});
			setSelectedCustomers([]);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSending(false);
		}
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
			{success && (
				<Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
					{success}
				</Alert>
			)}
			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
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
										disabled={sending}
										startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
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
										{sending ? 'در حال ارسال...' : 'ارسال پیامک'}
									</Button>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<Sms color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>پیام‌های ارسال شده</Typography>
								<Chip label={sentMessages.length} color="primary" size="small" />
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{sentMessages.length === 0 ? (
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
										هیچ پیامی ارسال نشده است.
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', maxHeight: 600, overflowY: 'auto' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>عنوان</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>متن</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>تاریخ و زمان</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>گیرندگان</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{sentMessages.map((msg) => (
												<TableRow key={msg.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{msg.title}
														</Typography>
													</TableCell>
													<TableCell>
														<Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
															{msg.message}
														</Typography>
													</TableCell>
													<TableCell>
														<Stack direction="row" alignItems="center" spacing={0.5}>
															<AccessTime fontSize="small" color="action" />
															<Typography variant="caption">
																{msg.sent_at_persian}
															</Typography>
														</Stack>
													</TableCell>
													<TableCell>
														<Stack direction="row" alignItems="center" spacing={0.5}>
															<People fontSize="small" color="action" />
															<Typography variant="caption">
																{msg.target_all 
																	? `همه (${msg.target_users.length})`
																	: `${msg.target_users.length} نفر`
																}
															</Typography>
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

export default AdvertisingMessages;
