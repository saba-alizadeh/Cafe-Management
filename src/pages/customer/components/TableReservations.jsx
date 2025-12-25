import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { Restaurant, CalendarToday, AccessTime, People } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

const TableReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTable, setSelectedTable] = useState(null);
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
            // Fetch available tables from API
            const res = await fetch(`${apiBaseUrl}/tables?cafe_id=${selectedCafe.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'خطا در بارگذاری میزها');
                setLoading(false);
                return;
            }
            
            const data = await res.json();
            // Map API data to component format
            const mappedTables = Array.isArray(data) ? data
                .filter(table => table.is_active !== false && table.status === 'available')
                .map((table, index) => ({
                    id: table.id,
                    name: `میز ${table.name || index + 1}`,
                    tableNumber: table.name || `میز ${index + 1}`,
                    location: table.status === 'available' ? 'مرکز' : 'پنجره',
                    guests: table.capacity || 2,
                    capacity: table.capacity || 2,
                    status: table.status,
                    price: 80000 // Default price, can be updated if API provides this
                })) : [];
            
            setReservations(mappedTables);
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
                    رزروهای میز کافه
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {reservations.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Restaurant sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                هیچ میز آزادی برای رزرو وجود ندارد
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
                                            شماره میز: {reservation.tableNumber}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            موقعیت: {reservation.location}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ظرفیت: {reservation.capacity} نفر
                                        </Typography>
                                        <Chip 
                                            label={reservation.status === 'available' ? 'آزاد' : 'رزرو شده'} 
                                            size="small" 
                                            color={reservation.status === 'available' ? 'success' : 'default'}
                                            sx={{ mb: 2 }}
                                        />
                                        <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-primary)' }}>
                                            رایگان
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => {
                                                setSelectedTable(reservation);
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
                    <DialogTitle>رزرو میز {selectedTable?.tableNumber}</DialogTitle>
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
                                    const people = Math.max(1, Math.min(selectedTable?.capacity || 1, parseInt(e.target.value) || 1));
                                    setReservationData({ ...reservationData, people });
                                }}
                                inputProps={{ min: 1, max: selectedTable?.capacity || 1 }}
                                fullWidth
                                required
                            />
                            <Typography variant="body2" color="text.secondary">
                                ظرفیت میز: {selectedTable?.capacity} نفر
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
                                if (reservationData.people < 1 || reservationData.people > selectedTable?.capacity) {
                                    alert(`تعداد نفرات باید بین 1 تا ${selectedTable?.capacity} باشد`);
                                    return;
                                }
                                
                                const tableReservation = {
                                    id: `table-${selectedTable.id}-${Date.now()}`,
                                    type: 'table',
                                    name: `رزرو میز ${selectedTable.tableNumber}`,
                                    tableNumber: selectedTable.tableNumber,
                                    tableId: selectedTable.id,
                                    location: selectedTable.location,
                                    date: reservationData.date,
                                    time: reservationData.time,
                                    people: reservationData.people,
                                    quantity: 1,
                                    price: 0 // Table reservations are free
                                };
                                
                                addToCart(tableReservation);
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

export default TableReservations;

