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
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    Search,
    CheckCircle,
    Pending,
    Restaurant,
    Timer,
    Receipt
} from '@mui/icons-material';

const OrderManagement = () => {
    // Mock data - in real app, this would come from API
    const orders = [
        {
            id: 1,
            customer: 'آرمان رضایی',
            items: [
                { name: 'کاپوچینو', quantity: 2, price: 185000 },
                { name: 'کراتسان کره‌ای', quantity: 1, price: 145000 }
            ],
            total: 515000,
            status: 'Preparing',
            orderTime: '۱۴:۱۵',
            estimatedTime: '۵ دقیقه'
        },
        {
            id: 2,
            customer: 'بهاره احمدی',
            items: [
                { name: 'لاته وانیل', quantity: 1, price: 195000 },
                { name: 'مافین بلوبری', quantity: 1, price: 165000 }
            ],
            total: 360000,
            status: 'Ready',
            orderTime: '۱۴:۱۰',
            estimatedTime: 'آماده تحویل'
        },
        {
            id: 3,
            customer: 'سهیل محمدی',
            items: [
                { name: 'اسپرسو دوبل', quantity: 3, price: 110000 }
            ],
            total: 330000,
            status: 'New',
            orderTime: '۱۴:۲۰',
            estimatedTime: '۳ دقیقه'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'info';
            case 'Preparing': return 'warning';
            case 'Ready': return 'success';
            case 'Completed': return 'default';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Ready': return <CheckCircle />;
            case 'Preparing': return <Timer />;
            case 'New': return <Pending />;
            default: return <Restaurant />;
        }
    };

    const statusLabels = {
        New: 'جدید',
        Preparing: 'در حال آماده‌سازی',
        Ready: 'آماده تحویل',
        Completed: 'تکمیل شده'
    };

    const formatNumber = (value) =>
        typeof value === 'number'
            ? new Intl.NumberFormat('fa-IR', {
                minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
                maximumFractionDigits: Number.isInteger(value) ? 0 : 1
            }).format(value)
            : value;

    const formatCurrency = (value) => `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت سفارش‌ها</Typography>
                <Button variant="contained" startIcon={<Restaurant />}>
                    سفارش جدید
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی سفارش..."
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
                                تعداد کل
                            </Typography>
                            <Typography variant="h4">{orders.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                در حال آماده‌سازی
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {orders.filter(o => o.status === 'Preparing').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                آماده تحویل
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {orders.filter(o => o.status === 'Ready').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Orders Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">شماره سفارش</TableCell>
                            <TableCell align="right">مشتری</TableCell>
                            <TableCell align="right">اقلام</TableCell>
                            <TableCell align="right">مبلغ کل</TableCell>
                            <TableCell align="right">وضعیت</TableCell>
                            <TableCell align="right">زمان</TableCell>
                            <TableCell align="right">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell align="right">سفارش {formatNumber(order.id)}</TableCell>
                                <TableCell align="right">{order.customer}</TableCell>
                                <TableCell align="right">
                                    <List dense>
                                        {order.items.map((item, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemText
                                                    primary={`${formatNumber(item.quantity)} × ${item.name}`}
                                                    secondary={formatCurrency(item.price)}
                                                    sx={{ textAlign: 'right' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </TableCell>
                                <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        icon={getStatusIcon(order.status)}
                                        label={statusLabels[order.status] ?? order.status}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Box>
                                        <Typography variant="body2">{order.orderTime}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {order.estimatedTime}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Button size="small" variant="outlined" startIcon={<CheckCircle />}>
                                        تکمیل شد
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default OrderManagement;
