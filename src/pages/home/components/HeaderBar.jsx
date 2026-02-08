import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Badge, Avatar } from '@mui/material';
import { Search, Favorite, Home, ShoppingCart, Info, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';
import ShoppingCartDrawer from '../../../components/ShoppingCart/ShoppingCartDrawer';
import { getImageUrl } from '../../../utils/imageUtils';

const HeaderBar = ({ selectedCafe, onAboutClick }) => {
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const { user, apiBaseUrl, token } = useAuth();
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

    const handleCheckoutSubmit = async (discountInfo, discountCode) => {
        // Ensure authenticated
        if (!user) {
            setAuthDialogOpen(true);
            return;
        }

        const authToken = token || localStorage.getItem('authToken');
        if (!authToken) {
            alert('لطفاً ابتدا وارد سیستم شوید');
            return;
        }

        const selectedCafeFromStorage = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        if (!selectedCafeFromStorage || !selectedCafeFromStorage.id) {
            alert('لطفاً ابتدا یک کافه انتخاب کنید');
            return;
        }

        try {
            // Separate reservations and product orders
            const reservationItems = cartItems.filter(item =>
                ['table', 'cinema', 'event', 'coworking'].includes(item.type)
            );
            const productItems = cartItems.filter(
                item => !['table', 'cinema', 'event', 'coworking'].includes(item.type)
            );

            // Create reservations for reservation items
            const reservationPromises = reservationItems.map(async (item) => {
                const reservationData = {
                    cafe_id: selectedCafeFromStorage.id,
                    date: item.date || item.sessionDate || new Date().toISOString().split('T')[0],
                    time: item.time || item.sessionTime || '12:00',
                    number_of_people: item.people || item.numberOfPeople || item.quantity || 1,
                    status: 'confirmed',
                    notes: item.notes || ''
                };

                if (item.type === 'table') {
                    return fetch(`${apiBaseUrl}/reservations/table`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            ...reservationData,
                            table_id: item.tableId
                        })
                    });
                } else if (item.type === 'cinema') {
                    const seatNumbers = (item.selectedSeats || []).map(s => String(s));
                    if (seatNumbers.length === 0) {
                        return Promise.reject(new Error('لطفاً حداقل یک صندلی برای رزرو سینما انتخاب کنید'));
                    }
                    return fetch(`${apiBaseUrl}/reservations/cinema`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            ...reservationData,
                            session_id: String(item.sessionId),
                            seat_numbers: seatNumbers,
                            attendee_names: (item.peopleNames || []).map(n => String(n))
                        })
                    });
                } else if (item.type === 'event') {
                    return fetch(`${apiBaseUrl}/reservations/event`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            ...reservationData,
                            event_id: item.eventId,
                            session_id: item.sessionId,
                            attendee_names: item.peopleNames || []
                        })
                    });
                } else if (item.type === 'coworking') {
                    return fetch(`${apiBaseUrl}/reservations/coworking`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            ...reservationData,
                            table_id: item.tableId
                        })
                    });
                }
                return Promise.resolve(null);
            });

            // Create order for product items
            if (productItems.length > 0) {
                const subtotal = productItems.reduce(
                    (sum, item) => sum + ((item.price || item.basePrice || 0) * item.quantity),
                    0
                );
                const finalTotal =
                    discountInfo && discountInfo.valid ? discountInfo.final_amount : subtotal;

                const orderData = {
                    cafe_id: selectedCafeFromStorage.id,
                    items: productItems.map(item => ({
                        product_id: item.productId || item.id,
                        product_name: item.name || item.title || 'آیتم بدون نام',
                        product_type: item.type || 'product',
                        price: item.price || item.basePrice || 0,
                        quantity: item.quantity || 1,
                        custom_ingredients: item.ingredients || null
                    })),
                    customer_name:
                        (user.firstName && user.lastName)
                            ? `${user.firstName} ${user.lastName}`
                            : user.phone || null,
                    customer_phone: user.phone || null,
                    table_number: null,
                    discount_code: discountCode || null,
                    discount_percent: discountInfo && discountInfo.valid
                        ? discountInfo.discount_percent
                        : null,
                    discount_amount: discountInfo && discountInfo.valid
                        ? discountInfo.discount_amount
                        : null,
                    subtotal,
                    total: finalTotal,
                    notes: ''
                };

                const orderResponse = await fetch(`${apiBaseUrl}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(orderData)
                });

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'خطا در ثبت سفارش');
                }
                await orderResponse.json();
            }

            const reservationResults = await Promise.allSettled(reservationPromises);
            const failedReservations = reservationResults.filter(
                r => r.status === 'rejected' || (r.value && !r.value.ok)
            );

            if (failedReservations.length > 0) {
                alert('برخی از رزروها با خطا مواجه شدند. لطفاً دوباره تلاش کنید.');
                return;
            }

            alert('سفارش شما با موفقیت ثبت شد.');
            clearCart();
        } catch (error) {
            console.error('Checkout error:', error);
            alert(error.message || 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 'none', direction: 'rtl' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        {/* Cafe Logo - ONLY use logo_url, never banner_url or image_url */}
                        {selectedCafe?.logo_url && (
                            <Avatar
                                src={getImageUrl(selectedCafe.logo_url, apiBaseUrl)}
                                alt={`${selectedCafe.name} logo`}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 1,
                                    bgcolor: 'var(--color-primary)',
                                    border: '2px solid',
                                    borderColor: 'var(--color-primary)',
                                }}
                                imgProps={{
                                    style: {
                                        objectFit: 'contain',
                                        padding: '4px',
                                    }
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
                        {user ? (
                            <IconButton
                                sx={{ 
                                    bgcolor: 'var(--color-primary)', 
                                    color: 'var(--color-secondary)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-primary)',
                                        opacity: 0.9
                                    }
                                }}
                                onClick={() => navigate('/customer')}
                                title="پنل کاربری"
                            >
                                <Person />
                            </IconButton>
                        ) : (
                            <Button
                                variant="contained"
                                sx={{ bgcolor: 'var(--color-primary)' }}
                                onClick={requireAuthAndGoProfile}
                            >
                                ورود | ثبت نام
                            </Button>
                        )}
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
                onCheckout={(discountInfo, discountCode) => {
                    handleCheckoutSubmit(discountInfo, discountCode);
                }}
            />

            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onAuthenticated={(user) => {
                    setAuthDialogOpen(false);
                    // Existing user: stay on current page (no redirect)
                }}
                onNewUser={(user) => {
                    setAuthDialogOpen(false);
                    // New user: redirect to profile page to complete registration
                    navigate('/customer/profile');
                }}
            />
        </>
    );
};

export default HeaderBar;


