import React, { useEffect, useState } from 'react';
import { 
    Box, Container, Typography, Alert, Card, CardContent, Grid, Chip, 
    Button, List, ListItem, ListItemText, Divider, IconButton, CircularProgress
} from '@mui/material';
import { ShoppingCart, Delete, Restaurant, Movie, Event, BusinessCenter, Payment } from '@mui/icons-material';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import ShoppingCartDrawer from '../../../components/ShoppingCart/ShoppingCartDrawer';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';
import { useNavigate } from 'react-router-dom';

const getStatusLabel = (status) => {
    switch (status) {
        case 'pending_approval': case 'pending': return 'در انتظار تایید';
        case 'confirmed': return 'تایید شده';
        case 'rejected': return 'رد شده';
        case 'completed': return 'انجام شده';
        case 'cancelled': return 'لغو شده';
        default: return status || 'نامشخص';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pending_approval': case 'pending': return 'warning';
        case 'confirmed': return 'success';
        case 'rejected': case 'cancelled': return 'error';
        case 'completed': return 'default';
        default: return 'default';
    }
};

const ShoppingCartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const { apiBaseUrl, token, user } = useAuth();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [checkoutError, setCheckoutError] = React.useState('');
    const [checkoutSuccess, setCheckoutSuccess] = React.useState(false);
    const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
    const [myOrders, setMyOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

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

    const fetchMyOrders = async () => {
        const authToken = token || localStorage.getItem('authToken');
        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        const isStaff = user && ['admin', 'manager', 'barista'].includes(user.role);
        const cafeId = selectedCafe?.id ?? (isStaff ? user?.cafe_id : null);
        if (!authToken || !user || !cafeId) return;
        setOrdersLoading(true);
        try {
            const [reservationsRes, ordersRes] = await Promise.all([
                fetch(`${apiBaseUrl}/reservations?cafe_id=${cafeId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                fetch(`${apiBaseUrl}/orders?cafe_id=${cafeId}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            if (!reservationsRes.ok || !ordersRes.ok) return;
            const reservations = await reservationsRes.json();
            const orders = await ordersRes.json();
            const items = [
                ...(Array.isArray(reservations) ? reservations.map(r => ({
                    id: r.id,
                    kind: 'reservation',
                    type: r.reservation_type,
                    name: r.reservation_type === 'table' ? `رزرو میز ${r.table_id || ''}` : r.reservation_type === 'cinema' ? 'رزرو سینما' : r.reservation_type === 'event' ? 'رزرو رویداد' : r.reservation_type === 'coworking' ? 'رزرو فضای مشترک' : 'رزرو',
                    date: r.date,
                    time: r.time,
                    status: r.status,
                    total: 0,
                    resource_info: r.reservation_type
                })) : []),
                ...(Array.isArray(orders) ? orders.map(o => ({
                    id: o.id,
                    kind: 'order',
                    type: 'order',
                    name: `سفارش محصولات (${(o.items || []).length} آیتم)`,
                    date: o.created_at ? new Date(o.created_at).toLocaleDateString('fa-IR') : '',
                    time: o.created_at ? new Date(o.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) : '',
                    status: o.status,
                    total: o.total || 0,
                    resource_info: 'order'
                })) : [])
            ];
            setMyOrders(items.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
        } catch (e) {
            console.error(e);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) fetchMyOrders();
    }, [user, token, checkoutSuccess]);

    const [paymentLoading, setPaymentLoading] = useState(false);

    const handlePayment = async (item) => {
        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        const isStaff = user && ['admin', 'manager', 'barista'].includes(user.role);
        const cafeId = selectedCafe?.id ?? (isStaff ? user?.cafe_id : null);
        if (!cafeId) {
            setCheckoutError(isStaff ? 'شناسه کافه در دسترس نیست' : 'لطفاً ابتدا یک کافه انتخاب کنید');
            return;
        }
        const rawAmount = Math.round(Number(item.total) || 0);
        const amount = rawAmount >= 1000 ? rawAmount : Math.max(rawAmount * 10, 1000);
        const authToken = token || localStorage.getItem('authToken');
        if (!authToken) {
            setCheckoutError('لطفاً ابتدا وارد شوید');
            return;
        }
        setPaymentLoading(true);
        setCheckoutError('');
        try {
            const callbackUrl = `${window.location.origin}/customer/payment-callback`;
            const res = await fetch(
                `${apiBaseUrl}/payments/request?callback_url=${encodeURIComponent(callbackUrl)}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        amount,
                        item_kind: item.kind,
                        item_id: item.id,
                        cafe_id: String(cafeId),
                        description: `پرداخت ${item.name}`,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'خطا در ایجاد درخواست پرداخت');
            }
            if (data.payment_url) {
                window.open(data.payment_url, '_blank');
            } else {
                throw new Error('پاسخ نامعتبر از سرور');
            }
        } catch (err) {
            setCheckoutError(err.message || 'خطا در اتصال به درگاه پرداخت');
        } finally {
            setPaymentLoading(false);
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
                        سفارش شما با موفقیت ثبت شد! در انتظار تایید کافه می‌باشد.
                    </Alert>
                )}

                {/* My Orders & Reservations */}
                {user && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>سفارشات و رزروهای من</Typography>
                        {ordersLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
                        ) : myOrders.length === 0 ? (
                            <Typography color="text.secondary">سفارش یا رزرو فعالی ندارید.</Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {myOrders.map((item) => (
                                    <Grid item xs={12} md={6} key={`${item.kind}-${item.id}`}>
                                        <Card sx={{ height: '100%' }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                                    <Typography variant="subtitle1" fontWeight={600}>{item.name}</Typography>
                                                    <Chip
                                                        label={getStatusLabel(item.status)}
                                                        color={getStatusColor(item.status)}
                                                        size="small"
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.date} {item.time}
                                                </Typography>
                                                {item.total > 0 && (
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        مبلغ: {item.total.toLocaleString()} تومان
                                                    </Typography>
                                                )}
                                                {item.status === 'confirmed' && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<Payment />}
                                                        onClick={() => handlePayment(item)}
                                                        disabled={paymentLoading}
                                                        sx={{ mt: 2 }}
                                                    >
                                                        {paymentLoading ? 'در حال انتقال...' : 'پرداخت'}
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>سبد خرید</Typography>
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
                            // Separate reservations and product orders
                            const reservationItems = cartItems.filter(item => ['table', 'cinema', 'event', 'coworking'].includes(item.type));
                            const productItems = cartItems.filter(item => !['table', 'cinema', 'event', 'coworking'].includes(item.type));
                            
                            // Create reservations for reservation items
                            const reservationPromises = reservationItems.map(async (item) => {
                                const reservationData = {
                                    cafe_id: selectedCafe.id,
                                    date: item.date || item.sessionDate || new Date().toISOString().split('T')[0],
                                    time: item.time || item.sessionTime || '12:00',
                                    number_of_people: item.people || item.numberOfPeople || item.quantity || 1,
                                    status: 'pending_approval',
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
                            let orderResult = null;
                            if (productItems.length > 0) {
                                const subtotal = productItems.reduce((sum, item) => sum + ((item.price || item.basePrice || 0) * item.quantity), 0);
                                const finalTotal = discountInfo && discountInfo.valid ? discountInfo.final_amount : subtotal;
                                
                                const orderData = {
                                    cafe_id: selectedCafe.id,
                                    items: productItems.map(item => ({
                                        product_id: item.productId || item.id,
                                        product_name: item.name || item.title || 'آیتم بدون نام',
                                        product_type: item.type || 'product',
                                        price: item.price || item.basePrice || 0,
                                        quantity: item.quantity || 1,
                                        custom_ingredients: item.ingredients || null
                                    })),
                                    customer_name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.phone || null,
                                    customer_phone: user.phone || null,
                                    table_number: null, // Can be added later if needed
                                    discount_code: discountCode || null,
                                    discount_percent: discountInfo && discountInfo.valid ? discountInfo.discount_percent : null,
                                    discount_amount: discountInfo && discountInfo.valid ? discountInfo.discount_amount : null,
                                    subtotal: subtotal,
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
                                orderResult = await orderResponse.json();
                            }

                            // Wait for all reservations
                            const reservationResults = await Promise.allSettled(reservationPromises);
                            const failedReservations = reservationResults.filter(r => r.status === 'rejected' || (r.value && !r.value.ok));
                            
                            if (failedReservations.length > 0) {
                                setCheckoutError('برخی از رزروها با خطا مواجه شدند. لطفاً دوباره تلاش کنید.');
                                return;
                            }

                            setCheckoutSuccess(true);
                            setTimeout(() => {
                                clearCart();
                                setCheckoutSuccess(false);
                            }, 2000);
                        } catch (error) {
                            console.error('Checkout error:', error);
                            setCheckoutError(error.message || 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
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

