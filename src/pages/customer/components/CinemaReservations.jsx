import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, CircularProgress, Alert } from '@mui/material';
import { Movie } from '@mui/icons-material';

const CinemaReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        setError('');

        try {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const cinemaReservations = cartItems.filter(item => item.type === 'cinema');
            setReservations(cinemaReservations);
        } catch (err) {
            console.error(err);
            setError('خطا در بارگذاری رزروها');
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
                    رزروهای سینما
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {reservations.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Movie sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                هیچ رزرو سینمایی وجود ندارد
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {reservations.map((reservation) => (
                            <Grid item xs={12} md={6} key={reservation.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            {reservation.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            صندلی‌ها: {reservation.seats}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ساعت: {reservation.sessionTime}
                                        </Typography>
                                        <Typography variant="h6" sx={{ mt: 2, color: 'var(--color-primary)' }}>
                                            {reservation.price?.toLocaleString()} تومان
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default CinemaReservations;

