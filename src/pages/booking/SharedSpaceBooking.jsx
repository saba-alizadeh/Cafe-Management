import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const SharedSpaceBooking = () => {
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const [desks, setDesks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                                            <Card 
                                                onClick={() => setSelected(d)} 
                                                sx={{ 
                                                    cursor: 'pointer', 
                                                    border: selected?.id === d.id ? '2px solid var(--color-primary)' : '1px solid var(--color-accent-soft)',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                            >
                                                <CardContent sx={{ textAlign: 'right', flexGrow: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{d.name}</Typography>
                                                    <Typography color="text.secondary">ظرفیت: {d.capacity} نفر</Typography>
                                                    <Chip size="small" label={d.zone} sx={{ mt: 1 }} />
                                                    {d.amenities && d.amenities.length > 0 && (
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, justifyContent: 'flex-end' }}>
                                                            {d.amenities.map((a, idx) => (
                                                                <Chip key={idx} label={a} size="small" variant="outlined" />
                                                            ))}
                                                        </Box>
                                                    )}
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
                                        <Typography><strong>نام میز:</strong> {selected.name}</Typography>
                                        <Typography><strong>ظرفیت:</strong> {selected.capacity} نفر</Typography>
                                        <Typography><strong>منطقه:</strong> {selected.zone}</Typography>
                                        {selected.amenities && selected.amenities.length > 0 && (
                                            <Typography><strong>امکانات:</strong> {selected.amenities.join(', ')}</Typography>
                                        )}
                                        <TextField
                                            label="یادداشت‌ها"
                                            size="small"
                                            fullWidth
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            sx={{ mt: 1 }}
                                        />
                                        <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: 'var(--color-primary)' }} onClick={() => {
                                            if (selected) {
                                                const deskReservation = {
                                                    id: `desk-${selected.id || Date.now()}`,
                                                    type: 'desk',
                                                    name: `رزرو فضای مشترک: ${selected.name}`,
                                                    deskId: selected.id,
                                                    deskName: selected.name,
                                                    capacity: selected.capacity,
                                                    zone: selected.zone,
                                                    notes,
                                                    quantity: 1,
                                                    price: pricePerDesk
                                                };
                                                addToCart(deskReservation);
                                                alert('فضای مشترک به سبد خرید اضافه شد');
                                                navigate(-1); // Go back to previous page
                                            }
                                        }}>
                                            رزرو کنید
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

export default SharedSpaceBooking;


