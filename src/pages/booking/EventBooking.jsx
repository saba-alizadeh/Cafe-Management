import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';

const EventBooking = () => {
    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 6 }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#A81C1C' }}>
                    Event Booking
                </Typography>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Coming Soon</Typography>
                        <Typography color="text.secondary">
                            Placeholder UI for upcoming event booking design. We will integrate your final event UI once you share it.
                        </Typography>
                        <Button variant="contained" sx={{ mt: 2, bgcolor: '#A81C1C' }}>Notify Me (UI only)</Button>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default EventBooking;


