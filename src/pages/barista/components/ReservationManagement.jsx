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
    Avatar
} from '@mui/material';
import {
    Search,
    Schedule,
    Person,
    CheckCircle,
    Pending,
    Cancel,
    Edit
} from '@mui/icons-material';

const ReservationManagement = () => {
    // Mock data - in real app, this would come from API
    const reservations = [
        {
            id: 1,
            customer: 'ساناز رفیعی',
            phone: '۰۹۱۲۳۴۵۶۷۸۹',
            date: '۱۴۰۲/۱۰/۲۵',
            time: '۱۴:۰۰',
            table: 'میز ۵',
            party: 4,
            status: 'Confirmed',
            specialRequests: 'ترجیح پنجره'
        },
        {
            id: 2,
            customer: 'امیرحسین کاظمی',
            phone: '۰۹۳۵۶۷۸۹۰۱۲',
            date: '۱۴۰۲/۱۰/۲۵',
            time: '۱۵:۳۰',
            table: 'میز ۲',
            party: 2,
            status: 'Confirmed',
            specialRequests: 'محیط آرام'
        },
        {
            id: 3,
            customer: 'نیلوفر شریفی',
            phone: '۰۹۱۹۸۷۶۵۴۳۲',
            date: '۱۴۰۲/۱۰/۲۵',
            time: '۱۶:۰۰',
            table: 'میز ۸',
            party: 6,
            status: 'Pending',
            specialRequests: 'جشن تولد'
        },
        {
            id: 4,
            customer: 'کاوه مرادی',
            phone: '۰۹۱۲۱۱۲۲۳۳۴',
            date: '۱۴۰۲/۱۰/۲۶',
            time: '۱۳:۰۰',
            table: 'میز ۳',
            party: 2,
            status: 'Cancelled',
            specialRequests: '---'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Pending': return 'warning';
            case 'Cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle />;
            case 'Pending': return <Pending />;
            case 'Cancelled': return <Cancel />;
            default: return <Schedule />;
        }
    };

    const statusLabels = {
        Confirmed: 'تایید شده',
        Pending: 'در انتظار تایید',
        Cancelled: 'لغو شده'
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت رزروها</Typography>
                <Button variant="contained" startIcon={<Schedule />}>
                    رزرو جدید
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی رزرو..."
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
                            <Typography variant="h4">{reservations.length}</Typography>
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
                                {reservations.filter(r => r.status === 'Confirmed').length}
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
                                {reservations.filter(r => r.status === 'Pending').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Reservations Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">مشتری</TableCell>
                            <TableCell align="right">تاریخ و ساعت</TableCell>
                            <TableCell align="right">شماره میز</TableCell>
                            <TableCell align="right">تعداد نفرات</TableCell>
                            <TableCell align="right">وضعیت</TableCell>
                            <TableCell align="right">درخواست ویژه</TableCell>
                            <TableCell align="right">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                                <TableCell align="right">
                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                                        <Box>
                                            <Typography variant="subtitle2">{reservation.customer}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {reservation.phone}
                                            </Typography>
                                        </Box>
                                        <Avatar>
                                            {reservation.customer.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Box>
                                        <Typography variant="body2">{reservation.date}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {reservation.time}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{reservation.table}</TableCell>
                                <TableCell align="right">{reservation.party} نفر</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        icon={getStatusIcon(reservation.status)}
                                        label={statusLabels[reservation.status] ?? reservation.status}
                                        color={getStatusColor(reservation.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                        {reservation.specialRequests}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary">
                                        <Edit />
                                    </IconButton>
                                    <Button size="small" variant="outlined" startIcon={<CheckCircle />}>
                                        تایید رزرو
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

export default ReservationManagement;
