import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button, TextField } from '@mui/material';

const desks = Array.from({ length: 24 }).map((_, i) => ({
    deskNumber: i + 1,
    seatNumber: (i % 6) + 1,
    zone: ['Quiet', 'Collab', 'Phone Booth'][i % 3],
    amenities: ['Power', 'Lamp', 'Monitor'].slice(0, (i % 3) + 1)
}));

const SharedSpaceBooking = () => {
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#A81C1C' }}>
                    Shared Space Booking
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            {desks.map((d) => (
                                <Grid item xs={12} sm={6} md={4} key={d.deskNumber}>
                                    <Card onClick={() => setSelected(d)} sx={{ cursor: 'pointer', border: selected?.deskNumber === d.deskNumber ? '2px solid #A81C1C' : '1px solid #e0e0e0' }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Desk {d.deskNumber}</Typography>
                                            <Typography color="text.secondary">Seat: {d.seatNumber}</Typography>
                                            <Chip size="small" label={d.zone} sx={{ mt: 1 }} />
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
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
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Selection Details</Typography>
                                {selected ? (
                                    <Box>
                                        <Typography>Desk Number: {selected.deskNumber}</Typography>
                                        <Typography>Seat Number: {selected.seatNumber}</Typography>
                                        <Typography>Zone: {selected.zone}</Typography>
                                        <Typography sx={{ mb: 1 }}>Amenities: {selected.amenities.join(', ')}</Typography>
                                        <TextField
                                            label="Notes"
                                            size="small"
                                            fullWidth
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                        <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: '#A81C1C' }}>
                                            Reserve (UI only)
                                        </Button>
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">Select a desk to see details</Typography>
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


