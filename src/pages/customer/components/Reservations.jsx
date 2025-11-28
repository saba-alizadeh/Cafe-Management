import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Schedule,
    Add,
    Edit,
    Delete,
    CheckCircle,
    Pending,
    Cancel,
    Restaurant
} from '@mui/icons-material';
import { useState } from 'react';

const Reservations = () => {
    const [newReservation, setNewReservation] = useState({
        cafe: '',
        date: '',
        time: '',
        party: 1,
        specialRequests: ''
    });
    const [reservationDialog, setReservationDialog] = useState({ open: false, mode: 'create' });

    // Mock data - in real app, this would come from API
    const cafes = [
        { id: 1, name: 'کافه گوشه', location: 'مرکز شهر', capacity: 50 },
        { id: 2, name: 'بین و برو', location: 'مجتمع تجاری', capacity: 30 },
        { id: 3, name: 'طلوع صبح', location: 'منطقه دانشگاهی', capacity: 40 }
    ];

    const timeSlots = [
        '۹:۰۰ صبح', '۹:۳۰ صبح', '۱۰:۰۰ صبح', '۱۰:۳۰ صبح', '۱۱:۰۰ صبح', '۱۱:۳۰ صبح',
        '۱۲:۰۰ ظهر', '۱۲:۳۰ ظهر', '۱۳:۰۰', '۱۳:۳۰', '۱۴:۰۰', '۱۴:۳۰',
        '۱۵:۰۰', '۱۵:۳۰', '۱۶:۰۰', '۱۶:۳۰', '۱۷:۰۰', '۱۷:۳۰',
        '۱۸:۰۰', '۱۸:۳۰', '۱۹:۰۰', '۱۹:۳۰', '۲۰:۰۰', '۲۰:۳۰'
    ];

    const reservations = [
        {
            id: 1,
            cafe: 'کافه گوشه',
            date: '۲۰۲۴/۰۱/۲۰',
            time: '۱۴:۰۰',
            party: 4,
            status: 'Confirmed',
            specialRequests: 'ترجیحاً کنار پنجره'
        },
        {
            id: 2,
            cafe: 'بین و برو',
            date: '۲۰۲۴/۰۱/۲۲',
            time: '۱۵:۳۰',
            party: 2,
            status: 'Pending',
            specialRequests: 'فضای آرام'
        },
        {
            id: 3,
            cafe: 'طلوع صبح',
            date: '۲۰۲۴/۰۱/۱۸',
            time: '۱۳:۰۰',
            party: 6,
            status: 'Cancelled',
            specialRequests: 'جشن تولد'
        }
    ];

    const statusLabels = {
        Confirmed: 'تایید شده',
        Pending: 'در انتظار',
        Cancelled: 'لغو شده'
    };

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

    const handleCreateReservation = () => {
        // Mock reservation creation
        console.log('Creating reservation:', newReservation);
        setReservationDialog({ open: false, mode: 'create' });
        setNewReservation({
            cafe: '',
            date: '',
            time: '',
            party: 1,
            specialRequests: ''
        });
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت رزروها</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setReservationDialog({ open: true, mode: 'create' })}
                >
                    رزرو جدید
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Available Cafés */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            کافه‌های در دسترس
                        </Typography>
                        <Grid container spacing={2}>
                            {cafes.map((cafe) => (
                                <Grid item xs={12} key={cafe.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <Restaurant sx={{ ml: 1 }} />
                                                <Typography variant="h6">{cafe.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {cafe.location}
                                            </Typography>
                                            <Typography variant="body2">
                                                ظرفیت: {cafe.capacity} نفر
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Reservations List */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            رزروهای شما
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>کافه</TableCell>
                                        <TableCell>تاریخ و ساعت</TableCell>
                                        <TableCell>تعداد نفرات</TableCell>
                                        <TableCell>وضعیت</TableCell>
                                        <TableCell>درخواست ویژه</TableCell>
                                        <TableCell>اقدامات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reservations.map((reservation) => (
                                        <TableRow key={reservation.id}>
                                            <TableCell>{reservation.cafe}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2">{reservation.date}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {reservation.time}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{reservation.party} نفر</TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(reservation.status)}
                                                    label={statusLabels[reservation.status] ?? reservation.status}
                                                    color={getStatusColor(reservation.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                    {reservation.specialRequests}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
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
                    </Paper>
                </Grid>
            </Grid>

            {/* Reservation Dialog */}
            <Dialog open={reservationDialog.open} onClose={() => setReservationDialog({ open: false, mode: 'create' })}>
                <DialogTitle>ثبت رزرو</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>کافه</InputLabel>
                                <Select
                                    value={newReservation.cafe}
                                    onChange={(e) => setNewReservation({...newReservation, cafe: e.target.value})}
                                >
                                    {cafes.map((cafe) => (
                                        <MenuItem key={cafe.id} value={cafe.name}>
                                            {cafe.name} - {cafe.location}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="تاریخ"
                                type="date"
                                value={newReservation.date}
                                onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>ساعت</InputLabel>
                                <Select
                                    value={newReservation.time}
                                    onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
                                >
                                    {timeSlots.map((time) => (
                                        <MenuItem key={time} value={time}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="تعداد نفرات"
                                type="number"
                                value={newReservation.party}
                                onChange={(e) => setNewReservation({...newReservation, party: parseInt(e.target.value)})}
                                inputProps={{ min: 1, max: 20 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="درخواست‌های ویژه"
                                multiline
                                rows={3}
                                value={newReservation.specialRequests}
                                onChange={(e) => setNewReservation({...newReservation, specialRequests: e.target.value})}
                                placeholder="اگر نکته یا ترجیح خاصی دارید بنویسید..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReservationDialog({ open: false, mode: 'create' })}>
                        انصراف
                    </Button>
                    <Button variant="contained" onClick={handleCreateReservation}>
                        ثبت رزرو
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reservations;
