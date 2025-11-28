import React from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Movie, LocalCafe, Work, EventAvailable } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const BookingOptions = () => {
    const bookingOptions = [
        {
            icon: LocalCafe,
            title: 'میز های کافه',
            description: 'رزرو میز برای صرف قهوه یا غذا',
            link: '/booking/cafe',
            iconColor: '#A78BFA',
            iconBgColor: '#EDE9FE'
        },
        {
            icon: Movie,
            title: 'سینما',
            description: 'تماشای فیلم همراه با نوشیدنی و دسر',
            link: '/booking/cinema',
            iconColor: '#C084FC',
            iconBgColor: '#F3E8FF'
        },
        {
            icon: Work,
            title: 'محیط کار اشتراکی',
            description: 'فضایی آزاد برای کار و تمرکز',
            link: '/booking/shared',
            iconColor: '#3B82F6',
            iconBgColor: '#DBEAFE'
        },
        {
            icon: EventAvailable,
            title: 'ایونت',
            description: 'برگزاری دورهمی‌ها و مناسبت‌های ویژه',
            link: '/booking/event',
            iconColor: '#EC4899',
            iconBgColor: '#FCE7F3'
        }
    ];

    return (
        <Container sx={{ py: 4, bgcolor: '#f8f6f4' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    گزینه های رزرو
                </Typography>
                <Box sx={{
                    width: '100%',
                    height: '2px',
                    bgcolor: '#e0e0e0',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '220px',
                        height: '2px',
                        bgcolor: '#A81C1C',
                        borderStyle: 'dashed',
                        borderColor: '#A81C1C'
                    }
                }} />
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {bookingOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: '#ede7e1',
                                    borderRadius: 3,
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
                                    }
                                }}
                            >
                                <Link to={option.link} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <CardContent sx={{ 
                                        textAlign: 'center', 
                                        py: 4,
                                        px: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexGrow: 1,
                                        justifyContent: 'space-between'
                                    }}>
                                        {/* Icon */}
                                        <Box sx={{ 
                                            mb: 3,
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            <Box sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                bgcolor: option.iconBgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <IconComponent 
                                                    sx={{ 
                                                        fontSize: 40, 
                                                        color: option.iconColor,
                                                        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))'
                                                    }} 
                                                />
                                            </Box>
                                        </Box>

                                        {/* Title */}
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                fontWeight: 'bold', 
                                                mb: 1.5,
                                                color: '#333333',
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            {option.title}
                                        </Typography>

                                        {/* Description */}
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: '#666666',
                                                mb: 3,
                                                fontSize: '1rem',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {option.description}
                                        </Typography>

                                        {/* Book Button */}
                                        <Button
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#5c4b40',
                                                color: '#ffffff',
                                                fontWeight: 'bold',
                                                py: 1.5,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                '&:hover': {
                                                    bgcolor: '#4a3d35',
                                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                                                }
                                            }}
                                        >
                                            رزرو {option.title.split(' ')[0]}
                                        </Button>
                                    </CardContent>
                                </Link>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default BookingOptions;
