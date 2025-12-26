import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, TextField, MenuItem, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CafeBooking = () => {
    const [selected, setSelected] = useState(null);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reservationDialog, setReservationDialog] = useState(false);
    const [reservationData, setReservationData] = useState({
        date: '',
        time: '',
        people: 1
    });
    const { user, apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const pricePerTable = 80000; // 80,000 Toman

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
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
            const mappedTables = Array.isArray(data) ? data.map((table, index) => ({
                id: table.id,
                tableNumber: table.name || `میز ${index + 1}`,
                location: table.status === 'available' ? 'مرکز' : 'پنجره', // You can add location field to API if needed
                seatNumber: index + 1,
                seats: table.capacity || 2,
                status: table.status,
                is_active: table.is_active
            })).filter(table => table.is_active !== false) : [];
            
            setTables(mappedTables);
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', py: 6, direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)', textAlign: 'right' }}>
                    رزرو میز کافه
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            {tables.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'right' }}>
                                    میزی برای نمایش وجود ندارد
                                </Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {tables.map((t) => (
                                        <Grid item xs={12} sm={6} md={4} key={t.id || t.tableNumber}>
                                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                <CardContent sx={{ textAlign: 'right', flexGrow: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{t.tableNumber}</Typography>
                                                    <Chip label={t.location} size="small" sx={{ mb: 1 }} />
                                                    <Typography sx={{ mb: 1 }} color="text.secondary">تعداد صندلی: {t.seats}</Typography>
                                                    <Chip 
                                                        label={t.status === 'available' ? 'آزاد' : 'رزرو شده'} 
                                                        size="small" 
                                                        color={t.status === 'available' ? 'success' : 'default'}
                                                        sx={{ mb: 2 }} 
                                                    />
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        onClick={() => {
                                                            setSelected(t);
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
                        </Grid>
                    </Grid>
                )}

                {/* Reservation Dialog */}
                <Dialog open={reservationDialog} onClose={() => setReservationDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>رزرو میز {selected?.tableNumber}</DialogTitle>
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
                                    const people = Math.max(1, Math.min(selected?.seats || 1, parseInt(e.target.value) || 1));
                                    setReservationData({ ...reservationData, people });
                                }}
                                inputProps={{ min: 1, max: selected?.seats || 1 }}
                                fullWidth
                                required
                            />
                            <Typography variant="body2" color="text.secondary">
                                ظرفیت میز: {selected?.seats} نفر
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
                                if (reservationData.people < 1 || reservationData.people > selected?.seats) {
                                    alert(`تعداد نفرات باید بین 1 تا ${selected?.seats} باشد`);
                                    return;
                                }
                                
                                const tableReservation = {
                                    id: `table-${selected.id}-${Date.now()}`,
                                    type: 'table',
                                    name: `رزرو میز ${selected.tableNumber}`,
                                    tableNumber: selected.tableNumber,
                                    tableId: selected.id,
                                    location: selected.location,
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

export default CafeBooking;


