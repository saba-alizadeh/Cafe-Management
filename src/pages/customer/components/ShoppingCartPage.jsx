import React from 'react';
import { 
    Box, Container, Typography, Alert, Card, CardContent, Grid, Chip, 
    Button, List, ListItem, ListItemText, Divider, IconButton
} from '@mui/material';
import { ShoppingCart, Delete, Restaurant, Movie, Event, BusinessCenter } from '@mui/icons-material';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import ShoppingCartDrawer from '../../../components/ShoppingCart/ShoppingCartDrawer';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';
import { useNavigate } from 'react-router-dom';

const ShoppingCartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { apiBaseUrl, token, user } = useAuth();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [checkoutError, setCheckoutError] = React.useState('');
    const [checkoutSuccess, setCheckoutSuccess] = React.useState(false);
    const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

    const getItemIcon = (type) => {
        switch(type) {
            case 'table': return <Restaurant />;
            case 'cinema': return <Movie />;
            case 'event': return <Event />;
            case 'coworking': return <BusinessCenter />;
            default: return <ShoppingCart />;
        }
    };

    const getItemTypeLabel = (type) => {
        switch(type) {
            case 'table': return 'رزرو میز';
            case 'cinema': return 'رزرو سینما';
            case 'event': return 'رزرو رویداد';
            case 'coworking': return 'رزرو فضای مشترک';
            default: return 'محصول';
        }
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        سبد خرید / سفارش‌های فعال
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ShoppingCart />}
                        onClick={() => setDrawerOpen(true)}
                    >
                        مشاهده جزئیات سبد خرید
                    </Button>
                </Box>
                {checkoutError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCheckoutError('')}>
                        {checkoutError}
                    </Alert>
                )}
                {checkoutSuccess && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        سفارش شما با موفقیت ثبت شد!
                    </Alert>
                )}
                
                {cartItems.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                سبد خرید شما خالی است
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {cartItems.map((item) => (
                            <Grid item xs={12} md={6} key={item.id}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getItemIcon(item.type)}
                                                <Typography variant="h6">
                                                    {item.name || item.title || 'آیتم بدون نام'}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const itemToRemove = cartItems.find(i => i.id === item.id);
                                                    if (itemToRemove) {
                                                        removeFromCart(item.id, item.type);
                                                    }
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                        <Chip 
                                            label={getItemTypeLabel(item.type)} 
                                            size="small" 
                                            color="primary" 
                                            sx={{ mb: 1 }} 
                                        />
                                        <Chip 
                                            label="در حال پردازش" 
                                            size="small" 
                                            color="warning" 
                                            sx={{ mb: 1, mr: 1 }} 
                                        />
                                        <Divider sx={{ my: 2 }} />
                                        <List dense>
                                            {item.date && (
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="تاریخ" 
                                                        secondary={item.date}
                                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    />
                                                </ListItem>
                                            )}
                                            {item.time && (
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="ساعت" 
                                                        secondary={item.time}
                                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    />
                                                </ListItem>
                                            )}
                                            {item.quantity && (
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="تعداد" 
                                                        secondary={item.quantity}
                                                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                    />
                                                </ListItem>
                                            )}
                                            <ListItem>
                                                <ListItemText 
                                                    primary="قیمت" 
                                                    secondary={`${((item.price || item.basePrice || 0) * (item.quantity || 1)).toLocaleString()} تومان`}
                                                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                                />
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
                
                <ShoppingCartDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
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
                    onCheckout={async (discountInfo, discountCode) => {
                        setCheckoutError('');
                        setCheckoutSuccess(false);
                        
                        // Check authentication first
                        if (!user) {
                            setDrawerOpen(false);
                            setAuthDialogOpen(true);
                            return;
                        }

                        const authToken = token || localStorage.getItem('authToken');
                        if (!authToken) {
                            setCheckoutError('لطفاً ابتدا وارد سیستم شوید');
                            return;
                        }

                        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
                        if (!selectedCafe || !selectedCafe.id) {
                            setCheckoutError('لطفاً ابتدا یک کافه انتخاب کنید');
                            return;
                        }

                        try {
                            // Create reservations for each cart item
                            const reservationPromises = cartItems
                                .filter(item => ['table', 'cinema', 'event', 'coworking'].includes(item.type))
                                .map(async (item) => {
                                    const reservationData = {
                                        cafe_id: selectedCafe.id,
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
                                        return fetch(`${apiBaseUrl}/reservations/cinema`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${authToken}`
                                            },
                                            body: JSON.stringify({
                                                ...reservationData,
                                                session_id: item.sessionId,
                                                seat_numbers: item.selectedSeats || [],
                                                attendee_names: item.peopleNames || []
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

                            const results = await Promise.allSettled(reservationPromises);
                            const failed = results.filter(r => r.status === 'rejected' || (r.value && !r.value.ok));
                            
                            if (failed.length > 0) {
                                setCheckoutError('برخی از رزروها با خطا مواجه شدند. لطفاً دوباره تلاش کنید.');
                                return;
                            }

                            const total = cartItems.reduce((sum, item) => sum + ((item.price || item.basePrice || 0) * item.quantity), 0);
                            const finalTotal = discountInfo && discountInfo.valid ? discountInfo.final_amount : total;
                            
                            setCheckoutSuccess(true);
                            setTimeout(() => {
                                clearCart();
                                setCheckoutSuccess(false);
                            }, 2000);
                        } catch (error) {
                            console.error('Checkout error:', error);
                            setCheckoutError('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
                        }
                    }}
                />

                <PhoneAuthDialog
                    open={authDialogOpen}
                    onClose={() => setAuthDialogOpen(false)}
                    onAuthenticated={() => {
                        setAuthDialogOpen(false);
                        // After authentication, reopen drawer so user can checkout
                        setDrawerOpen(true);
                    }}
                    onNewUser={() => {
                        setAuthDialogOpen(false);
                        // New user: redirect to profile page
                        navigate('/customer/profile');
                    }}
                />
            </Container>
        </Box>
    );
};

export default ShoppingCartPage;

