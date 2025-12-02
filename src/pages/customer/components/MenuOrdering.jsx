import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    Button,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider
} from '@mui/material';
import {
    Search,
    Add,
    Remove,
    ShoppingCart,
    LocalOffer,
    Restaurant,
    Timer
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const MenuOrdering = () => {
    const [cart, setCart] = useState([]);
    const [discountCode, setDiscountCode] = useState('');
    const [customizeDialog, setCustomizeDialog] = useState({ open: false, item: null });
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock data - in real app, this would come from API
    const menuItems = [
        {
            id: 1,
            name: 'Cappuccino',
            category: 'Beverages',
            basePrice: 4.50,
            description: 'Rich espresso with steamed milk and foam',
            customizable: true,
            options: {
                size: ['Small', 'Medium', 'Large'],
                milk: ['Whole', 'Skim', 'Almond', 'Oat'],
                extras: ['Extra Shot', 'Vanilla', 'Caramel', 'Chocolate']
            }
        },
        {
            id: 2,
            name: 'Latte',
            category: 'Beverages',
            basePrice: 4.00,
            description: 'Smooth espresso with steamed milk',
            customizable: true,
            options: {
                size: ['Small', 'Medium', 'Large'],
                milk: ['Whole', 'Skim', 'Almond', 'Oat'],
                extras: ['Extra Shot', 'Vanilla', 'Caramel']
            }
        },
        {
            id: 3,
            name: 'Croissant',
            category: 'Pastries',
            basePrice: 3.50,
            description: 'Buttery, flaky pastry',
            customizable: false
        },
        {
            id: 4,
            name: 'Muffin',
            category: 'Pastries',
            basePrice: 2.50,
            description: 'Fresh baked muffin',
            customizable: false
        }
    ];

    const addToCart = (item, customizations = {}) => {
        const cartItem = {
            id: `${item.id}-${Date.now()}`,
            name: item.name,
            basePrice: item.basePrice,
            customizations,
            quantity: 1,
            totalPrice: item.basePrice
        };
        setCart([...cart, cartItem]);
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.id !== itemId));
        } else {
            setCart(cart.map(item => 
                item.id === itemId 
                    ? { ...item, quantity: newQuantity, totalPrice: item.basePrice * newQuantity }
                    : item
            ));
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.totalPrice, 0);
    };

    const applyDiscount = () => {
        // Mock discount logic
        if (discountCode === 'SAVE20') {
            return getTotalPrice() * 0.2;
        }
        return 0;
    };

    const finalTotal = getTotalPrice() - applyDiscount();

    const completeOrder = () => {
        // Placeholder for actual order placement / payment flow
        alert('سفارش شما با موفقیت ثبت شد.');
    };

    const handlePlaceOrderClick = () => {
        if (!user) {
            setAuthDialogOpen(true);
            return;
        }
        completeOrder();
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Menu & Ordering
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                Browse our menu and place your order
            </Typography>

            <Grid container spacing={3}>
                {/* Menu Items */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Menu Items</Typography>
                            <TextField
                                size="small"
                                placeholder="Search menu..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                        <Grid container spacing={2}>
                            {menuItems.map((item) => (
                                <Grid item xs={12} sm={6} key={item.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {item.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {item.description}
                                            </Typography>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="h6" color="primary">
                                                    ${item.basePrice}
                                                </Typography>
                                                <Box>
                                                    {item.customizable && (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => setCustomizeDialog({ open: true, item })}
                                                        >
                                                            Customize
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<Add />}
                                                        onClick={() => addToCart(item)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Shopping Cart */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <ShoppingCart sx={{ mr: 1 }} />
                            <Typography variant="h6">Shopping Cart</Typography>
                        </Box>
                        
                        {cart.length === 0 ? (
                            <Typography color="text.secondary" align="center">
                                Your cart is empty
                            </Typography>
                        ) : (
                            <>
                                <List>
                                    {cart.map((item) => (
                                        <ListItem key={item.id} divider>
                                            <ListItemText
                                                primary={item.name}
                                                secondary={`$${item.basePrice} each`}
                                            />
                                            <ListItemSecondaryAction>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Remove />
                                                    </IconButton>
                                                    <Typography variant="body2">
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                {/* Discount Code */}
                                <Box display="flex" gap={1} mb={2}>
                                    <TextField
                                        size="small"
                                        placeholder="Discount code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        fullWidth
                                    />
                                    <Button variant="outlined" size="small">
                                        Apply
                                    </Button>
                                </Box>
                                
                                {/* Total */}
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>Subtotal:</Typography>
                                    <Typography>${getTotalPrice().toFixed(2)}</Typography>
                                </Box>
                                {applyDiscount() > 0 && (
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography color="success.main">Discount:</Typography>
                                        <Typography color="success.main">-${applyDiscount().toFixed(2)}</Typography>
                                    </Box>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="h6">Total:</Typography>
                                    <Typography variant="h6">${finalTotal.toFixed(2)}</Typography>
                                </Box>
                                
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handlePlaceOrderClick}
                                >
                                    Place Order
                                </Button>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Customization Dialog */}
            <Dialog open={customizeDialog.open} onClose={() => setCustomizeDialog({ open: false, item: null })}>
                <DialogTitle>Customize {customizeDialog.item?.name}</DialogTitle>
                <DialogContent>
                    {customizeDialog.item && (
                        <Box>
                            <Typography variant="h6" gutterBottom>Size</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                {customizeDialog.item.options.size.map((size) => (
                                    <Chip key={size} label={size} />
                                ))}
                            </Box>
                            
                            <Typography variant="h6" gutterBottom>Milk Type</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                {customizeDialog.item.options.milk.map((milk) => (
                                    <Chip key={milk} label={milk} />
                                ))}
                            </Box>
                            
                            <Typography variant="h6" gutterBottom>Extras</Typography>
                            <Box display="flex" gap={1}>
                                {customizeDialog.item.options.extras.map((extra) => (
                                    <Chip key={extra} label={extra} />
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCustomizeDialog({ open: false, item: null })}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={() => {
                        addToCart(customizeDialog.item);
                        setCustomizeDialog({ open: false, item: null });
                    }}>
                        Add to Cart
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Phone Authentication Dialog */}
            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onAuthenticated={() => {
                    setAuthDialogOpen(false);
                    completeOrder();
                    navigate('/customer/profile');
                }}
            />
        </Box>
    );
};

export default MenuOrdering;
