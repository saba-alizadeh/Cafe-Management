import { useEffect, useState } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	TextField,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Chip,
	Stack,
	Button,
	MenuItem,
	IconButton,
	Alert,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Paper,
	Divider
} from '@mui/material';
import { Edit, Delete, Refresh, TableRestaurant, Add, People } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const TableManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [tables, setTables] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingTable, setEditingTable] = useState(null);
	const [form, setForm] = useState({
		name: '',
		capacity: '',
		status: 'available'
	});
	const [editForm, setEditForm] = useState({
		name: '',
		capacity: '',
		status: 'available'
	});

	useEffect(() => {
		if (token) fetchTables();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchTables = async () => {
		setLoading(true);
		setError('');
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			setLoading(false);
			return;
		}
		try {
			const res = await fetch(`${apiBaseUrl}/tables`, {
				headers: { Authorization: `Bearer ${authToken}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری میزها');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setTables(Array.isArray(data) ? data : []);
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

	const handleAdd = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			setSaving(false);
			return;
		}
		try {
			const formData = {
				name: form.name.trim(),
				capacity: parseInt(form.capacity),
				status: form.status,
				is_active: true
			};
			const res = await fetch(`${apiBaseUrl}/tables`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(formData)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در افزودن میز');
				setSaving(false);
				return;
			}
			setSuccess('میز با موفقیت افزوده شد');
			setForm({
				name: '',
				capacity: '',
				status: 'available'
			});
			await fetchTables();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleEditClick = (table) => {
		setEditingTable(table);
		setEditForm({
			name: table.name || '',
			capacity: table.capacity?.toString() || '',
			status: table.status || 'available'
		});
		setEditDialogOpen(true);
		setError('');
		setSuccess('');
	};

	const handleEditChange = (field) => (e) => {
		setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
		if (error) setError('');
	};

	const handleEditSave = async () => {
		if (!editingTable) return;
		setSaving(true);
		setError('');
		setSuccess('');
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			setSaving(false);
			return;
		}
		try {
			const formData = {
				name: editForm.name.trim(),
				capacity: parseInt(editForm.capacity),
				status: editForm.status
			};
			const res = await fetch(`${apiBaseUrl}/tables/${editingTable.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				},
				body: JSON.stringify(formData)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در بروزرسانی میز');
				setSaving(false);
				return;
			}
			setSuccess('میز با موفقیت بروزرسانی شد');
			setEditDialogOpen(false);
			setEditingTable(null);
			await fetchTables();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleEditClose = () => {
		setEditDialogOpen(false);
		setEditingTable(null);
		setError('');
		setSuccess('');
	};

	const handleDelete = async (tableId) => {
		if (!window.confirm('آیا از حذف این میز مطمئن هستید؟')) return;
		const authToken = token || localStorage.getItem('authToken');
		if (!authToken) {
			setError('لطفاً ابتدا وارد سیستم شوید');
			return;
		}
		try {
			const res = await fetch(`${apiBaseUrl}/tables/${tableId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${authToken}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف میز ناموفق بود');
				return;
			}
			setSuccess('میز با موفقیت حذف شد');
			await fetchTables();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const getStatusColor = (status) => {
		return status === 'available' ? 'success' : 'warning';
	};

	const getStatusLabel = (status) => {
		return status === 'available' ? 'آزاد' : 'رزرو شده';
	};

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<TableRestaurant sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
					<Typography variant="h4" sx={{ fontWeight: 'bold' }}>مدیریت میزها</Typography>
				</Stack>
				<Button
					variant="outlined"
					startIcon={<Refresh />}
					onClick={fetchTables}
					disabled={loading}
					sx={{ borderRadius: 2 }}
				>
					بروزرسانی
				</Button>
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
				<Grid item xs={12}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<Add color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>افزودن میز جدید</Typography>
							</Stack>
							<Box component="form" onSubmit={handleAdd}>
								<Grid container spacing={2.5}>
									<Grid item xs={12} md={4}>
										<TextField
											label="نام/شماره میز"
											fullWidth
											value={form.name}
											onChange={handleChange('name')}
											required
											disabled={saving}
											variant="outlined"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2
												}
											}}
										/>
									</Grid>
									<Grid item xs={12} md={4}>
										<TextField
											label="ظرفیت (تعداد صندلی)"
											fullWidth
											type="number"
											inputProps={{ min: 1, max: 50 }}
											value={form.capacity}
											onChange={handleChange('capacity')}
											required
											disabled={saving}
											variant="outlined"
											InputProps={{
												startAdornment: <People sx={{ mr: 1, color: 'text.secondary' }} />
											}}
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2
												}
											}}
										/>
									</Grid>
									<Grid item xs={12} md={4}>
										<TextField
											select
											label="وضعیت"
											fullWidth
											value={form.status}
											onChange={handleChange('status')}
											required
											disabled={saving}
											variant="outlined"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 2
												}
											}}
										>
											<MenuItem value="available">آزاد</MenuItem>
											<MenuItem value="reserved">رزرو شده</MenuItem>
										</TextField>
									</Grid>
									<Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
										{saving && <CircularProgress size={22} />}
										<Button
											type="submit"
											variant="contained"
											startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Add />}
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
											disabled={saving || !form.name || !form.capacity}
										>
											افزودن میز
										</Button>
									</Grid>
								</Grid>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<TableRestaurant color="primary" />
									<Typography variant="h6" sx={{ fontWeight: 'bold' }}>لیست میزها</Typography>
									<Chip label={tables.length} color="primary" size="small" />
								</Stack>
								{loading && <CircularProgress size={24} />}
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{loading ? (
								<Box display="flex" justifyContent="center" p={4}>
									<CircularProgress />
								</Box>
							) : tables.length === 0 ? (
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
										میز ثبت نشده است.
									</Typography>
								</Paper>
							) : (
								<Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
									<Table>
										<TableHead>
											<TableRow sx={{ bgcolor: 'grey.100' }}>
												<TableCell sx={{ fontWeight: 'bold' }}>نام/شماره میز</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>ظرفیت</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>وضعیت</TableCell>
												<TableCell align="right" sx={{ fontWeight: 'bold' }}>عملیات</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{tables.map((table) => (
												<TableRow key={table.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
													<TableCell>
														<Typography variant="body2" sx={{ fontWeight: 500 }}>
															{table.name}
														</Typography>
													</TableCell>
													<TableCell>
														<Stack direction="row" alignItems="center" spacing={1}>
															<People fontSize="small" color="action" />
															<Typography variant="body2">{table.capacity} نفر</Typography>
														</Stack>
													</TableCell>
													<TableCell>
														<Chip
															label={getStatusLabel(table.status)}
															color={getStatusColor(table.status)}
															size="small"
														/>
													</TableCell>
													<TableCell align="right">
														<Stack direction="row" spacing={1} justifyContent="flex-end">
															<IconButton
																color="primary"
																onClick={() => handleEditClick(table)}
																sx={{
																	bgcolor: 'primary.light',
																	'&:hover': { bgcolor: 'primary.main' }
																}}
															>
																<Edit fontSize="small" />
															</IconButton>
															<IconButton
																color="error"
																onClick={() => handleDelete(table.id)}
																sx={{
																	bgcolor: 'error.light',
																	'&:hover': { bgcolor: 'error.main' }
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

			{/* Edit Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={handleEditClose}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: { borderRadius: 3 }
				}}
			>
				<DialogTitle sx={{ fontWeight: 'bold' }}>ویرایش اطلاعات میز</DialogTitle>
				<DialogContent>
					{error && (
						<Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
							{error}
						</Alert>
					)}
					{success && (
						<Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>
							{success}
						</Alert>
					)}
					<Grid container spacing={2.5} sx={{ mt: 1 }}>
						<Grid item xs={12}>
							<TextField
								label="نام/شماره میز"
								fullWidth
								value={editForm.name}
								onChange={handleEditChange('name')}
								required
								disabled={saving}
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label="ظرفیت (تعداد صندلی)"
								fullWidth
								type="number"
								inputProps={{ min: 1, max: 50 }}
								value={editForm.capacity}
								onChange={handleEditChange('capacity')}
								required
								disabled={saving}
								variant="outlined"
								InputProps={{
									startAdornment: <People sx={{ mr: 1, color: 'text.secondary' }} />
								}}
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								select
								label="وضعیت"
								fullWidth
								value={editForm.status}
								onChange={handleEditChange('status')}
								required
								disabled={saving}
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: 2
									}
								}}
							>
								<MenuItem value="available">آزاد</MenuItem>
								<MenuItem value="reserved">رزرو شده</MenuItem>
							</TextField>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={handleEditClose} disabled={saving} sx={{ borderRadius: 2 }}>
						انصراف
					</Button>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						{saving && <CircularProgress size={20} />}
						<Button
							onClick={handleEditSave}
							variant="contained"
							disabled={saving || !editForm.name || !editForm.capacity}
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
							ذخیره
						</Button>
					</Box>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default TableManagement;

