import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button, TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import PhoneAuthDialog from '../../components/auth/PhoneAuthDialog';

const SharedSpaceBooking = () => {
    const [selected, setSelected] = useState(null);
    const [desks, setDesks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reservationDialog, setReservationDialog] = useState(false);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [reservationData, setReservationData] = useState({
        date: '',
        time: '',
        people: 1,
        notes: ''
    });
    const { user, apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const pricePerDesk = 100000; // 100,000 Toman

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
            const res = await fetch(`${apiBaseUrl}/coworking/tables?cafe_id=${selectedCafe.id}`, {
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
            const mappedDesks = Array.isArray(data) ? data
                .filter(table => table.is_available !== false)
                .map((table, index) => ({
                    id: table.id,
                    deskNumber: index + 1,
                    name: table.name || `میز ${index + 1}`,
                    capacity: table.capacity || 1,
                    amenities: table.amenities ? (typeof table.amenities === 'string' ? table.amenities.split(',').map(a => a.trim()) : table.amenities) : [],
                    zone: ['آرام', 'همکاری', 'تلفنی'][index % 3], // Default zone if not in API
                    is_available: table.is_available
                })) : [];
            
            setDesks(mappedDesks);
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
                    رزرو فضای مشترک
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
                            {desks.length === 0 ? (
                                <Typography color="text.secondary" sx={{ textAlign: 'right' }}>
                                    میزی برای نمایش وجود ندارد
                                </Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {desks.map((d) => (
                                        <Grid item xs={12} sm={6} md={4} key={d.id || d.deskNumber}>
                                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                <CardContent sx={{ textAlign: 'right', flexGrow: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{d.name}</Typography>
                                                    <Typography color="text.secondary" sx={{ mb: 1 }}>ظرفیت: {d.capacity} نفر</Typography>
                                                    <Chip size="small" label={d.zone} sx={{ mb: 1 }} />
                                                    {d.amenities && d.amenities.length > 0 && (
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2, justifyContent: 'flex-end' }}>
                                                            {d.amenities.map((a, idx) => (
                                                                <Chip key={idx} label={a} size="small" variant="outlined" />
                                                            ))}
                                                        </Box>
                                                    )}
                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        onClick={() => {
                                                            setSelected(d);
                                                            setReservationData({
                                                                date: '',
                                                                time: '',
                                                                people: 1,
                                                                notes: ''
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
                    <DialogTitle>رزرو میز {selected?.name}</DialogTitle>
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
                                    const people = Math.max(1, Math.min(selected?.capacity || 1, parseInt(e.target.value) || 1));
                                    setReservationData({ ...reservationData, people });
                                }}
                                inputProps={{ min: 1, max: selected?.capacity || 1 }}
                                fullWidth
                                required
                            />
                            <TextField
                                label="یادداشت‌ها"
                                size="small"
                                fullWidth
                                multiline
                                rows={3}
                                value={reservationData.notes}
                                onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
                            />
                            <Typography variant="body2" color="text.secondary">
                                ظرفیت میز: {selected?.capacity} نفر
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
                                if (reservationData.people < 1 || reservationData.people > selected?.capacity) {
                                    alert(`تعداد نفرات باید بین 1 تا ${selected?.capacity} باشد`);
                                    return;
                                }
                                
                                const deskReservation = {
                                    id: `desk-${selected.id}-${Date.now()}`,
                                    type: 'desk',
                                    name: `رزرو میز ${selected.name}`,
                                    deskName: selected.name,
                                    deskId: selected.id,
                                    zone: selected.zone,
                                    date: reservationData.date,
                                    time: reservationData.time,
                                    people: reservationData.people,
                                    notes: reservationData.notes,
                                    quantity: 1,
                                    price: selected.price
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

                <PhoneAuthDialog
                    open={authDialogOpen}
                    onClose={() => setAuthDialogOpen(false)}
                    onAuthenticated={() => {
                        setAuthDialogOpen(false);
                        // Stay on current page after authentication
                    }}
                    onNewUser={() => {
                        setAuthDialogOpen(false);
                        // New user: redirect to profile page
                        navigate('/customer/profile');
                    }}
                />
            </Container>
        </Box>
    );
};

export default SharedSpaceBooking;


