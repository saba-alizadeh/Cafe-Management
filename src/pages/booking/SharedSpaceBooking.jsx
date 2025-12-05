import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const desks = Array.from({ length: 24 }).map((_, i) => ({
    deskNumber: i + 1,
    seatNumber: (i % 6) + 1,
    zone: ['آرام', 'همکاری', 'تلفنی'][i % 3],
    amenities: ['برق', 'لامپ', 'مانیتور'].slice(0, (i % 3) + 1)
}));

const SharedSpaceBooking = () => {
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const pricePerDesk = 100000; // 100,000 Toman

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', py: 6, direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)', textAlign: 'right' }}>
                    رزرو فضای مشترک
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            {desks.map((d) => (
                                <Grid item xs={12} sm={6} md={4} key={d.deskNumber}>
                                    <Card 
                                        onClick={() => setSelected(d)} 
                                        sx={{ 
                                            cursor: 'pointer', 
                                            border: selected?.deskNumber === d.deskNumber ? '2px solid var(--color-primary)' : '1px solid var(--color-accent-soft)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'right', flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>میز {d.deskNumber}</Typography>
                                            <Typography color="text.secondary">صندلی: {d.seatNumber}</Typography>
                                            <Chip size="small" label={d.zone} sx={{ mt: 1 }} />
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, justifyContent: 'flex-end' }}>
                                                {d.amenities.map((a) => (
                                                    <Chip key={a} label={a} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-accent-soft)' }}>
                            <CardContent sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>جزئیات انتخاب</Typography>
                                {selected ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Typography><strong>شماره میز:</strong> {selected.deskNumber}</Typography>
                                        <Typography><strong>صندلی:</strong> {selected.seatNumber}</Typography>
                                        <Typography><strong>منطقه:</strong> {selected.zone}</Typography>
                                        <Typography><strong>امکانات:</strong> {selected.amenities.join(', ')}</Typography>
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
                                                    id: `desk-${Date.now()}`,
                                                    type: 'desk',
                                                    title: 'رزرو فضای مشترک',
                                                    deskNumber: selected.deskNumber,
                                                    zone: selected.zone,
                                                    notes,
                                                    quantity: 1,
                                                    price: pricePerDesk
                                                };
                                                if (user) {
                                                    localStorage.setItem('pendingReservation', JSON.stringify(deskReservation));
                                                    navigate('/customer/cart');
                                                } else {
                                                    alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
                                                    navigate('/login');
                                                }
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
            </Container>
        </Box>
    );
};

export default SharedSpaceBooking;


