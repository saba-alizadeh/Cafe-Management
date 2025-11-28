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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Search,
    Assignment,
    Add,
    Edit,
    CheckCircle,
    Cancel,
    Pending,
    CalendarToday
} from '@mui/icons-material';

const LeaveRequests = () => {
    // Mock data - in real app, this would come from API
    const leaveRequests = [
        {
            id: 1,
            employee: 'حدیث جوادی',
            type: 'مرخصی استعلاجی',
            startDate: '۱۴۰۲/۱۱/۰۱',  
            endDate: '۱۴۰۲/۱۱/۰۳',
            days: 3,
            reason: 'علائم سرماخوردگی',
            status: 'Pending',
            submittedDate: '۱۴۰۲/۱۰/۲۵'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Approved': return <CheckCircle />;
            case 'Pending': return <Pending />;
            case 'Rejected': return <Cancel />;
            default: return <Assignment />;
        }
    };

    const statusLabels = {
        Approved: 'تایید شده',
        Pending: 'در انتظار بررسی',
        Rejected: 'رد شده'
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">درخواست‌های مرخصی</Typography>
                <Button variant="contained" startIcon={<Add />}>
                    ثبت مرخصی
                </Button>
            </Box>

            {/* Search and Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        placeholder="جستجوی درخواست..."
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
                            <Typography variant="h4">{leaveRequests.length}</Typography>
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
                                {leaveRequests.filter(l => l.status === 'Pending').length}
                            </Typography>
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
                                {leaveRequests.filter(l => l.status === 'Approved').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Leave Requests Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">کارمند</TableCell>
                            <TableCell align="right">نوع مرخصی</TableCell>
                            <TableCell align="right">بازه زمانی</TableCell>
                            <TableCell align="right">تعداد روز</TableCell>
                            <TableCell align="right">دلیل</TableCell>
                            <TableCell align="right">وضعیت</TableCell>
                            <TableCell align="right">تاریخ ثبت</TableCell>
                            <TableCell align="right">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaveRequests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell align="right">{request.employee}</TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={request.type}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Box>
                                        <Typography variant="body2">{request.startDate}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            تا {request.endDate}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{request.days} روز</TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                        {request.reason}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        icon={getStatusIcon(request.status)}
                                        label={statusLabels[request.status] ?? request.status}
                                        color={getStatusColor(request.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">{request.submittedDate}</TableCell>
                                <TableCell align="right">
                                    {request.status === 'Pending' && (
                                        <Box display="flex" gap={1}>
                                            <Button size="small" variant="outlined" color="success" startIcon={<CheckCircle />}>
                                                تایید
                                            </Button>
                                            <Button size="small" variant="outlined" color="error" startIcon={<Cancel />}>
                                                رد
                                            </Button>
                                        </Box>
                                    )}
                                    {request.status !== 'Pending' && (
                                        <IconButton size="small" color="primary">
                                            <Edit />
                                        </IconButton>
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

export default LeaveRequests;
