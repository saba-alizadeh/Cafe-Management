import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Card, CardContent, Grid, CircularProgress, Alert, Chip,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { BusinessCenter } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

const SharedSpaceReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDesk, setSelectedDesk] = useState(null);
    const [reservationDialog, setReservationDialog] = useState(false);
    const [reservationData, setReservationData] = useState({
        date: '',
        time: '',
        people: 1
    });
    const { apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        setError('');
        const authToken = token || localStorage.getItem('authToken');
        
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
            return;
        }

        // Get selected café from localStorage
        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        if (!selectedCafe || !selectedCafe.id) {
            setError('لطفاً ابتدا یک کافه انتخاب کنید');
            setLoading(false);
            return;
        }

        try {
            // Fetch user coworking reservations from API
            const res = await fetch(`${apiBaseUrl}/reservations?reservation_type=coworking&cafe_id=${selectedCafe.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'خطا در بارگذاری رزروها');
                setLoading(false);
                return;
            }
            
            const reservationsData = await res.json();
            // Map API data to component format
            // Only show completed/Confirmed reservations
            const mappedReservations = Array.isArray(reservationsData) ? reservationsData
                .filter(reservation => {
                    // Only show reservations with completed or Confirmed status
                    const status = reservation.status;
                    return status === 'completed' || status === 'Confirmed';
                })
                .map((reservation) => ({
                    id: reservation.id,
                    name: `رزرو فضای مشترک - ${reservation.date}`,
                    deskName: reservation.table_id || '',
                    tableId: reservation.table_id,
                    date: reservation.date,
                    time: reservation.time,
                    capacity: reservation.number_of_people,
                    numberOfPeople: reservation.number_of_people,
                    status: reservation.status,
                    notes: reservation.notes,
                    price: 0
                })) : [];
            
            setReservations(mappedReservations);
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                    رزروهای فضای مشترک
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {reservations.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <BusinessCenter sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                شما هنوز هیچ رزروی انجام نداده‌اید
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {reservations.map((reservation) => (
                            <Grid item xs={12} md={6} key={reservation.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            {reservation.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            نام میز: {reservation.deskName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            منطقه: {reservation.zone}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ظرفیت: {reservation.capacity} نفر
                                        </Typography>
                                        {reservation.amenities && reservation.amenities.length > 0 && (
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    امکانات:
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {reservation.amenities.map((amenity, idx) => (
                                                        <Chip key={idx} label={amenity} size="small" variant="outlined" />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                        <Chip 
                                            label={reservation.is_available ? 'در دسترس' : 'اشغال شده'} 
                                            size="small" 
                                            color={reservation.is_available ? 'success' : 'default'}
                                            sx={{ mb: 2 }}
                                        />
                                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary)' }}>
                                            {reservation.price?.toLocaleString()} تومان
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => {
                                                setSelectedDesk(reservation);
                                                setReservationData({
                                                    date: '',
                                                    time: '',
                                                    people: 1
                                                });
                                                setReservationDialog(true);
                                            }}
                                            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
                                        >
                                            رزرو میز
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Reservation Dialog */}
                <Dialog open={reservationDialog} onClose={() => setReservationDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>رزرو میز {selectedDesk?.deskName}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="تاریخ"
                                type="date"
                                value={reservationData.date}
                                onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                required
                            />
                            <TextField
                                label="ساعت"
                                type="time"
                                value={reservationData.time}
                                onChange={(e) => setReservationData({ ...reservationData, time: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                required
                            />
                            <TextField
                                label="تعداد نفرات"
                                type="number"
                                value={reservationData.people}
                                onChange={(e) => {
                                    const people = Math.max(1, Math.min(selectedDesk?.capacity || 1, parseInt(e.target.value) || 1));
                                    setReservationData({ ...reservationData, people });
                                }}
                                inputProps={{ min: 1, max: selectedDesk?.capacity || 1 }}
                                fullWidth
                                required
                            />
                            <Typography variant="body2" color="text.secondary">
                                ظرفیت میز: {selectedDesk?.capacity} نفر
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ direction: 'rtl', p: 2 }}>
                        <Button onClick={() => setReservationDialog(false)}>انصراف</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (!reservationData.date || !reservationData.time) {
                                    alert('لطفاً تاریخ و ساعت را وارد کنید');
                                    return;
                                }
                                if (reservationData.people < 1 || reservationData.people > selectedDesk?.capacity) {
                                    alert(`تعداد نفرات باید بین 1 تا ${selectedDesk?.capacity} باشد`);
                                    return;
                                }
                                
                                const deskReservation = {
                                    id: `desk-${selectedDesk.id}-${Date.now()}`,
                                    type: 'desk',
                                    name: `رزرو میز ${selectedDesk.deskName}`,
                                    deskName: selectedDesk.deskName,
                                    deskId: selectedDesk.id,
                                    zone: selectedDesk.zone,
                                    date: reservationData.date,
                                    time: reservationData.time,
                                    people: reservationData.people,
                                    quantity: 1,
                                    price: selectedDesk.price
                                };
                                
                                addToCart(deskReservation);
                                alert('رزرو میز به سبد خرید اضافه شد');
                                setReservationDialog(false);
                            }}
                            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
                        >
                            افزودن به سبد خرید
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default SharedSpaceReservations;

