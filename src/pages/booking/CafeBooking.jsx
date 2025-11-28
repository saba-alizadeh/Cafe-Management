import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, TextField, MenuItem } from '@mui/material';

const tables = Array.from({ length: 16 }).map((_, i) => ({
    tableNumber: i + 1,
    location: i % 2 === 0 ? 'Window' : 'Center',
    seatNumber: (i % 4) + 1,
    seats: [2, 4, 6, 8][i % 4]
}));

const CafeBooking = () => {
    const [selected, setSelected] = useState(null);
    const [guests, setGuests] = useState(2);

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', py: 6 }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)' }}>
                    Cafe Seat Booking
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
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Table {t.tableNumber}</Typography>
                                            <Chip label={t.location} size="small" sx={{ mt: 1 }} />
                                            <Typography sx={{ mt: 1 }} color="text.secondary">Seat Number: {t.seatNumber}</Typography>
                                            <Typography sx={{}} color="text.secondary">Number of Seats: {t.seats}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Selection Details</Typography>
                                {selected ? (
                                    <Box>
                                        <Typography>Table Number: {selected.tableNumber}</Typography>
                                        <Typography>Location: {selected.location}</Typography>
                                        <Typography>Seat Number: {selected.seatNumber}</Typography>
                                        <Typography>Number of Seats: {selected.seats}</Typography>
                                        <TextField
                                            label="Guests"
                                            type="number"
                                            size="small"
                                            value={guests}
                                            onChange={(e) => setGuests(Number(e.target.value))}
                                            sx={{ mt: 2 }}
                                            inputProps={{ min: 1, max: selected.seats }}
                                        />
                                        <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: 'var(--color-primary)' }}>
                                            Reserve (UI only)
                                        </Button>
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">Select a table to see details</Typography>
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


