import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    Delete,
    Refresh,
    Phone,
    Email,
    Shield
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const AdminManagement = () => {
    const { apiBaseUrl, token } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getToken = () => token || localStorage.getItem('authToken');

    const fetchAdmins = async () => {
        setLoading(true);
        setError('');
        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${apiBaseUrl}/admins`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'خطا در بارگذاری مدیران');
                setLoading(false);
                return;
            }
            const data = await res.json();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, apiBaseUrl]);

    const handleDelete = async (adminId) => {
        if (!window.confirm('آیا از غیرفعال کردن این مدیر مطمئن هستید؟')) return;
        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            return;
        }
        try {
            const res = await fetch(`${apiBaseUrl}/admins/${adminId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'غیرفعالسازی مدیر ناموفق بود');
                return;
            }
            setSuccess('مدیر غیرفعال شد');
            await fetchAdmins();
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        }
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space_between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4">مدیریت مدیران (Admins)</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        مدیر هر کافه به صورت خودکار هنگام ثبت کافه ایجاد می‌شود
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchAdmins} disabled={loading}>
                    بروزرسانی
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : admins.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        مدیری ثبت نشده است
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        با ایجاد کافه جدید، مدیر مربوطه نیز ایجاد می‌شود
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>نام مدیر</TableCell>
                                <TableCell>نام کاربری</TableCell>
                                <TableCell>کافه</TableCell>
                                <TableCell>اطلاعات تماس</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {admins.map((adm) => (
                                <TableRow key={adm.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Shield fontSize="small" color="primary" />
                                            <Typography>{adm.name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{adm.username}</TableCell>
                                    <TableCell>{adm.cafe_id ?? '—'}</TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            {adm.phone && (
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Phone fontSize="small" />
                                                    <Typography variant="body2">{adm.phone}</Typography>
                                                </Stack>
                                            )}
                                            {adm.email && (
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <Email fontSize="small" />
                                                    <Typography variant="body2">{adm.email}</Typography>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={adm.is_active ? 'فعال' : 'غیرفعال'}
                                            color={adm.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton color="error" onClick={() => handleDelete(adm.id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default AdminManagement;
