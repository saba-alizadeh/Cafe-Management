import React, { useRef, useState } from 'react';
import { Box, Container, Typography, IconButton, Card, CardContent, Chip, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const specialItems = [
    { id: 1, name: 'آیس لاته', price: 89000, discount: 10, image: '/api/placeholder/200/150' },
    { id: 2, name: 'کافه موکا', price: 95000, discount: 15, image: '/api/placeholder/200/150' },
    { id: 3, name: 'هات چاکلت خامه‌ای', price: 78000, image: '/api/placeholder/200/150' },
    { id: 4, name: 'کارامل ماکیاتو', price: 99000, discount: 8, image: '/api/placeholder/200/150' },
    { id: 5, name: 'اسپرسو دوبل', price: 65000, image: '/api/placeholder/200/150' },
    { id: 6, name: 'ماچا لاته', price: 105000, discount: 12, image: '/api/placeholder/200/150' },
    { id: 7, name: 'کاپوچینو کلاسیک', price: 88000, image: '/api/placeholder/200/150' },
    { id: 8, name: 'فرانسه دمی مخصوص', price: 97000, discount: 5, image: '/api/placeholder/200/150' },
];

const SpecialDiscounts = () => {
    const scrollRef = useRef(null);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const handleOrderClick = () => {
        if (user) {
            navigate('/customer/profile');
        } else {
            setAuthDialogOpen(true);
        }
    };

    return (
        <Box sx={{ bgcolor: 'var(--color-primary)', py: 4, direction: 'rtl' }}>
            <Container>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--color-secondary)', mb: 2 }}>
                        تخفیف‌های ویژه کافه
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        نوشیدنی‌های محبوب امروز با تخفیف محدود
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative' }}>
                    {/* لیست کارت‌ها */}
                    <Box
                        ref={scrollRef}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            overflowX: 'hidden',
                            scrollBehavior: 'smooth',
                            pb: 2,
                        }}
                    >
                        {specialItems.map((item) => (
                            <Card key={item.id} sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)' }}>
                                <CardContent sx={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                                        {item.name}
                                    </Typography>
                                    {item.discount && (
                                        <Chip
                                            label={`${item.discount}% تخفیف`}
                                            sx={{ bgcolor: 'var(--color-accent)', color: 'var(--color-secondary)', mb: 1 }}
                                        />
                                    )}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {item.price.toLocaleString()} تومان
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: 'var(--color-primary)',
                                            color: 'var(--color-secondary)',
                                            mt: 1,
                                            '&:hover': { bgcolor: 'var(--color-primary)' },
                                        }}
                                        onClick={handleOrderClick}
                                    >
                                        سفارش
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* فلش‌ها برای جابجایی */}
                    <IconButton
                        onClick={scrollLeft}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            boxShadow: 2,
                            zIndex: 2,
                            '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' },
                        }}
                    >
                        <ArrowBack />
                    </IconButton>

                    <IconButton
                        onClick={scrollRight}
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            boxShadow: 2,
                            zIndex: 2,
                            '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' },
                        }}
                    >
                        <ArrowForward />
                    </IconButton>
                </Box>
            </Container>
            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onAuthenticated={(user) => {
                    setAuthDialogOpen(false);
                    navigate('/customer');
                }}
            />
        </Box>
    );
};

export default SpecialDiscounts;
