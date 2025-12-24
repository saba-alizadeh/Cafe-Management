import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Badge, Avatar } from '@mui/material';
import { Search, Favorite, Home, ShoppingCart, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';
import ShoppingCartDrawer from '../../../components/ShoppingCart/ShoppingCartDrawer';

const HeaderBar = ({ selectedCafe, onAboutClick }) => {
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const { user, apiBaseUrl } = useAuth();
    const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();
    const navigate = useNavigate();

    const requireAuthAndGoProfile = () => {
        if (user) {
            navigate('/customer/profile');
        } else {
            setAuthDialogOpen(true);
        }
    };


    const handleFavoritesClick = () => {
        if (user) {
            navigate('/customer/reviews');
        } else {
            setAuthDialogOpen(true);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('/')) {
            return `${apiBaseUrl}${imageUrl}`;
        }
        return imageUrl;
    };

    const handleBackToHome = () => {
        // Get selected cafe from localStorage
        const storedCafe = localStorage.getItem('selectedCafe');
        if (storedCafe) {
            try {
                const cafe = JSON.parse(storedCafe);
                const createCafeSlug = (name) => {
                    return name
                        .toLowerCase()
                        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                };
                const slug = createCafeSlug(cafe.name);
                navigate(`/${slug}`);
            } catch (e) {
                navigate('/');
            }
        } else {
            navigate('/select-cafe');
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 'none', direction: 'rtl' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        {/* Cafe Logo */}
                        {selectedCafe?.logo_url && (
                            <Avatar
                                src={getImageUrl(selectedCafe.logo_url)}
                                alt={selectedCafe.name}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 1,
                                    bgcolor: 'var(--color-primary)',
                                }}
                            />
                        )}
                        {/* Cafe Name */}
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {selectedCafe?.name || 'کافه'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mr: 'auto', direction: 'rtl', marginRight: '30px', '& .MuiButton-startIcon': { marginLeft: '5px', marginRight: 0, } }}>
                            {onAboutClick && (
                                <Button 
                                    startIcon={<Info />} 
                                    sx={{ color: 'var(--color-primary)' }} 
                                    onClick={onAboutClick}
                                >
                                    درباره کافه
                                </Button>
                            )}
                            <Button startIcon={<Home />} sx={{ color: 'var(--color-primary)' }} onClick={handleBackToHome}>خانه</Button>
                            <Button startIcon={<Favorite />} sx={{ color: 'var(--color-primary)' }} onClick={handleFavoritesClick}>مورد علاقه ها</Button>
                            <Button 
                                sx={{ color: 'var(--color-primary)' }} 
                                onClick={() => {
                                    localStorage.removeItem('selectedCafe');
                                    navigate('/select-cafe', { replace: true });
                                }}
                            >
                                تغییر کافه
                            </Button>
                        </Box>
                    </Box>
                    <IconButton sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
                        <Search />
                    </IconButton>
                    <Badge badgeContent={getTotalItems()} color="error" sx={{ mr: 1 }}>
                        <IconButton 
                            sx={{ color: 'var(--color-primary)' }}
                            onClick={() => setCartDrawerOpen(true)}
                        >
                            <ShoppingCart />
                        </IconButton>
                    </Badge>
                    <Box sx={{ display: 'flex', gap: 1, marginRight: '7px' }}>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: 'var(--color-primary)' }}
                            onClick={requireAuthAndGoProfile}
                        >
                            ورود | ثبت نام
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <ShoppingCartDrawer
                open={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={(itemId, newQuantity) => {
                    const item = cartItems.find(i => i.id === itemId);
                    if (item) {
                        updateQuantity(itemId, item.type, newQuantity);
                    }
                }}
                onRemoveItem={(itemId) => {
                    const item = cartItems.find(i => i.id === itemId);
                    if (item) {
                        removeFromCart(itemId, item.type);
                    }
                }}
                onCheckout={() => {
                    alert('سفارش شما با موفقیت ثبت شد.');
                    clearCart();
                }}
            />

            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onAuthenticated={(user) => {
                    setAuthDialogOpen(false);
                    // Redirect regular users (customers) to /customer
                    if (user && user.role === 'customer') {
                        navigate('/customer');
                    }
                }}
            />
        </>
    );
};

export default HeaderBar;


