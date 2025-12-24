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
    Badge
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Remove,
    Add,
    Delete,
    LocalOffer
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ShoppingCartDrawer = ({ open, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
    const navigate = useNavigate();
    const [discountCode, setDiscountCode] = React.useState('');

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + ((item.price || item.basePrice || 0) * item.quantity), 0);
    };

    const applyDiscount = () => {
        if (discountCode === 'SAVE20') {
            return getTotalPrice() * 0.2;
        }
        return 0;
    };

    const finalTotal = getTotalPrice() - applyDiscount();

    const handleCheckout = () => {
        onCheckout();
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
                        <Box display="flex" gap={1} mb={2} flexDirection="row-reverse">
                            <Button variant="outlined" size="small" sx={{ flexShrink: 0 }}>
                                اعمال
                            </Button>
                            <TextField
                                size="small"
                                placeholder="کد تخفیف"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                fullWidth
                                sx={{
                                    '& input': { textAlign: 'right' }
                                }}
                            />
                        </Box>

                        {/* Total Summary */}
                        <Box display="flex" justifyContent="space-between" mb={1} flexDirection="row-reverse">
                            <Typography>{getTotalPrice().toLocaleString()} تومان</Typography>
                            <Typography>جمع کل:</Typography>
                        </Box>
                        {applyDiscount() > 0 && (
                            <Box display="flex" justifyContent="space-between" mb={1} flexDirection="row-reverse">
                                <Typography color="success.main">-{applyDiscount().toLocaleString()} تومان</Typography>
                                <Typography color="success.main">تخفیف:</Typography>
                            </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" mb={2} flexDirection="row-reverse">
                            <Typography variant="h6">{finalTotal.toLocaleString()} تومان</Typography>
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
