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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    Assessment,
    Download,
    FilterList
} from '@mui/icons-material';

const SalesReports = () => {
    // Mock data - in real app, this would come from API
    const reportData = {
        totalSales: 248000000,
        monthlyGrowth: 8.5,
        dailyAverage: 8600000,
        totalOrders: 1280,
        averageOrderValue: 194000
    };

    const dailySales = [
        { date: '۱۴۰۲/۱۰/۲۵', sales: 9200000, orders: 48, growth: 5.2 },
        { date: '۱۴۰۲/۱۰/۲۴', sales: 8900000, orders: 44, growth: 3.6 },
        { date: '۱۴۰۲/۱۰/۲۳', sales: 9600000, orders: 50, growth: 7.8 },
        { date: '۱۴۰۲/۱۰/۲۲', sales: 8100000, orders: 41, growth: -2.4 },
        { date: '۱۴۰۲/۱۰/۲۱', sales: 7800000, orders: 39, growth: -1.2 }
    ];

    const topProducts = [
        { name: 'کاپوچینو ویژه', sales: 42500000, orders: 210, growth: 12.5 },
        { name: 'لاته زعفرانی', sales: 38600000, orders: 188, growth: 8.4 },
        { name: 'آیس آمریکانو', sales: 29800000, orders: 154, growth: 6.2 },
        { name: 'چیزکیک باسلوق', sales: 26500000, orders: 120, growth: 4.1 }
    ];

    const formatCurrency = (value) => `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;
    const formatNumber = (value) => new Intl.NumberFormat('fa-IR').format(value);

    const growthLabel = (value) => `${value > 0 ? '+' : ''}${value}%`;

    const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
        <Card sx={{ direction: 'rtl' }}>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="h6">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="h2">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Box display="flex" alignItems="center" mt={1}>
                                {trend === 'up' ? (
                                    <TrendingUp color="success" sx={{ ml: 1 }} />
                                ) : (
                                    <TrendingDown color="error" sx={{ ml: 1 }} />
                                )}
                                <Typography color={trend === 'up' ? 'success.main' : 'error.main'} variant="body2">
                                    {subtitle}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box color={color}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">گزارش‌های فروش</Typography>
                <Box display="flex" gap={2}>
                    <Button variant="outlined" startIcon={<FilterList />}>
                        فیلتر
                    </Button>
                    <Button variant="contained" startIcon={<Download />}>
                        خروجی اکسل
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="فروش کل ماه"
                        value={formatCurrency(reportData.totalSales)}
                        icon={<AttachMoney />}
                        color="success.main"
                        subtitle={`${reportData.monthlyGrowth}% رشد نسبت به ماه قبل`}
                        trend="up"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="میانگین فروش روزانه"
                        value={formatCurrency(reportData.dailyAverage)}
                        icon={<Assessment />}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="تعداد سفارش‌ها"
                        value={formatNumber(reportData.totalOrders)}
                        icon={<TrendingUp />}
                        color="info.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="میانگین مبلغ سفارش"
                        value={formatCurrency(reportData.averageOrderValue)}
                        icon={<AttachMoney />}
                        color="warning.main"
                    />
                </Grid>

                {/* Date Range Filter */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                            <Typography variant="h6">بازه گزارش:</Typography>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>دوره</InputLabel>
                                <Select defaultValue="month" label="دوره">
                                    <MenuItem value="week">این هفته</MenuItem>
                                    <MenuItem value="month">این ماه</MenuItem>
                                    <MenuItem value="quarter">این فصل</MenuItem>
                                    <MenuItem value="year">امسال</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="outlined" size="small">
                                بازه دلخواه
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Daily Sales Table */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            عملکرد روزانه فروش
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">تاریخ</TableCell>
                                        <TableCell align="right">فروش</TableCell>
                                        <TableCell align="right">تعداد سفارش</TableCell>
                                        <TableCell align="right">رشد</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dailySales.map((day) => (
                                        <TableRow key={day.date}>
                                            <TableCell align="right">{day.date}</TableCell>
                                            <TableCell align="right">{formatCurrency(day.sales)}</TableCell>
                                            <TableCell align="right">{formatNumber(day.orders)}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={growthLabel(day.growth)}
                                                    color={day.growth >= 0 ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            محصولات پرفروش
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">محصول</TableCell>
                                        <TableCell align="right">میزان فروش</TableCell>
                                        <TableCell align="right">رشد</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topProducts.map((product) => (
                                        <TableRow key={product.name}>
                                            <TableCell align="right">{product.name}</TableCell>
                                            <TableCell align="right">{formatCurrency(product.sales)}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={growthLabel(product.growth)}
                                                    color={product.growth >= 0 ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SalesReports;
