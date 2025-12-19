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
	DialogActions
} from '@mui/material';
import { Edit, Delete, Refresh } from '@mui/icons-material';
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
		status: 'available',
		cafe_id: null
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
				cafe_id: form.cafe_id || null
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
				status: 'available',
				cafe_id: null
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
		<Box sx={{ direction: 'rtl' }}>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
				<Typography variant="h4">مدیریت میزها</Typography>
				<Button variant="outlined" startIcon={<Refresh />} onClick={fetchTables} disabled={loading}>
					بروزرسانی
				</Button>
			</Box>

			{error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
			{success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>افزودن میز جدید</Typography>
							<Box component="form" onSubmit={handleAdd}>
								<Grid container spacing={2}>
									<Grid item xs={12} md={4}>
										<TextField
											label="نام/شماره میز"
											fullWidth
											value={form.name}
											onChange={handleChange('name')}
											required
											disabled={saving}
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
											sx={{ borderRadius: 999, px: 4, backgroundColor: 'var(--color-accent)' }}
											disabled={saving || !form.name || !form.capacity}
										>
											افزودن
										</Button>
									</Grid>
								</Grid>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6">لیست میزها</Typography>
								{loading && <CircularProgress size={22} />}
							</Stack>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : tables.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									میز ثبت نشده است.
								</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>نام/شماره میز</TableCell>
											<TableCell>ظرفیت</TableCell>
											<TableCell>وضعیت</TableCell>
											<TableCell>کافه</TableCell>
											<TableCell align="right">عملیات</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{tables.map((table) => (
											<TableRow key={table.id} hover>
												<TableCell>{table.name}</TableCell>
												<TableCell>{table.capacity}</TableCell>
												<TableCell>
													<Chip
														label={getStatusLabel(table.status)}
														color={getStatusColor(table.status)}
														size="small"
													/>
												</TableCell>
												<TableCell>{table.cafe_id ?? '—'}</TableCell>
												<TableCell align="right">
													<Stack direction="row" spacing={1} justifyContent="flex-end">
														<IconButton color="primary" onClick={() => handleEditClick(table)}>
															<Edit />
														</IconButton>
														<IconButton color="error" onClick={() => handleDelete(table.id)}>
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

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
				<DialogTitle>ویرایش اطلاعات میز</DialogTitle>
				<DialogContent>
					{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
					{success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
					<Grid container spacing={2} sx={{ mt: 1 }}>
						<Grid item xs={12}>
							<TextField
								label="نام/شماره میز"
								fullWidth
								value={editForm.name}
								onChange={handleEditChange('name')}
								required
								disabled={saving}
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
							>
								<MenuItem value="available">آزاد</MenuItem>
								<MenuItem value="reserved">رزرو شده</MenuItem>
							</TextField>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleEditClose} disabled={saving}>
						انصراف
					</Button>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						{saving && <CircularProgress size={20} />}
						<Button
							onClick={handleEditSave}
							variant="contained"
							disabled={saving || !editForm.name || !editForm.capacity}
							sx={{ backgroundColor: 'var(--color-accent)' }}
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

