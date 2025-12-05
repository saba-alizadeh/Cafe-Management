import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    InputAdornment,
    Divider,
    Paper,
    Alert,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Remove,
    Add,
    Delete,
    ShoppingCart as ShoppingCartIcon,
    Check,
    Info
} from '@mui/icons-material';

const CartDisplay = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
    const [discountCode, setDiscountCode] = React.useState('');
    const [pendingReservation, setPendingReservation] = React.useState(null);
    const [openDialog, setOpenDialog] = React.useState(false);

    React.useEffect(() => {
        // Check for pending reservation from booking pages
        const reservation = localStorage.getItem('pendingReservation');
        if (reservation) {
            try {
                const reservationData = JSON.parse(reservation);
                setPendingReservation(reservationData);
                setOpenDialog(true);
            } catch (e) {
                console.error('Failed to parse pending reservation:', e);
            }
        }
    }, []);

    const handleAddReservationToCart = () => {
        if (pendingReservation && onAddToCart) {
            // Create a formatted item for the cart
            const cartItem = {
                ...pendingReservation,
                basePrice: pendingReservation.price || 0,
                quantity: pendingReservation.quantity || 1
            };
            onAddToCart(cartItem);
            localStorage.removeItem('pendingReservation');
            setPendingReservation(null);
            setOpenDialog(false);
        }
    };

    const handleRejectReservation = () => {
        localStorage.removeItem('pendingReservation');
        setPendingReservation(null);
        setOpenDialog(false);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.basePrice * item.quantity), 0);
    };

    const applyDiscount = () => {
        if (discountCode === 'SAVE20') {
            return getTotalPrice() * 0.2;
        }
        return 0;
    };

    const finalTotal = getTotalPrice() - applyDiscount();

    const handleCheckout = () => {
        if (cartItems.length > 0) {
            onCheckout();
        }
    };

    return (
        <Box dir="rtl">
            {/* Pending Reservation Dialog */}
            <Dialog open={openDialog} onClose={handleRejectReservation}>
                <DialogTitle sx={{ textAlign: 'right' }}>اضافه کردن رزرو به سبد خریدتان</DialogTitle>
                <DialogContent sx={{ textAlign: 'right' }}>
                    <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
                        آیا می‌خواهید این رزرو را به سبد خریدتان اضافه کنید؟
                    </Typography>
                    {pendingReservation && (
                        <Box sx={{ backgroundColor: 'rgba(102, 123, 104, 0.1)', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {pendingReservation.title}
                            </Typography>
                            {pendingReservation.type === 'cinema' && (
                                <>
                                    <Typography variant="body2">
                                        <strong>صندلی‌ها:</strong> {pendingReservation.seats}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>زمان:</strong> {pendingReservation.sessionTime}
                                    </Typography>
                                </>
                            )}
                            {pendingReservation.type === 'desk' && (
                                <>
                                    <Typography variant="body2">
                                        <strong>شماره میز:</strong> {pendingReservation.deskNumber}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>منطقه:</strong> {pendingReservation.zone}
                                    </Typography>
                                    {pendingReservation.notes && (
                                        <Typography variant="body2">
                                            <strong>یادداشت:</strong> {pendingReservation.notes}
                                        </Typography>
                                    )}
                                </>
                            )}
                            {pendingReservation.type === 'table' && (
                                <>
                                    <Typography variant="body2">
                                        <strong>شماره میز:</strong> {pendingReservation.tableNumber}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>موقعیت:</strong> {pendingReservation.location}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>تعداد مهمانان:</strong> {pendingReservation.guests}
                                    </Typography>
                                </>
                            )}
                            {pendingReservation.type === 'event' && (
                                <>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>رویداد:</strong> {pendingReservation.eventTitle}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>تعداد شرکت‌کنندگان:</strong> {pendingReservation.people}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>ساعت شروع:</strong> {pendingReservation.timeSlot}
                                    </Typography>
                                </>
                            )}
                            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                قیمت: {(pendingReservation.price).toLocaleString('fa-IR')} تومان
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', p: 2 }}>
                    <Button onClick={handleRejectReservation} color="inherit">
                        انصراف
                    </Button>
                    <Button onClick={handleAddReservationToCart} variant="contained" color="primary">
                        اضافه کن
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'right', mb: 1 }}>
                    سبد خریدتان
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'right' }}>
                    کالاهای انتخاب شده را مرور و پیش‌ نویس سفارش دهید
                </Typography>
            </Box>

            {cartItems.length === 0 ? (
                <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
                    سبد خریدتان خالی است. برای افزودن کالا به بخش سفارش منو بروید.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {/* Cart Items */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Badge badgeContent={cartItems.length} color="primary">
                                    <ShoppingCartIcon sx={{ color: 'var(--color-primary)', mr: 1 }} />
                                </Badge>
                                <Typography variant="h6" sx={{ color: 'var(--color-primary)' }}>
                                    {cartItems.length} مورد در سبد شما
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <List>
                                {cartItems.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        divider
                                        sx={{
                                            py: 2,
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 123, 104, 0.05)'
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" sx={{ textAlign: 'right' }}>
                                                    {item.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right', mb: 1 }}>
                                                        قیمت واحد: {item.basePrice} تومان
                                                    </Typography>
                                                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', display: 'block' }}>
                                                            سفارشی‌سازی: {JSON.stringify(item.customizations)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            primaryTypographyProps={{ sx: { textAlign: 'right' } }}
                                        />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mt: 2,
                                                width: '100%',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    sx={{
                                                        backgroundColor: 'rgba(102, 123, 104, 0.1)',
                                                        '&:hover': { backgroundColor: 'rgba(102, 123, 104, 0.2)' }
                                                    }}
                                                >
                                                    <Remove fontSize="small" />
                                                </IconButton>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        minWidth: 30,
                                                        textAlign: 'center',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    sx={{
                                                        backgroundColor: 'rgba(102, 123, 104, 0.1)',
                                                        '&:hover': { backgroundColor: 'rgba(102, 123, 104, 0.2)' }
                                                    }}
                                                >
                                                    <Add fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                                {(item.basePrice * item.quantity).toFixed(2)} تومان
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Summary Card */}
                    <Grid item xs={12} md={4}>
                        <Card
                            sx={{
                                borderRadius: 2,
                                boxShadow: 'var(--shadow-soft)',
                                backgroundColor: 'var(--color-secondary)',
                                position: 'sticky',
                                top: 100
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'var(--color-primary)',
                                        mb: 2,
                                        textAlign: 'right'
                                    }}
                                >
                                    خلاصه سفارش
                                </Typography>

                                <Divider sx={{ mb: 2 }} />

                                {/* Discount Code Input */}
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'right' }}>
                                    کد تخفیف
                                </Typography>
                                <Box display="flex" gap={1} mb={3} flexDirection="row-reverse">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            borderRadius: 1,
                                            color: 'var(--color-primary)',
                                            borderColor: 'var(--color-primary)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 123, 104, 0.1)'
                                            },
                                            flexShrink: 0
                                        }}
                                    >
                                        اعمال
                                    </Button>
                                    <TextField
                                        size="small"
                                        placeholder="کد تخفیف را وارد کنید"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        fullWidth
                                        sx={{
                                            '& input': { textAlign: 'right' },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Price Summary */}
                                <Box sx={{ mb: 2 }}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            {getTotalPrice().toFixed(2)} تومان
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            جمع کل:
                                        </Typography>
                                    </Box>

                                    {applyDiscount() > 0 && (
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" color="success.main">
                                                -{applyDiscount().toFixed(2)} تومان
                                            </Typography>
                                            <Typography variant="body2" color="success.main">
                                                تخفیف:
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Final Total */}
                                <Box display="flex" justifyContent="space-between" mb={3}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: 'var(--color-primary)'
                                        }}
                                    >
                                        {finalTotal.toFixed(2)} تومان
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        مبلغ نهایی:
                                    </Typography>
                                </Box>

                                {/* Buttons */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handleCheckout}
                                    sx={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: 1,
                                        fontWeight: 'bold',
                                        mb: 1,
                                        '&:hover': {
                                            backgroundColor: 'var(--color-accent)'
                                        }
                                    }}
                                >
                                    تایید و ثبت سفارش
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderRadius: 1,
                                        color: 'var(--color-primary)',
                                        borderColor: 'var(--color-primary)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 123, 104, 0.1)'
                                        }
                                    }}
                                >
                                    ادامه خرید
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default CartDisplay;
