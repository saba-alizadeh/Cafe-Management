import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    TextField,
    InputAdornment,
    CircularProgress,
    Stack,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import {
    Search,
    Schedule,
    CheckCircle,
    Cancel,
    Close,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const ReservationManagement = () => {
    const { apiBaseUrl, token, user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const authToken = token || localStorage.getItem('authToken');
    const cafeId = user?.cafe_id;

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending':
            case 'pending_approval': return 'warning';
            case 'completed': return 'default';
            case 'cancelled':
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'تایید شده';
            case 'pending':
            case 'pending_approval': return 'در انتظار تایید';
            case 'completed': return 'انجام شده';
            case 'cancelled': return 'لغو شده';
            case 'rejected': return 'رد شده';
            default: return status || 'نامشخص';
        }
    };

    const getTypeLabel = (reservationType, kind) => {
        if (kind === 'order') return 'سفارش محصولات';
        switch (reservationType) {
            case 'table': return 'رزرو میز';
            case 'coworking': return 'فضای مشترک';
            case 'cinema': return 'سینما';
            case 'event': return 'رویداد';
            default: return 'رزرو';
        }
    };

    const fetchData = async () => {
        if (!authToken) {
            setError('احراز هویت در دسترس نیست');
            return;
        }

        setLoading(true);
        setError('');

        const cafeParam = cafeId ? `?cafe_id=${encodeURIComponent(cafeId)}` : '';
        try {
            const [reservationsRes, ordersRes] = await Promise.all([
                fetch(`${apiBaseUrl}/reservations${cafeParam}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
                fetch(`${apiBaseUrl}/orders${cafeParam}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                }),
            ]);

            if (!reservationsRes.ok) {
                const data = await reservationsRes.json().catch(() => ({}));
                throw new Error(data.detail || 'خطا در دریافت رزروها');
            }
            if (!ordersRes.ok) {
                const data = await ordersRes.json().catch(() => ({}));
                throw new Error(data.detail || 'خطا در دریافت سفارش‌ها');
            }

            const reservationsData = await reservationsRes.json();
            const ordersData = await ordersRes.json();

            const mappedReservations = Array.isArray(reservationsData)
                ? reservationsData.map((r) => ({
                    id: r.id,
                    kind: 'reservation',
                    cafe_id: r.cafe_id,
                    reservation_type: r.reservation_type,
                    date: r.date,
                    time: r.time,
                    status: r.status,
                    number_of_people: r.number_of_people,
                    resource_info:
                        r.reservation_type === 'table'
                            ? `میز ${r.table_id ?? ''}`
                            : r.reservation_type === 'coworking'
                                ? `میز اشتراکی ${r.table_id ?? ''}`
                                : r.reservation_type === 'cinema'
                                    ? `سینما - جلسه ${r.session_id ?? ''}`
                                    : r.reservation_type === 'event'
                                        ? `رویداد ${r.event_id ?? ''}`
                                        : '',
                }))
                : [];

            const mappedOrders = Array.isArray(ordersData)
                ? ordersData.map((o) => ({
                    id: o.id,
                    kind: 'order',
                    cafe_id: o.cafe_id,
                    reservation_type: 'order',
                    date: new Date(o.created_at).toLocaleDateString('fa-IR'),
                    time: new Date(o.created_at).toLocaleTimeString('fa-IR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    status: o.status,
                    number_of_people: null,
                    resource_info: `سفارش محصولات (${o.items.length} آیتم)`,
                }))
                : [];

            setItems([...mappedReservations, ...mappedOrders]);
        } catch (err) {
            console.error(err);
            setError(err.message || 'خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBaseUrl, authToken, cafeId]);

    const handleUpdateStatus = async (item, newStatus) => {
        const itemCafeId = item.cafe_id ?? cafeId;
        if (!itemCafeId) {
            setError('شناسه کافه برای به‌روزرسانی در دسترس نیست');
            return;
        }
        if (!window.confirm('آیا از تغییر وضعیت این مورد اطمینان دارید؟')) return;
        try {
            setLoading(true);
            setError('');

            if (item.kind === 'order') {
                const res = await fetch(
                    `${apiBaseUrl}/orders/${encodeURIComponent(
                        item.id
                    )}?cafe_id=${encodeURIComponent(itemCafeId)}&status_update=${encodeURIComponent(
                        newStatus
                    )}`,
                    {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.detail || 'خطا در به‌روزرسانی سفارش');
                }
                const updated = await res.json();
                setItems((prev) =>
                    prev.map((it) =>
                        it.kind === 'order' && it.id === updated.id
                            ? { ...it, status: updated.status }
                            : it
                    )
                );
            } else {
                const res = await fetch(
                    `${apiBaseUrl}/reservations/${encodeURIComponent(
                        item.id
                    )}?cafe_id=${encodeURIComponent(
                        itemCafeId
                    )}&status_update=${encodeURIComponent(newStatus)}`,
                    {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                );
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.detail || 'خطا در به‌روزرسانی رزرو');
                }
                const updated = await res.json();
                setItems((prev) =>
                    prev.map((it) =>
                        it.kind === 'reservation' && it.id === updated.id
                            ? { ...it, status: updated.status }
                            : it
                    )
                );
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        return items.filter((it) => {
            // Reservations section: only table and order (food/drinks)
            if (it.kind === 'reservation' && it.reservation_type !== 'table') return false;
            if (statusFilter !== 'all' && it.status !== statusFilter) return false;
            if (typeFilter !== 'all') {
                if (typeFilter === 'order' && it.kind !== 'order') return false;
                if (typeFilter !== 'order' && it.kind === 'reservation' && it.reservation_type !== typeFilter)
                    return false;
            }
            if (query.trim()) {
                const q = query.trim();
                if (!String(it.resource_info || '').includes(q)) return false;
            }
            return true;
        });
    }, [items, statusFilter, typeFilter, query]);

    const totalCount = filteredItems.length;
    const confirmedCount = filteredItems.filter((i) => i.status === 'confirmed').length;
    const pendingCount = filteredItems.filter((i) => i.status === 'pending').length;

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت رزروها</Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجو بر اساس جزئیات..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        inputProps={{ dir: 'rtl' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                موارد فعلی
                            </Typography>
                            <Typography variant="h4">{totalCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                تایید شده
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {confirmedCount}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                در انتظار
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {pendingCount}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="flex-start">
                <ToggleButtonGroup
                    size="small"
                    color="primary"
                    value={statusFilter}
                    exclusive
                    onChange={(_, val) => {
                        if (val !== null) setStatusFilter(val);
                    }}
                >
                <ToggleButton value="all">همه وضعیت‌ها</ToggleButton>
                <ToggleButton value="pending_approval">در انتظار تایید</ToggleButton>
                <ToggleButton value="confirmed">تایید شده</ToggleButton>
                <ToggleButton value="completed">انجام شده</ToggleButton>
                <ToggleButton value="rejected">رد شده</ToggleButton>
                <ToggleButton value="cancelled">لغو شده</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup
                    size="small"
                    color="primary"
                    value={typeFilter}
                    exclusive
                    onChange={(_, val) => {
                        if (val !== null) setTypeFilter(val);
                    }}
                >
                <ToggleButton value="all">همه انواع</ToggleButton>
                <ToggleButton value="table">میز</ToggleButton>
                <ToggleButton value="order">سفارش محصولات</ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {/* Reservations Table */}
            {loading && (
                <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">نوع</TableCell>
                                <TableCell align="right">جزئیات</TableCell>
                                <TableCell align="right">تعداد نفرات</TableCell>
                                <TableCell align="right">تاریخ و ساعت</TableCell>
                                <TableCell align="right">وضعیت</TableCell>
                                <TableCell align="right">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={`${item.kind}-${item.id}`}>
                                    <TableCell align="right">
                                        <Chip
                                            label={getTypeLabel(item.reservation_type, item.kind)}
                                            size="small"
                                            color={item.kind === 'order' ? 'secondary' : 'primary'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2">
                                            {item.resource_info}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2">
                                            {item.number_of_people != null ? `${item.number_of_people} نفر` : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2">{item.date}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.time}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={getStatusLabel(item.status)}
                                            color={getStatusColor(item.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                                            {(item.status === 'pending_approval' || item.status === 'pending') && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<CheckCircle />}
                                                        onClick={() => handleUpdateStatus(item, 'confirmed')}
                                                        disabled={loading}
                                                    >
                                                        تایید
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<Close />}
                                                        onClick={() => handleUpdateStatus(item, 'rejected')}
                                                        disabled={loading}
                                                    >
                                                        رد
                                                    </Button>
                                                </>
                                            )}
                                            {item.status !== 'cancelled' && item.status !== 'rejected' && (item.status === 'confirmed' || item.status === 'completed') && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<Cancel />}
                                                    onClick={() => handleUpdateStatus(item, 'cancelled')}
                                                    disabled={loading}
                                                >
                                                    لغو
                                                </Button>
                                            )}
                                        </Stack>
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

export default ReservationManagement;
