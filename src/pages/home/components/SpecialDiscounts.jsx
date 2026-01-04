import React, { useRef, useState, useEffect } from 'react';
import { Box, Container, Typography, IconButton, Card, CardContent, Chip, Button, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';
import { getImageUrl } from '../../../utils/imageUtils';

const SpecialDiscounts = () => {
    const scrollRef = useRef(null);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, apiBaseUrl } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDiscountedProducts();
    }, []);

    const fetchDiscountedProducts = async () => {
        setLoading(true);
        try {
            const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
            if (!selectedCafe || !selectedCafe.id) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${apiBaseUrl}/products?cafe_id=${selectedCafe.id}`);
            if (response.ok) {
                const data = await response.json();
                // Filter products with active discounts
                const discounted = data.filter(
                    product => product.discount_percent && 
                    product.discount_percent > 0 && 
                    product.is_active
                );
                setProducts(discounted);
            }
        } catch (error) {
            console.error('Error fetching discounted products:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleOrderClick = (product) => {
        if (!user) {
            setAuthDialogOpen(true);
            return;
        }
        
        // Add product to cart
        const cartItem = {
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price * (1 - (product.discount_percent || 0) / 100), // Apply discount
            basePrice: product.price,
            quantity: 1,
            type: 'product',
            image: product.image_url
        };
        addToCart(cartItem);
        navigate('/customer/profile');
    };

    const calculateDiscountedPrice = (price, discountPercent) => {
        return price * (1 - discountPercent / 100);
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
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: 'var(--color-secondary)' }} />
                        </Box>
                    ) : products.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(255,255,255,0.8)' }}>
                            <Typography>در حال حاضر تخفیف ویژه‌ای وجود ندارد</Typography>
                        </Box>
                    ) : (
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
                            {products.map((product) => {
                                const discountedPrice = calculateDiscountedPrice(product.price, product.discount_percent);
                                return (
                                    <Card key={product.id} sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)' }}>
                                        <CardContent sx={{ textAlign: 'center', color: 'var(--color-secondary)' }}>
                                            <img
                                                src={product.image_url ? getImageUrl(product.image_url, apiBaseUrl) : '/api/placeholder/200/150'}
                                                alt={product.name}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                {product.name}
                                            </Typography>
                                            {product.discount_percent > 0 && (
                                                <Chip
                                                    label={`${product.discount_percent}% تخفیف`}
                                                    sx={{ bgcolor: 'var(--color-accent)', color: 'var(--color-secondary)', mb: 1 }}
                                                />
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                                                {product.discount_percent > 0 && (
                                                    <Typography 
                                                        sx={{ 
                                                            textDecoration: 'line-through', 
                                                            color: 'rgba(255,255,255,0.6)',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {product.price.toLocaleString()}
                                                    </Typography>
                                                )}
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    {discountedPrice.toLocaleString()} تومان
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    bgcolor: 'var(--color-primary)',
                                                    color: 'var(--color-secondary)',
                                                    mt: 1,
                                                    '&:hover': { bgcolor: 'var(--color-primary)' },
                                                }}
                                                onClick={() => handleOrderClick(product)}
                                            >
                                                سفارش
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}

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
