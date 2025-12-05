import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Grid, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EventNote } from '@mui/icons-material';

const eventsPreviewData = [
    {
        id: 1,
        title: 'کنسرت موسیقی زنده',
        shortSummary: 'شب موسیقی با هنرمندان محلی برای شام دلپذیر',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%236c8c68" width="400" height="300"/><circle cx="200" cy="150" r="40" fill="%23fcede9"/><path d="M180 100 L190 140 L200 100 L210 140 L220 100" stroke="%23fcede9" fill="none" stroke-width="2"/></svg>',
        price: 250000,
        duration: '4 ساعت'
    },
    {
        id: 2,
        title: 'کارگاه کافه لاته آرت',
        shortSummary: 'یاد بگیرید چگونه طرح‌های زیبا روی قهوه بکشید',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%238b6f47" width="400" height="300"/><rect x="150" y="100" width="100" height="120" rx="10" fill="%23d4a574"/><ellipse cx="200" cy="100" rx="60" ry="20" fill="%23c99a62"/></svg>',
        price: 150000,
        duration: '2 ساعت'
    },
    {
        id: 3,
        title: 'شام تاریخی و داستان‌گویی',
        shortSummary: 'غذاهای تاریخی همراه با داستان‌های جذاب فرهنگی',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23395035" width="400" height="300"/><circle cx="100" cy="150" r="35" fill="%23fcede9" opacity="0.8"/><circle cx="200" cy="130" r="40" fill="%23fcede9" opacity="0.7"/><circle cx="300" cy="160" r="38" fill="%23fcede9" opacity="0.75"/></svg>',
        price: 300000,
        duration: '3 ساعت'
    }
];

const EventsPreview = () => {
    const navigate = useNavigate();

    const handleViewAllEvents = () => {
        navigate('/booking/events');
    };

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 2, 
                            color: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                    >
                        <EventNote sx={{ fontSize: '1.8rem' }} />
                        رویدادهای خاص
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        رویدادهای منحصربه‌فرد و کلاس‌های آموزشی برای تجربه‌های به‌یادماندنی
                    </Typography>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {eventsPreviewData.map((event) => (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 8px 24px rgba(57, 80, 53, 0.2)'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={event.image}
                                    alt={event.title}
                                />
                                <CardContent sx={{ flexGrow: 1, textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'var(--color-primary)' }}>
                                        {event.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                        {event.shortSummary}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        <Chip
                                            label={event.duration}
                                            size="small"
                                            variant="outlined"
                                            sx={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                        />
                                        <Chip
                                            label={`${(event.price).toLocaleString('fa-IR')} تومان`}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'var(--color-accent)',
                                                color: 'var(--color-secondary)',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleViewAllEvents}
                        sx={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: 'var(--color-accent)'
                            }
                        }}
                    >
                        مشاهده تمام رویدادها
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default EventsPreview;
