import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, TextField, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const tables = Array.from({ length: 16 }).map((_, i) => ({
    tableNumber: i + 1,
    location: i % 2 === 0 ? 'پنجره' : 'مرکز',
    seatNumber: (i % 4) + 1,
    seats: [2, 4, 6, 8][i % 4]
}));

const CafeBooking = () => {
    const [selected, setSelected] = useState(null);
    const [guests, setGuests] = useState(2);
    const { user } = useAuth();
    const navigate = useNavigate();
    const pricePerTable = 80000; // 80,000 Toman

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', py: 6, direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)', textAlign: 'right' }}>
                    رزرو میز کافه
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            {tables.map((t) => (
                                <Grid item xs={12} sm={6} md={4} key={t.tableNumber}>
                                    <Card
                                        onClick={() => setSelected(t)}
                                        sx={{ cursor: 'pointer', border: selected?.tableNumber === t.tableNumber ? '2px solid var(--color-primary)' : '1px solid var(--color-accent-soft)' }}
                                    >
                                        <CardContent sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>میز {t.tableNumber}</Typography>
                                            <Chip label={t.location} size="small" sx={{ mt: 1 }} />
                                            <Typography sx={{ mt: 1 }} color="text.secondary">شماره صندلی: {t.seatNumber}</Typography>
                                            <Typography sx={{}} color="text.secondary">تعداد صندلی: {t.seats}</Typography>
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
                                        <Typography><strong>شماره میز:</strong> {selected.tableNumber}</Typography>
                                        <Typography><strong>موقعیت:</strong> {selected.location}</Typography>
                                        <Typography><strong>شماره صندلی:</strong> {selected.seatNumber}</Typography>
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
                                                    id: `table-${Date.now()}`,
                                                    type: 'table',
                                                    title: 'رزرو میز کافه',
                                                    tableNumber: selected.tableNumber,
                                                    location: selected.location,
                                                    guests,
                                                    quantity: 1,
                                                    price: pricePerTable
                                                };
                                                if (user) {
                                                    localStorage.setItem('pendingReservation', JSON.stringify(tableReservation));
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

export default CafeBooking;


