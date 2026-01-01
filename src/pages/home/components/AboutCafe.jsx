import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Divider,
    Chip,
    Avatar
} from '@mui/material';
import {
    LocationOn,
    Phone,
    Email,
    AccessTime,
    Wifi,
    People,
    Movie,
    BusinessCenter,
    Event
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUtils';

const AboutCafe = ({ selectedCafe }) => {
    const { apiBaseUrl } = useAuth();

    if (!selectedCafe) {
        return null;
    }

    return (
        <Box
            sx={{
                bgcolor: 'var(--color-secondary)',
                py: 8,
                direction: 'rtl',
                minHeight: '100vh'
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    {selectedCafe.logo_url && (
                        <Avatar
                            src={getImageUrl(selectedCafe.logo_url, apiBaseUrl)}
                            alt={selectedCafe.name}
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 3,
                                bgcolor: 'var(--color-primary)',
                            }}
                        />
                    )}
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            mb: 2,
                            fontFamily: "'Vazirmatn', 'Inter', sans-serif",
                        }}
                    >
                        {selectedCafe.name}
                    </Typography>
                    {selectedCafe.details && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: '800px',
                                mx: 'auto',
                                lineHeight: 1.8,
                                fontSize: '1.1rem',
                            }}
                        >
                            {selectedCafe.details}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ mb: 6 }} />

                <Grid container spacing={4}>
                    {/* Contact Information */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                height: '100%',
                                bgcolor: 'var(--color-surface)',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px rgba(57, 80, 53, 0.1)',
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 3,
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    اطلاعات تماس
                                </Typography>

                                {selectedCafe.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
                                        <LocationOn
                                            sx={{
                                                color: 'var(--color-primary)',
                                                mr: 2,
                                                mt: 0.5,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                آدرس
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedCafe.location}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {selectedCafe.phone && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Phone
                                            sx={{
                                                color: 'var(--color-primary)',
                                                mr: 2,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                تلفن
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedCafe.phone}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {selectedCafe.email && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Email
                                            sx={{
                                                color: 'var(--color-primary)',
                                                mr: 2,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                ایمیل
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedCafe.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {selectedCafe.hours && (
                                    <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
                                        <AccessTime
                                            sx={{
                                                color: 'var(--color-primary)',
                                                mr: 2,
                                                mt: 0.5,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                ساعات کاری
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedCafe.hours}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                {selectedCafe.wifi_password && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Wifi
                                            sx={{
                                                color: 'var(--color-primary)',
                                                mr: 2,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                رمز وای‌فای
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedCafe.wifi_password}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Features & Capacity */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                height: '100%',
                                bgcolor: 'var(--color-surface)',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px rgba(57, 80, 53, 0.1)',
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 3,
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    امکانات و ظرفیت
                                </Typography>

                                {selectedCafe.capacity && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <People
                                            sx={{
                                                color: 'var(--color-primary)',
                                                mr: 2,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                ظرفیت
                                            </Typography>
                                            <Typography variant="body1">
                                                {selectedCafe.capacity} نفر
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        امکانات
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedCafe.has_cinema && (
                                            <Chip
                                                icon={<Movie />}
                                                label="سینما"
                                                sx={{
                                                    bgcolor: 'var(--color-accent)',
                                                    color: 'var(--color-secondary)',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                        {selectedCafe.has_coworking && (
                                            <Chip
                                                icon={<BusinessCenter />}
                                                label="فضای همکاری"
                                                sx={{
                                                    bgcolor: 'var(--color-accent)',
                                                    color: 'var(--color-secondary)',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                        {selectedCafe.has_events && (
                                            <Chip
                                                icon={<Event />}
                                                label="رویدادها"
                                                sx={{
                                                    bgcolor: 'var(--color-accent)',
                                                    color: 'var(--color-secondary)',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AboutCafe;

