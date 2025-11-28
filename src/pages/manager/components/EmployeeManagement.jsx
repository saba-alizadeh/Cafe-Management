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
    Avatar,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Person,
    Schedule,
    Star,
    Phone,
    Email
} from '@mui/icons-material';

const EmployeeManagement = () => {
    // Mock data - in real app, this would come from API
    const employees = [
        {
            id: 1,
            name: 'شیوا احمدی',
            role: 'سرپرست باریستا',
            email: 'ahmadi@cafecode.ir',
            phone: '۰۹۱۲۳۴۵۶۷۸۹',
            rating: 4.9,
            hours: 40,
            status: 'Active',
            shift: 'morning'
        },
        {
            id: 2,
            name: 'کاوه مرادی',
            role: 'صندوقدار ارشد',
            email: 'moradi@cafecode.ir',
            phone: '۰۹۳۵۴۳۲۱۰۹۸',
            rating: 4.7,
            hours: 36,
            status: 'Active',
            shift: 'evening'
        },
        {
            id: 3,
            name: 'مینا صادقی',
            role: 'کارشناس تدارکات',
            email: 'sadeghi@cafecode.ir',
            phone: '۰۹۱۹۸۷۶۵۴۳۲',
            rating: 4.8,
            hours: 32,
            status: 'On Leave',
            shift: 'morning'
        },
        {
            id: 4,
            name: 'بهمن نیک‌فر',
            role: 'مدیر شعبه',
            email: 'nikfar@cafecode.ir',
            phone: '۰۹۱۲۲۱۱۲۳۳۴',
            rating: 4.9,
            hours: 44,
            status: 'Active',
            shift: 'full'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'On Leave': return 'warning';
            case 'Inactive': return 'error';
            default: return 'default';
        }
    };

    const shiftLabels = {
        morning: 'صبح',
        evening: 'عصر',
        night: 'شب',
        full: 'تمام وقت'
    };

    const statusLabels = {
        Active: 'فعال',
        'On Leave': 'مرخصی',
        Inactive: 'غیرفعال'
    };

    const formatNumber = (value) => new Intl.NumberFormat('fa-IR').format(value);

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت کارکنان</Typography>
                <Button variant="contained" startIcon={<Add />}>
                    افزودن کارمند
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی کارمند..."
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
                            <Typography variant="h4">{formatNumber(employees.length)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                فعال
                            </Typography>
                            <Typography variant="h4">
                                {formatNumber(employees.filter(e => e.status === 'Active').length)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                میانگین امتیاز
                            </Typography>
                            <Typography variant="h4">
                                {(employees.reduce((sum, emp) => sum + emp.rating, 0) / employees.length).toFixed(1)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Employees Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">کارمند</TableCell>
                            <TableCell align="right">سمت</TableCell>
                            <TableCell align="right">اطلاعات تماس</TableCell>
                            <TableCell align="right">امتیاز</TableCell>
                            <TableCell align="right">ساعت هفتگی</TableCell>
                            <TableCell align="right">شیفت</TableCell>
                            <TableCell align="right">وضعیت</TableCell>
                            <TableCell align="right">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell align="right">
                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                                        <Box textAlign="right">
                                            <Typography variant="subtitle2">{employee.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                کد پرسنلی {formatNumber(employee.id)}
                                            </Typography>
                                        </Box>
                                        <Avatar>
                                            {employee.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{employee.role}</TableCell>
                                <TableCell align="right">
                                    <Box textAlign="right">
                                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1} sx={{ mb: 0.5 }}>
                                            {employee.email}
                                            <Email sx={{ fontSize: 'small' }} />
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                            {employee.phone}
                                            <Phone sx={{ fontSize: 'small' }} />
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                        {employee.rating}
                                        <Star sx={{ fontSize: 'small', color: 'warning.main' }} />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{formatNumber(employee.hours)} ساعت</TableCell>
                                <TableCell align="right">{shiftLabels[employee.shift] ?? employee.shift}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={statusLabels[employee.status] ?? employee.status}
                                        color={getStatusColor(employee.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" color="secondary">
                                        <Schedule />
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

export default EmployeeManagement;
