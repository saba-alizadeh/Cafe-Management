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
	FormControlLabel
} from '@mui/material';
import { Delete, Edit, Check, Close } from '@mui/icons-material';
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
		<Box>
			<Typography variant="h4" gutterBottom>مدیریت قوانین</Typography>

			{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

			<Grid container spacing={3}>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
								<TextField
									fullWidth
									label="قانون جدید"
									placeholder="متن قانون را وارد کنید"
									value={newRule}
									onChange={(e) => setNewRule(e.target.value)}
									disabled={saving}
								/>
								<Button
									variant="contained"
									onClick={handleAdd}
									disabled={saving || !newRule.trim()}
									sx={{ backgroundColor: 'var(--color-accent)' }}
								>
									افزودن قانون
								</Button>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12} md={6}>
					<Card>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
								<Typography variant="h6">فهرست قوانین</Typography>
								{loading && <CircularProgress size={22} />}
							</Stack>
							{loading ? (
								<Box display="flex" justifyContent="center" p={3}>
									<CircularProgress />
								</Box>
							) : rules.length === 0 ? (
								<Typography variant="body2" color="text.secondary">قانونی ثبت نشده است.</Typography>
							) : (
								<List>
									{rules.map((r) => (
										<ListItem
											key={r.id}
											divider
											secondaryAction={
												editingId === r.id ? (
													<Stack direction="row" spacing={1}>
														<IconButton edge="end" color="success" onClick={() => handleUpdate(r.id)} disabled={saving}>
															<Check />
														</IconButton>
														<IconButton edge="end" onClick={cancelEdit} disabled={saving}>
															<Close />
														</IconButton>
													</Stack>
												) : (
													<Stack direction="row" spacing={1}>
														<IconButton edge="end" onClick={() => startEdit(r)}>
															<Edit />
														</IconButton>
														<IconButton edge="end" color="error" onClick={() => handleDelete(r.id)}>
															<Delete />
														</IconButton>
													</Stack>
												)
											}
										>
											{editingId === r.id ? (
												<Stack spacing={1} sx={{ width: '100%' }}>
													<TextField
														fullWidth
														value={editingText}
														onChange={(e) => setEditingText(e.target.value)}
														disabled={saving}
													/>
													<FormControlLabel
														control={
															<Switch
																checked={editingActive}
																onChange={(e) => setEditingActive(e.target.checked)}
																disabled={saving}
																color="success"
															/>
														}
														label="فعال"
													/>
												</Stack>
											) : (
												<ListItemText
													primary={r.text}
													secondary={r.is_active ? 'فعال' : 'غیرفعال'}
												/>
											)}
										</ListItem>
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
