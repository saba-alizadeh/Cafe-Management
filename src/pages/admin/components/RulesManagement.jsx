import { useEffect, useState } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Grid,
	TextField,
	Button,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Stack,
	Alert,
	CircularProgress,
	Switch,
	FormControlLabel,
	Chip,
	Paper,
	Divider
} from '@mui/material';
import { Delete, Edit, Check, Close, Rule, Add, Save } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const RulesManagement = () => {
	const { apiBaseUrl, token } = useAuth();
	const [rules, setRules] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [newRule, setNewRule] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editingText, setEditingText] = useState('');
	const [editingActive, setEditingActive] = useState(true);

	useEffect(() => {
		if (token) fetchRules();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, apiBaseUrl]);

	const fetchRules = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/rules`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'خطا در بارگذاری قوانین');
				setLoading(false);
				return;
			}
			const data = await res.json();
			setRules(data);
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = async () => {
		if (!newRule.trim()) return;
		setSaving(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/rules`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ text: newRule })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در افزودن قانون');
				setSaving(false);
				return;
			}
			setRules((prev) => [data, ...prev]);
			setNewRule('');
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const startEdit = (rule) => {
		setEditingId(rule.id);
		setEditingText(rule.text);
		setEditingActive(rule.is_active);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditingText('');
		setEditingActive(true);
	};

	const handleUpdate = async (id) => {
		setSaving(true);
		setError('');
		try {
			const res = await fetch(`${apiBaseUrl}/rules/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ text: editingText, is_active: editingActive })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setError(data.detail || data.message || 'خطا در بروزرسانی قانون');
				setSaving(false);
				return;
			}
			setRules((prev) => prev.map((r) => (r.id === id ? data : r)));
			cancelEdit();
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('آیا از حذف قانون مطمئن هستید؟')) return;
		try {
			const res = await fetch(`${apiBaseUrl}/rules/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setError(data.detail || 'حذف قانون ناموفق بود');
				return;
			}
			setRules((prev) => prev.filter((r) => r.id !== id));
		} catch (err) {
			console.error(err);
			setError('خطا در ارتباط با سرور');
		}
	};

	return (
		<Box sx={{ direction: 'rtl', p: 3 }}>
			<Stack direction="row" alignItems="center" spacing={2} mb={3}>
				<Rule sx={{ fontSize: 32, color: 'var(--color-accent)' }} />
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>مدیریت قوانین</Typography>
			</Stack>

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
					{error}
				</Alert>
			)}

			<Grid container spacing={3}>
				<Grid item xs={12} md={5}>
					<Card elevation={3} sx={{ borderRadius: 3, height: 'fit-content' }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" alignItems="center" spacing={1} mb={3}>
								<Add color="primary" />
								<Typography variant="h6" sx={{ fontWeight: 'bold' }}>افزودن قانون جدید</Typography>
							</Stack>
							<Stack spacing={2}>
								<TextField
									fullWidth
									label="متن قانون"
									placeholder="متن قانون را وارد کنید..."
									value={newRule}
									onChange={(e) => setNewRule(e.target.value)}
									disabled={saving}
									multiline
									rows={4}
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: 2
										}
									}}
								/>
								<Button
									variant="contained"
									onClick={handleAdd}
									disabled={saving || !newRule.trim()}
									startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Add />}
									sx={{
										borderRadius: 2,
										py: 1.5,
										backgroundColor: 'var(--color-accent)',
										'&:hover': {
											backgroundColor: 'var(--color-accent)',
											opacity: 0.9
										}
									}}
								>
									افزودن قانون
								</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={7}>
					<Card elevation={3} sx={{ borderRadius: 3 }}>
						<CardContent sx={{ p: 3 }}>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
								<Stack direction="row" alignItems="center" spacing={1}>
									<Rule color="primary" />
									<Typography variant="h6" sx={{ fontWeight: 'bold' }}>فهرست قوانین</Typography>
									<Chip label={rules.length} color="primary" size="small" />
								</Stack>
								{loading && <CircularProgress size={24} />}
							</Stack>
							<Divider sx={{ mb: 2 }} />
							{loading ? (
								<Box display="flex" justifyContent="center" p={4}>
									<CircularProgress />
								</Box>
							) : rules.length === 0 ? (
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
										قانونی ثبت نشده است.
									</Typography>
								</Paper>
							) : (
								<List sx={{ p: 0 }}>
									{rules.map((r, index) => (
										<Box key={r.id}>
											<Paper
												elevation={0}
												sx={{
													p: 2,
													mb: 2,
													bgcolor: editingId === r.id ? 'action.hover' : 'background.paper',
													borderRadius: 2,
													border: '1px solid',
													borderColor: 'divider',
													transition: 'all 0.2s'
												}}
											>
												{editingId === r.id ? (
													<Stack spacing={2}>
														<TextField
															fullWidth
															value={editingText}
															onChange={(e) => setEditingText(e.target.value)}
															disabled={saving}
															multiline
															rows={3}
															variant="outlined"
															sx={{
																'& .MuiOutlinedInput-root': {
																	borderRadius: 2
																}
															}}
														/>
														<Stack direction="row" justifyContent="space-between" alignItems="center">
															<FormControlLabel
																control={
																	<Switch
																		checked={editingActive}
																		onChange={(e) => setEditingActive(e.target.checked)}
																		disabled={saving}
																		color="success"
																	/>
																}
																label={
																	<Chip
																		label={editingActive ? 'فعال' : 'غیرفعال'}
																		color={editingActive ? 'success' : 'default'}
																		size="small"
																	/>
																}
															/>
															<Stack direction="row" spacing={1}>
																<IconButton
																	color="success"
																	onClick={() => handleUpdate(r.id)}
																	disabled={saving}
																	sx={{ bgcolor: 'success.light', '&:hover': { bgcolor: 'success.main' } }}
																>
																	<Save />
																</IconButton>
																<IconButton
																	onClick={cancelEdit}
																	disabled={saving}
																	sx={{ bgcolor: 'grey.200', '&:hover': { bgcolor: 'grey.300' } }}
																>
																	<Close />
																</IconButton>
															</Stack>
														</Stack>
													</Stack>
												) : (
													<Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
														<Box sx={{ flex: 1 }}>
															<Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
																{r.text}
															</Typography>
															<Chip
																label={r.is_active ? 'فعال' : 'غیرفعال'}
																color={r.is_active ? 'success' : 'default'}
																size="small"
															/>
														</Box>
														<Stack direction="row" spacing={1}>
															<IconButton size="small" onClick={() => startEdit(r)}>
																<Edit />
															</IconButton>
															<IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
																<Delete />
															</IconButton>
														</Stack>
													</Stack>
												)}
											</Paper>
											{index < rules.length - 1 && <Divider sx={{ my: 1 }} />}
										</Box>
									))}
								</List>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default RulesManagement;
