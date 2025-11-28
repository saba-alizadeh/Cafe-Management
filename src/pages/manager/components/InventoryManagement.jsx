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
    InputAdornment
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Inventory,
    Warning,
    CheckCircle,
    LocalShipping
} from '@mui/icons-material';

const InventoryManagement = () => {
    // Mock data - in real app, this would come from API
    const inventory = [
        {
            id: 1,
            name: 'دانه قهوه کلمبیا',
            category: 'نوشیدنی گرم',
            currentStock: 18,
            minStock: 25,
            unit: 'kg',
            price: 780000,
            status: 'Low Stock'
        },
        {
            id: 2,
            name: 'شیر تازه ارگانیک',
            category: 'لبنیات',
            currentStock: 62,
            minStock: 40,
            unit: 'liters',
            price: 48000,
            status: 'In Stock'
        },
        {
            id: 3,
            name: 'سیروپ وانیل',
            category: 'افزودنی‌ها',
            currentStock: 12,
            minStock: 20,
            unit: 'liters',
            price: 215000,
            status: 'Low Stock'
        },
        {
            id: 4,
            name: 'کراتسان کره‌ای',
            category: 'شیرینی روزانه',
            currentStock: 36,
            minStock: 24,
            unit: 'pieces',
            price: 64000,
            status: 'In Stock'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Stock': return 'success';
            case 'Low Stock': return 'warning';
            case 'Out of Stock': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'In Stock': return <CheckCircle />;
            case 'Low Stock': return <Warning />;
            case 'Out of Stock': return <Delete />;
            default: return <Inventory />;
        }
    };

    const statusLabels = {
        'In Stock': 'موجود',
        'Low Stock': 'رو به اتمام',
        'Out of Stock': 'ناموجود'
    };

    const unitLabels = {
        kg: 'کیلوگرم',
        liters: 'لیتر',
        pieces: 'عدد'
    };

    const formatCurrency = (value) => `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;
    const formatNumber = (value) => new Intl.NumberFormat('fa-IR').format(value);

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت موجودی</Typography>
                <Button variant="contained" startIcon={<Add />}>
                    افزودن کالا
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی کالا..."
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
                            <Typography variant="h6" color="textSecondary">
                                تعداد اقلام
                            </Typography>
                            <Typography variant="h4">{formatNumber(inventory.length)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                رو به اتمام
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {formatNumber(inventory.filter(item => item.status === 'Low Stock').length)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                ارزش کل موجودی
                            </Typography>
                            <Typography variant="h4">
                                {formatCurrency(inventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0))}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Low Stock Alerts */}
            {inventory.filter(item => item.status === 'Low Stock').length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Warning sx={{ ml: 1, color: 'warning.dark' }} />
                        <Typography variant="h6" color="warning.dark">
                            هشدار کمبود موجودی
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="warning.dark">
                        {formatNumber(inventory.filter(item => item.status === 'Low Stock').length)} قلم در آستانه اتمام است. لطفاً سفارش تامین را بررسی کنید.
                    </Typography>
                </Paper>
            )}

            {/* Inventory Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">نام کالا</TableCell>
                            <TableCell align="right">دسته‌بندی</TableCell>
                            <TableCell align="right">موجودی فعلی</TableCell>
                            <TableCell align="right">حداقل موجودی</TableCell>
                            <TableCell align="right">قیمت واحد</TableCell>
                            <TableCell align="right">ارزش کل</TableCell>
                            <TableCell align="right">وضعیت</TableCell>
                            <TableCell align="right">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inventory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell align="right">
                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                                        {item.name}
                                        <Inventory />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{item.category}</TableCell>
                                <TableCell align="right">
                                    {formatNumber(item.currentStock)} {unitLabels[item.unit] ?? item.unit}
                                </TableCell>
                                <TableCell align="right">
                                    {formatNumber(item.minStock)} {unitLabels[item.unit] ?? item.unit}
                                </TableCell>
                                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                <TableCell align="right">{formatCurrency(item.currentStock * item.price)}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        icon={getStatusIcon(item.status)}
                                        label={statusLabels[item.status] ?? item.status}
                                        color={getStatusColor(item.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" color="secondary">
                                        <LocalShipping />
                                    </IconButton>
                                    <IconButton size="small" color="error">
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InventoryManagement;
