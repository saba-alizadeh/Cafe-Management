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
	Switch,
	IconButton,
	Alert,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const roles = [
	{ value: 'waiter', label: 'گارسون' },
	{ value: 'floor_staff', label: 'پرسنل سالن' },
	{ value: 'bartender', label: 'باریستا' }
];

const EmployeeManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [employees, setEmployees] = useState([]);
	const [rewards, setRewards] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState(null);
	const [form, setForm] = useState({
		nationalId: '',
		phone: '',
		firstName: '',
		lastName: '',
		role: 'waiter',
		iban: '',
		father_name: '',
		date_of_birth: '',
		address: ''
	});
	const [editForm, setEditForm] = useState({
		nationalId: '',
		phone: '',
		firstName: '',
		lastName: '',
		role: 'waiter',
		iban: '',
		father_name: '',
		date_of_birth: '',
		address: ''
	});

	useEffect(() => {
		if (token) fetchEmployees();
		if (token) fetchRewards();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchEmployees = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری کارکنان');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setEmployees(data);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const fetchRewards = async () => {
		try {
			const res = await fetch(`${apiBaseUrl}/rewards`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				setRewards(data);
			}
		} catch (err) {
			console.error(err);
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
		try {
			// Clean form data: convert empty strings to null for optional fields
			const formData = {
				...form,
				iban: form.iban?.trim() || null,
				father_name: form.father_name?.trim() || null,
				date_of_birth: form.date_of_birth?.trim() || null,
				address: form.address?.trim() || null
			};
			const res = await fetch(`${apiBaseUrl}/auth/employees`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در افزودن کارمند');
				setSaving(false);
				return;
			}
			setEmployees((prev) => [data, ...prev]);
			setForm({
				nationalId: '',
				phone: '',
				firstName: '',
				lastName: '',
				role: 'waiter',
				iban: '',
				father_name: '',
				date_of_birth: '',
				address: ''
			});
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('آیا از حذف این کارمند اطمینان دارید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف کارمند ناموفق بود');
				return;
			}
			setEmployees((prev) => prev.filter((e) => e.id !== id));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const handleToggle = async (id, is_active) => {
		try {
			const res = await fetch(`${apiBaseUrl}/auth/employees/${id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ is_active })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || 'بروزرسانی وضعیت ناموفق بود');
				return;
			}
			setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	const rewardSummary = (employeeId) => {
		let bonus = 0;
		let penalty = 0;
		rewards.forEach((r) => {
			if (r.employee_id === employeeId) {
				if (r.reward_type === 'bonus') bonus += r.amount;
				else penalty += r.amount;
			}
		});
		return { bonus, penalty };
	};

	const handleEditClick = (employee) => {
		setEditingEmployee(employee);
		setEditForm({
			nationalId: employee.nationalId || '',
			phone: employee.phone || '',
			firstName: employee.firstName || '',
			lastName: employee.lastName || '',
			role: employee.role || 'waiter',
			iban: employee.iban || '',
			father_name: employee.father_name || '',
			date_of_birth: employee.date_of_birth || '',
			address: employee.address || ''
		});
		setEditDialogOpen(true);
		setError('');
	};

	const handleEditChange = (field) => (e) => {
		setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
		if (error) setError('');
	};

	const handleEditSave = async () => {
		if (!editingEmployee) return;
		setSaving(true);
		setError('');
		try {
			// Clean form data: convert empty strings to null for optional fields
			const formData = {
				...editForm,
				iban: editForm.iban?.trim() || null,
				father_name: editForm.father_name?.trim() || null,
				date_of_birth: editForm.date_of_birth?.trim() || null,
				address: editForm.address?.trim() || null
			};
			const res = await fetch(`${apiBaseUrl}/auth/employees/${editingEmployee.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در بروزرسانی کارمند');
				setSaving(false);
				return;
			}
			setEmployees((prev) => prev.map((e) => (e.id === editingEmployee.id ? data : e)));
			setEditDialogOpen(false);
			setEditingEmployee(null);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleEditClose = () => {
		setEditDialogOpen(false);
		setEditingEmployee(null);
		setError('');
	};

	return (
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت کارکنان</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>افزودن کارمند جدید</Typography>
							<Box component="form" onSubmit={handleAdd}>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<TextField
											label="کد ملی"
											fullWidth
											value={form.nationalId}
											onChange={handleChange('nationalId')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="شماره تماس"
											fullWidth
											value={form.phone}
											onChange={handleChange('phone')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="نام"
											fullWidth
											value={form.firstName}
											onChange={handleChange('firstName')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="نام خانوادگی"
											fullWidth
											value={form.lastName}
											onChange={handleChange('lastName')}
											required
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											select
											label="نقش"
											fullWidth
											value={form.role}
											onChange={handleChange('role')}
											required
											disabled={saving}
										>
											{roles.map((r) => (
												<MenuItem key={r.value} value={r.value}>
													{r.label}
												</MenuItem>
											))}
										</TextField>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="شماره شبا (IBAN)"
											fullWidth
											value={form.iban}
											onChange={handleChange('iban')}
											disabled={saving}
											placeholder="IR..."
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="نام پدر"
											fullWidth
											value={form.father_name}
											onChange={handleChange('father_name')}
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<TextField
											label="تاریخ تولد"
											fullWidth
											type="date"
											value={form.date_of_birth}
											onChange={handleChange('date_of_birth')}
											disabled={saving}
											InputLabelProps={{ shrink: true }}
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											label="آدرس"
											fullWidth
											multiline
											rows={3}
											value={form.address}
											onChange={handleChange('address')}
											disabled={saving}
										/>
									</Grid>
									<Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
										{saving && <CircularProgress size={22} />}
										<Button
											type="submit"
											variant="contained"
											sx={{ borderRadius: 999, px: 4, backgroundColor: 'var(--color-accent)' }}
											disabled={saving || !form.nationalId || !form.phone || !form.firstName || !form.lastName}
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
								<Typography variant="h6">لیست کارکنان</Typography>
								{loading && <CircularProgress size={22} />}
							</Stack>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : employees.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									کارمندی ثبت نشده است.
								</Typography>
							) : (
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>کد ملی</TableCell>
											<TableCell>نام و نام خانوادگی</TableCell>
											<TableCell>شماره تماس</TableCell>
											<TableCell>نقش</TableCell>
											<TableCell>پاداش / جریمه</TableCell>
											<TableCell>وضعیت</TableCell>
											<TableCell align="right">عملیات</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{employees.map((e) => (
											<TableRow key={e.id}>
												<TableCell>{e.nationalId}</TableCell>
												<TableCell>{`${e.firstName} ${e.lastName}`}</TableCell>
												<TableCell>{e.phone}</TableCell>
											<TableCell>
												<Chip size="small" label={roles.find((r) => r.value === e.role)?.label || e.role} />
											</TableCell>
											<TableCell>
												{(() => {
													const { bonus, penalty } = rewardSummary(e.id);
													return (
														<Stack direction="row" spacing={1}>
															<Chip size="small" color="success" label={`+${bonus}`} />
															<Chip size="small" color="warning" label={`-${penalty}`} />
														</Stack>
													);
												})()}
											</TableCell>
												<TableCell>
													<Stack direction="row" alignItems="center" spacing={1}>
														<Typography variant="body2">غیرفعال</Typography>
														<Switch
															checked={e.is_active}
															onChange={(ev) => handleToggle(e.id, ev.target.checked)}
															color="success"
														/>
														<Typography variant="body2">فعال</Typography>
													</Stack>
												</TableCell>
												<TableCell align="right">
													<Stack direction="row" spacing={1} justifyContent="flex-end">
														<IconButton color="primary" onClick={() => handleEditClick(e)}>
															<Edit />
														</IconButton>
													<IconButton color="error" onClick={() => handleDelete(e.id)}>
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
			<Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
				<DialogTitle>ویرایش اطلاعات کارمند</DialogTitle>
				<DialogContent>
					{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
					<Grid container spacing={2} sx={{ mt: 1 }}>
						<Grid item xs={12} md={6}>
							<TextField
								label="کد ملی"
								fullWidth
								value={editForm.nationalId}
								onChange={handleEditChange('nationalId')}
								required
								disabled={saving}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="شماره تماس"
								fullWidth
								value={editForm.phone}
								onChange={handleEditChange('phone')}
								required
								disabled={saving}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="نام"
								fullWidth
								value={editForm.firstName}
								onChange={handleEditChange('firstName')}
								required
								disabled={saving}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="نام خانوادگی"
								fullWidth
								value={editForm.lastName}
								onChange={handleEditChange('lastName')}
								required
								disabled={saving}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								select
								label="نقش"
								fullWidth
								value={editForm.role}
								onChange={handleEditChange('role')}
								required
								disabled={saving}
							>
								{roles.map((r) => (
									<MenuItem key={r.value} value={r.value}>
										{r.label}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="شماره شبا (IBAN)"
								fullWidth
								value={editForm.iban}
								onChange={handleEditChange('iban')}
								disabled={saving}
								placeholder="IR..."
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="نام پدر"
								fullWidth
								value={editForm.father_name}
								onChange={handleEditChange('father_name')}
								disabled={saving}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								label="تاریخ تولد"
								fullWidth
								type="date"
								value={editForm.date_of_birth}
								onChange={handleEditChange('date_of_birth')}
								disabled={saving}
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label="آدرس"
								fullWidth
								multiline
								rows={3}
								value={editForm.address}
								onChange={handleEditChange('address')}
								disabled={saving}
							/>
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
							disabled={saving || !editForm.nationalId || !editForm.phone || !editForm.firstName || !editForm.lastName}
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

export default EmployeeManagement;
