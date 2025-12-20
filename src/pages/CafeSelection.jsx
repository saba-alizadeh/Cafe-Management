import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    Skeleton,
    AppBar,
    Toolbar,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LocationOn, Phone, LocalCafe, Movie, BusinessCenter, Event, AdminPanelSettings } from '@mui/icons-material';

// Default cafe image - a beautiful coffee cup illustration
const DefaultCafeImage = ({ name }) => (
    <Box
        sx={{
            width: '100%',
            height: '280px',
            bgcolor: 'var(--color-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(57, 80, 53, 0.1) 0%, rgba(108, 140, 104, 0.1) 100%)',
            }
        }}
    >
        <Avatar
            sx={{
                width: 120,
                height: 120,
                bgcolor: 'var(--color-primary)',
                fontSize: '4rem',
                zIndex: 1,
                boxShadow: '0 8px 24px rgba(57, 80, 53, 0.2)',
            }}
        >
            <LocalCafe sx={{ fontSize: '4rem', color: 'var(--color-secondary)' }} />
        </Avatar>
        <Box
            sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                zIndex: 1,
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {name}
            </Typography>
        </Box>
    </Box>
);

const CafeSelection = () => {
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageErrors, setImageErrors] = useState(new Set());
    const { apiBaseUrl } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCafes();
    }, []);

    const fetchCafes = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${apiBaseUrl}/cafes/public`);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || data.message || 'خطا در بارگذاری کافه‌ها');
                setLoading(false);
                return;
            }
            const data = await res.json();
            setCafes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch cafes exception:', err);
            setError('خطا در ارتباط با سرور: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Convert cafe name to URL-friendly slug
    const createCafeSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleSelectCafe = (cafe) => {
        // Store selected cafe in localStorage with full details
        localStorage.setItem('selectedCafe', JSON.stringify({
            id: cafe.id,
            name: cafe.name,
            image_url: cafe.image_url,
            location: cafe.location,
            phone: cafe.phone,
            email: cafe.email,
            details: cafe.details,
            hours: cafe.hours,
            capacity: cafe.capacity,
            has_cinema: cafe.has_cinema,
            has_coworking: cafe.has_coworking,
            has_events: cafe.has_events
        }));
        
        // Navigate to cafe-specific URL (without replace to allow browser back button)
        const cafeSlug = createCafeSlug(cafe.name);
        navigate(`/${cafeSlug}`);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('/')) {
            return `${apiBaseUrl}${imageUrl}`;
        }
        return imageUrl;
    };

    return (
        <Box sx={{ 
            bgcolor: 'var(--color-secondary)', 
            minHeight: '100vh',
            direction: 'rtl',
            background: 'linear-gradient(180deg, rgba(108, 140, 104, 0.05) 0%, var(--color-secondary) 100%)',
        }}>
            {/* Header with Admin Login */}
            <AppBar position="static" sx={{ bgcolor: 'var(--color-primary)', boxShadow: 'none', mb: 4 }}>
                <Toolbar sx={{ justifyContent: 'space-between', direction: 'rtl' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                        انتخاب کافه
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AdminPanelSettings />}
                        onClick={() => navigate('/admin-login')}
                        sx={{
                            color: 'var(--color-secondary)',
                            borderColor: 'var(--color-secondary)',
                            '&:hover': { 
                                borderColor: 'var(--color-accent)', 
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                color: 'var(--color-accent)' 
                            }
                        }}
                    >
                        ورود مدیر / ادمین
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
                    <Typography 
                        variant="h2" 
                        sx={{ 
                            fontWeight: 800,
                            mb: 2, 
                            color: 'var(--color-primary)',
                            fontSize: { xs: '2rem', md: '3rem' },
                            fontFamily: "'Vazirmatn', 'Inter', sans-serif",
                            letterSpacing: '-0.02em',
                        }}
                    >
                        کافه‌های ما
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color="text.secondary" 
                        sx={{ 
                            maxWidth: '600px', 
                            mx: 'auto',
                            fontWeight: 400,
                            fontSize: { xs: '0.95rem', md: '1.1rem' },
                            lineHeight: 1.7,
                        }}
                    >
                        کافه مورد نظر خود را انتخاب کنید و از تجربه‌ای دلنشین لذت ببرید
                    </Typography>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 3 }} 
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                                    <Skeleton variant="rectangular" height={280} />
                                    <CardContent>
                                        <Skeleton variant="text" height={32} width="60%" sx={{ mb: 1 }} />
                                        <Skeleton variant="text" height={20} width="100%" />
                                        <Skeleton variant="text" height={20} width="80%" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : cafes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 6 }}>
                        <LocalCafe sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                            هیچ کافه‌ای یافت نشد
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {cafes.map((cafe) => (
                            <Grid item xs={12} sm={6} md={4} key={cafe.id}>
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        bgcolor: 'var(--color-surface)',
                                        border: '1px solid',
                                        borderColor: 'var(--color-border)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-12px)',
                                            boxShadow: '0 20px 40px rgba(57, 80, 53, 0.15)',
                                            borderColor: 'var(--color-primary)',
                                        }
                                    }}
                                    onClick={() => handleSelectCafe(cafe)}
                                >
                                    {/* Image Section */}
                                    {cafe.image_url && !imageErrors.has(cafe.id) ? (
                                        <CardMedia
                                            component="img"
                                            height="280"
                                            image={getImageUrl(cafe.image_url)}
                                            alt={cafe.name}
                                            sx={{ 
                                                objectFit: 'cover',
                                                transition: 'transform 0.4s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                }
                                            }}
                                            onError={() => {
                                                setImageErrors(prev => new Set(prev).add(cafe.id));
                                            }}
                                        />
                                    ) : (
                                        <DefaultCafeImage name={cafe.name} />
                                    )}

                                    <CardContent sx={{ 
                                        flexGrow: 1, 
                                        textAlign: 'right', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        p: 3,
                                    }}>
                                        {/* Cafe Name */}
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                fontWeight: 700, 
                                                mb: 1.5, 
                                                color: 'var(--color-primary)',
                                                fontFamily: "'Vazirmatn', 'Inter', sans-serif",
                                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                            }}
                                        >
                                            {cafe.name}
                                        </Typography>

                                        {/* Description */}
                                        {cafe.details && (
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary" 
                                                sx={{ 
                                                    mb: 2, 
                                                    lineHeight: 1.8, 
                                                    flexGrow: 1,
                                                    fontSize: '0.95rem',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {cafe.details}
                                            </Typography>
                                        )}

                                        {/* Features Chips */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            gap: 1, 
                                            mb: 2, 
                                            justifyContent: 'flex-end', 
                                            flexWrap: 'wrap' 
                                        }}>
                                            {cafe.location && (
                                                <Chip
                                                    icon={<LocationOn sx={{ fontSize: '16px !important' }} />}
                                                    label={cafe.location.length > 25 ? `${cafe.location.substring(0, 25)}...` : cafe.location}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ 
                                                        color: 'var(--color-primary)', 
                                                        borderColor: 'var(--color-primary)',
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}
                                            {cafe.has_cinema && (
                                                <Chip
                                                    icon={<Movie sx={{ fontSize: '16px !important' }} />}
                                                    label="سینما"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'var(--color-accent)',
                                                        color: 'var(--color-secondary)',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}
                                            {cafe.has_coworking && (
                                                <Chip
                                                    icon={<BusinessCenter sx={{ fontSize: '16px !important' }} />}
                                                    label="فضای همکاری"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'var(--color-accent)',
                                                        color: 'var(--color-secondary)',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}
                                            {cafe.has_events && (
                                                <Chip
                                                    icon={<Event sx={{ fontSize: '16px !important' }} />}
                                                    label="رویدادها"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'var(--color-accent)',
                                                        color: 'var(--color-secondary)',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {/* Phone Number */}
                                        {cafe.phone && (
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'flex-end', 
                                                gap: 0.5,
                                                mt: 'auto',
                                                pt: 1,
                                                borderTop: '1px solid',
                                                borderColor: 'var(--color-border)',
                                            }}>
                                                <Phone sx={{ fontSize: '16px', color: 'text.secondary' }} />
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    {cafe.phone}
                                                </Typography>
                                            </Box>
                                        )}
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

export default CafeSelection;
