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
    LinearProgress
} from '@mui/material';
import {
    Search,
    Inventory,
    Warning,
    CheckCircle,
    Edit,
    Add
} from '@mui/icons-material';

const InventoryStatus = () => {
    // Mock data - in real app, this would come from API
    const inventory = [
        {
            id: 1,
            name: 'دانه قهوه',
            category: 'نوشیدنی‌ها',
            currentStock: 15,
            minStock: 20,
            unit: 'kg',
            lastUpdated: '۱۴۰۲/۱۰/۲۵',
            status: 'Low Stock'
        },
        {
            id: 2,
            name: 'شیر تازه',
            category: 'لبنیات',
            currentStock: 50,
            minStock: 30,
            unit: 'liters',
            lastUpdated: '۱۴۰۲/۱۰/۲۵',
            status: 'In Stock'
        },
        {
            id: 3,
            name: 'شکر',
            category: 'شیرین‌کننده',
            currentStock: 8,
            minStock: 15,
            unit: 'kg',
            lastUpdated: '۱۴۰۲/۱۰/۲۴',
            status: 'Low Stock'
        },
        {
            id: 4,
            name: 'کراتسان تازه',
            category: 'شیرینی و نان',
            currentStock: 25,
            minStock: 20,
            unit: 'pieces',
            lastUpdated: '۱۴۰۲/۱۰/۲۵',
            status: 'In Stock'
        },
        {
            id: 5,
            name: 'چای کیسه‌ای',
            category: 'نوشیدنی‌ها',
            currentStock: 5,
            minStock: 10,
            unit: 'boxes',
            lastUpdated: '۱۴۰۲/۱۰/۲۳',
            status: 'Low Stock'
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
            case 'Out of Stock': return <Warning />;
            default: return <Inventory />;
        }
    };

    const statusLabels = {
        'In Stock': 'موجود',
        'Low Stock': 'رو به اتمام',
        'Out of Stock': 'تمام شده'
    };

    const unitLabels = {
        kg: 'کیلوگرم',
        liters: 'لیتر',
        pieces: 'عدد',
        boxes: 'بسته'
    };

    const getStockPercentage = (current, min) => {
        return Math.min((current / min) * 100, 100);
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">وضعیت موجودی</Typography>
                <Button variant="contained" startIcon={<Add />}>
                    به‌روزرسانی موجودی
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی اقلام..."
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
                                تعداد اقلام
                            </Typography>
                            <Typography variant="h4">{inventory.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                رو به اتمام
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {inventory.filter(item => item.status === 'Low Stock').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="text.secondary">
                                موجود
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {inventory.filter(item => item.status === 'In Stock').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Low Stock Alert */}
            {inventory.filter(item => item.status === 'Low Stock').length > 0 && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Warning sx={{ mr: 1, color: 'warning.dark' }} />
                        <Typography variant="h6" color="warning.dark">
                            هشدار کمبود موجودی
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="warning.dark">
                        {inventory.filter(item => item.status === 'Low Stock').length} قلم در آستانه اتمام است. لطفاً موجودی را به‌روزرسانی کرده یا با مدیر هماهنگ کنید.
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
                            <TableCell align="right">سطح موجودی</TableCell>
                            <TableCell align="right">آخرین بروزرسانی</TableCell>
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
                                    {item.currentStock} {unitLabels[item.unit] ?? item.unit}
                                </TableCell>
                                <TableCell align="right">
                                    {item.minStock} {unitLabels[item.unit] ?? item.unit}
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getStockPercentage(item.currentStock, item.minStock)}
                                            color={item.status === 'Low Stock' ? 'warning' : 'success'}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{item.lastUpdated}</TableCell>
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InventoryStatus;
