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
    IconButton
} from '@mui/material';
import {
    Search,
    Restaurant,
    Receipt,
    Star,
    Reorder,
    Visibility
} from '@mui/icons-material';

const OrderHistory = () => {
    const formatCurrency = (value) =>
        new Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR' }).format(value);

    // Mock data - in real app, this would come from API
    const orders = [
        {
            id: 1,
            date: '۲۰۲۴/۰۱/۱۵',
            time: '۱۴:۱۵',
            items: [
                { name: 'کاپوچینو', quantity: 2, price: 145000 },
                { name: 'کرواسان کره‌ای', quantity: 1, price: 95000 }
            ],
            total: 385000,
            status: 'Completed',
            cafe: 'کافه گوشه',
            rating: 5
        },
        {
            id: 2,
            date: '۲۰۲۴/۰۱/۱۴',
            time: '۱۰:۳۰',
            items: [
                { name: 'لاته', quantity: 1, price: 130000 },
                { name: 'مافین بلوبری', quantity: 1, price: 85000 }
            ],
            total: 215000,
            status: 'Completed',
            cafe: 'بین و برو',
            rating: 4
        },
        {
            id: 3,
            date: '۲۰۲۴/۰۱/۱۳',
            time: '۱۵:۴۵',
            items: [
                { name: 'اسپرسو', quantity: 3, price: 90000 }
            ],
            total: 270000,
            status: 'Completed',
            cafe: 'طلوع صبح',
            rating: 5
        },
        {
            id: 4,
            date: '۲۰۲۴/۰۱/۱۲',
            time: '۱۳:۲۰',
            items: [
                { name: 'آمریکانو', quantity: 1, price: 110000 },
                { name: 'ساندویچ مخصوص', quantity: 1, price: 210000 }
            ],
            total: 320000,
            status: 'Cancelled',
            cafe: 'کافه گوشه',
            rating: null
        }
    ];

    const statusLabels = {
        Completed: 'تکمیل شده',
        Cancelled: 'لغو شده',
        Pending: 'در انتظار'
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Cancelled': return 'error';
            case 'Pending': return 'warning';
            default: return 'default';
        }
    };

    const renderStars = (rating) => {
        if (!rating) return null;
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                sx={{
                    color: i < rating ? 'gold' : 'grey.300',
                    fontSize: 'small'
                }}
            />
        ));
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">تاریخچه سفارش‌ها</Typography>
                <Button variant="outlined" startIcon={<Reorder />}>
                    سفارش مجدد
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی سفارش..."
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
                                کل سفارش‌ها
                            </Typography>
                            <Typography variant="h4">{orders.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                سفارش تکمیل‌شده
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {orders.filter(o => o.status === 'Completed').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                جمع هزینه
                            </Typography>
                            <Typography variant="h5">
                                {formatCurrency(
                                    orders
                                        .filter(o => o.status === 'Completed')
                                        .reduce((sum, order) => sum + order.total, 0)
                                )}
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
                            <TableCell>شماره سفارش</TableCell>
                            <TableCell>تاریخ و ساعت</TableCell>
                            <TableCell>کافه</TableCell>
                            <TableCell>اقلام</TableCell>
                            <TableCell>مبلغ</TableCell>
                            <TableCell>وضعیت</TableCell>
                            <TableCell>امتیاز</TableCell>
                            <TableCell>اقدامات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>#{order.id}</TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2">{order.date}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {order.time}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{order.cafe}</TableCell>
                                <TableCell>
                                    <Box>
                                        {order.items.map((item, index) => (
                                            <Typography key={index} variant="body2">
                                                {item.quantity}× {item.name}
                                            </Typography>
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>{formatCurrency(order.total)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={statusLabels[order.status] ?? order.status}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        {renderStars(order.rating)}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary">
                                        <Visibility />
                                    </IconButton>
                                    {order.status === 'Completed' && (
                                        <Button size="small" variant="outlined" startIcon={<Reorder />}>
                                            سفارش مجدد
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default OrderHistory;
