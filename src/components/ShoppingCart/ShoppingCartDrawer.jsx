import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    InputAdornment,
    Badge,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Remove,
    Add,
    Delete,
    LocalOffer
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ShoppingCartDrawer = ({ open, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
    const navigate = useNavigate();
    const { apiBaseUrl } = useAuth();
    const [discountCode, setDiscountCode] = React.useState('');
    const [discountInfo, setDiscountInfo] = React.useState(null);
    const [discountError, setDiscountError] = React.useState('');
    const [verifyingDiscount, setVerifyingDiscount] = React.useState(false);
    const [appliedDiscountCode, setAppliedDiscountCode] = React.useState('');

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + ((item.price || item.basePrice || 0) * item.quantity), 0);
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountError('لطفاً کد تخفیف را وارد کنید');
            return;
        }

        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        if (!selectedCafe || !selectedCafe.id) {
            setDiscountError('لطفاً ابتدا یک کافه انتخاب کنید');
            return;
        }

        setVerifyingDiscount(true);
        setDiscountError('');

        try {
            const response = await fetch(`${apiBaseUrl}/discounts/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: discountCode.trim().toUpperCase(),
                    cafe_id: selectedCafe.id,
                    total_amount: getTotalPrice()
                })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setDiscountInfo(data);
                setAppliedDiscountCode(discountCode.trim().toUpperCase());
                setDiscountError('');
            } else {
                setDiscountInfo(null);
                setAppliedDiscountCode('');
                setDiscountError(data.message || 'کد تخفیف نامعتبر است');
            }
        } catch (error) {
            console.error('Error verifying discount code:', error);
            setDiscountError('خطا در ارتباط با سرور');
            setDiscountInfo(null);
            setAppliedDiscountCode('');
        } finally {
            setVerifyingDiscount(false);
        }
    };

    const getFinalTotal = () => {
        const total = getTotalPrice();
        if (discountInfo && discountInfo.valid) {
            return discountInfo.final_amount;
        }
        return total;
    };

    const getDiscountAmount = () => {
        if (discountInfo && discountInfo.valid) {
            return discountInfo.discount_amount;
        }
        return 0;
    };

    const handleCheckout = () => {
        // Pass discount info to checkout handler
        onCheckout(discountInfo, appliedDiscountCode);
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 400 },
                    direction: 'rtl',
                }
            }}
        >
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
                    <Typography variant="h6" sx={{ textAlign: 'right', flexGrow: 1 }}>
                        سبد خریدم
                    </Typography>
                    <Badge badgeContent={cartItems.length} color="primary">
                        <ShoppingCartIcon />
                    </Badge>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Cart Items */}
                {cartItems.length === 0 ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                            سبد خریدتان خالی است
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <List sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                            {cartItems.map((item) => (
                                <ListItem key={item.id} divider>
                                    <ListItemText
                                        primary={item.name || item.title || 'آیتم بدون نام'}
                                        secondary={`${(item.price || item.basePrice || 0).toLocaleString()} تومان هر کدام`}
                                        primaryTypographyProps={{ sx: { textAlign: 'right' } }}
                                        secondaryTypographyProps={{ sx: { textAlign: 'right' } }}
                                        sx={{ mr: 2 }}
                                    />
                                    <ListItemSecondaryAction sx={{ right: 'auto', left: 10 }}>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <IconButton
                                                size="small"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Remove fontSize="small" />
                                            </IconButton>
                                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                                                {item.quantity}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Add fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ mb: 2 }} />

                        {/* Discount Code */}
                        <Box mb={2}>
                            <Box display="flex" gap={1} mb={1} flexDirection="row-reverse">
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ flexShrink: 0 }}
                                    onClick={handleApplyDiscount}
                                    disabled={verifyingDiscount || !discountCode.trim()}
                                >
                                    {verifyingDiscount ? <CircularProgress size={20} /> : 'اعمال'}
                                </Button>
                                <TextField
                                    size="small"
                                    placeholder="کد تخفیف"
                                    value={discountCode}
                                    onChange={(e) => {
                                        setDiscountCode(e.target.value);
                                        setDiscountError('');
                                        if (appliedDiscountCode) {
                                            setDiscountInfo(null);
                                            setAppliedDiscountCode('');
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleApplyDiscount();
                                        }
                                    }}
                                    fullWidth
                                    disabled={verifyingDiscount}
                                    sx={{
                                        '& input': { textAlign: 'right' }
                                    }}
                                />
                            </Box>
                            {discountError && (
                                <Alert severity="error" sx={{ mt: 1, fontSize: '0.875rem' }}>
                                    {discountError}
                                </Alert>
                            )}
                            {discountInfo && discountInfo.valid && (
                                <Alert severity="success" sx={{ mt: 1, fontSize: '0.875rem' }}>
                                    {discountInfo.message}
                                </Alert>
                            )}
                        </Box>

                        {/* Total Summary */}
                        <Box display="flex" justifyContent="space-between" mb={1} flexDirection="row-reverse">
                            <Box>
                                {discountInfo && discountInfo.valid ? (
                                    <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                        {getTotalPrice().toLocaleString()} تومان
                                    </Typography>
                                ) : (
                                    <Typography>{getTotalPrice().toLocaleString()} تومان</Typography>
                                )}
                            </Box>
                            <Typography>جمع کل:</Typography>
                        </Box>
                        {getDiscountAmount() > 0 && (
                            <Box display="flex" justifyContent="space-between" mb={1} flexDirection="row-reverse">
                                <Typography color="success.main">-{getDiscountAmount().toLocaleString()} تومان</Typography>
                                <Typography color="success.main">تخفیف:</Typography>
                            </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" mb={2} flexDirection="row-reverse">
                            <Typography variant="h6" color="primary">
                                {getFinalTotal().toLocaleString()} تومان
                            </Typography>
                            <Typography variant="h6">کل:</Typography>
                        </Box>

                        {/* Checkout Button */}
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleCheckout}
                            sx={{ mb: 1 }}
                        >
                            تایید سفارش
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={onClose}
                        >
                            ادامه خرید
                        </Button>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default ShoppingCartDrawer;
