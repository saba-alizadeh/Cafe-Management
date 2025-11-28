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
    Campaign,
    LocalOffer,
    Schedule,
    Visibility
} from '@mui/icons-material';

const Promotions = () => {
    // Mock data - in real app, this would come from API
    const promotions = [
        {
            id: 1,
            name: 'ساعت طلایی',
            type: 'درصدی',
            value: '۲۰٪',
            description: '۲۰ درصد تخفیف روی تمام نوشیدنی‌های گرم',
            startDate: '۱۴۰۲/۱۰/۲۰',
            endDate: '۱۴۰۲/۱۱/۰۵',
            status: 'Active',
            usage: 45,
            maxUsage: 100
        },
        {
            id: 2,
            name: '۲ بخر ۱ هدیه',
            type: 'BOGO',
            value: 'نوشیدنی رایگان',
            description: 'با خرید دو قهوه سومین نوشیدنی رایگان است',
            startDate: '۱۴۰۲/۱۰/۱۵',
            endDate: '۱۴۰۲/۱۰/۳۰',
            status: 'Active',
            usage: 23,
            maxUsage: 60
        },
        {
            id: 3,
            name: 'تخفیف دانشجویی',
            type: 'درصدی',
            value: '۱۵٪',
            description: 'ویژه دانشجویان با ارائه کارت دانشجویی',
            startDate: '۱۴۰۲/۰۱/۰۱',
            endDate: '۱۴۰۲/۱۲/۲۹',
            status: 'Active',
            usage: 78,
            maxUsage: 200
        },
        {
            id: 4,
            name: 'پیشنهاد آخر هفته',
            type: 'درصدی',
            value: '۱۰٪',
            description: 'تخفیف مخصوص جمعه و شنبه',
            startDate: '۱۴۰۲/۱۰/۰۱',
            endDate: '۱۴۰۲/۱۰/۱۴',
            status: 'Expired',
            usage: 12,
            maxUsage: 40
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Pending': return 'warning';
            case 'Expired': return 'error';
            default: return 'default';
        }
    };

    const statusLabels = {
        Active: 'فعال',
        Pending: 'در انتظار',
        Expired: 'منقضی شده'
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">کمپین‌ها و تخفیف‌ها</Typography>
                <Button variant="contained" startIcon={<Add />}>
                    کمپین جدید
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی کمپین..."
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
                                تعداد کل
                            </Typography>
                            <Typography variant="h4">{promotions.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                فعال
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {promotions.filter(p => p.status === 'Active').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                مجموع استفاده
                            </Typography>
                            <Typography variant="h4">
                                {promotions.reduce((sum, promo) => sum + promo.usage, 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Promotions Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">عنوان کمپین</TableCell>
                            <TableCell align="right">نوع</TableCell>
                            <TableCell align="right">مقدار</TableCell>
                            <TableCell align="right">بازه اجرا</TableCell>
                            <TableCell align="right">میزان استفاده</TableCell>
                            <TableCell align="right">وضعیت</TableCell>
                            <TableCell align="right">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {promotions.map((promotion) => (
                            <TableRow key={promotion.id}>
                                <TableCell align="right">
                                    <Box textAlign="right">
                                        <Typography variant="subtitle2">{promotion.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {promotion.description}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={promotion.type}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="h6" color="success.main">
                                        {promotion.value}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Box textAlign="right">
                                        <Typography variant="body2">
                                            از {promotion.startDate} تا {promotion.endDate}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Box textAlign="right">
                                        <Typography variant="body2">
                                            {promotion.usage}/{promotion.maxUsage}
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 4,
                                                bgcolor: 'grey.200',
                                                borderRadius: 2,
                                                mt: 0.5
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${(promotion.usage / promotion.maxUsage) * 100}%`,
                                                    height: '100%',
                                                    bgcolor: 'primary.main',
                                                    borderRadius: 2
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={statusLabels[promotion.status] ?? promotion.status}
                                        color={getStatusColor(promotion.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary">
                                        <Visibility />
                                    </IconButton>
                                    <IconButton size="small" color="secondary">
                                        <Edit />
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

export default Promotions;
