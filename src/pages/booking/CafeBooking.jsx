import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, TextField, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CafeBooking = () => {
    const [selected, setSelected] = useState(null);
    const [guests, setGuests] = useState(2);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                                            <Card
                                                onClick={() => setSelected(t)}
                                                sx={{ cursor: 'pointer', border: selected?.id === t.id ? '2px solid var(--color-primary)' : '1px solid var(--color-accent-soft)' }}
                                            >
                                                <CardContent sx={{ textAlign: 'right' }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{t.tableNumber}</Typography>
                                                    <Chip label={t.location} size="small" sx={{ mt: 1 }} />
                                                    <Typography sx={{ mt: 1 }} color="text.secondary">تعداد صندلی: {t.seats}</Typography>
                                                    <Chip 
                                                        label={t.status === 'available' ? 'آزاد' : 'رزرو شده'} 
                                                        size="small" 
                                                        color={t.status === 'available' ? 'success' : 'default'}
                                                        sx={{ mt: 1 }} 
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-accent-soft)' }}>
                            <CardContent sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>جزئیات انتخاب</Typography>
                                {selected ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Typography><strong>شماره میز:</strong> {selected.tableNumber}</Typography>
                                        <Typography><strong>موقعیت:</strong> {selected.location}</Typography>
                                        <Typography><strong>تعداد صندلی:</strong> {selected.seats}</Typography>
                                        <TextField
                                            label="مهمانان"
                                            type="number"
                                            size="small"
                                            value={guests}
                                            onChange={(e) => setGuests(Number(e.target.value))}
                                            sx={{ mt: 1 }}
                                            inputProps={{ min: 1, max: selected.seats }}
                                        />
                                        <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: 'var(--color-primary)' }} onClick={() => {
                                            if (selected) {
                                                const tableReservation = {
                                                    id: `table-${selected.id || Date.now()}`,
                                                    type: 'table',
                                                    name: `رزرو میز ${selected.tableNumber}`,
                                                    tableNumber: selected.tableNumber,
                                                    tableId: selected.id,
                                                    location: selected.location,
                                                    guests,
                                                    quantity: 1,
                                                    price: pricePerTable
                                                };
                                                addToCart(tableReservation);
                                                alert('میز به سبد خرید اضافه شد');
                                                navigate(-1); // Go back to previous page
                                            }
                                        }}>
                                            افزودن به سبد خرید
                                        </Button>
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">برای مشاهده جزئیات یک میز را انتخاب کنید</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default CafeBooking;


