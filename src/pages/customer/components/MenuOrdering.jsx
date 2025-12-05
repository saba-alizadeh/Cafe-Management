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
    Divider,
    Alert
} from '@mui/material';
import {
    Search,
    Add,
    Remove,
    ShoppingCart,
    LocalOffer,
    Restaurant,
    Timer,
    Check
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const MenuOrdering = ({ onAddToCart }) => {
    const [discountCode, setDiscountCode] = useState('');
    const [customizeDialog, setCustomizeDialog] = useState({ open: false, item: null });
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [addedToCartItem, setAddedToCartItem] = useState(null);
    const [pendingItem, setPendingItem] = useState(null); // Item to add after auth
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
        // If user is not logged in, show auth dialog
        if (!user) {
            setPendingItem({ item, customizations });
            setAuthDialogOpen(true);
            return;
        }

        // User is logged in or authenticated - add to cart directly
        const cartItem = {
            id: `${item.id}-${Date.now()}`,
            name: item.name,
            basePrice: item.basePrice,
            customizations,
            quantity: 1
        };
        if (onAddToCart) {
            onAddToCart(cartItem);
        }
        setAddedToCartItem(item.name);
        setTimeout(() => setAddedToCartItem(null), 2000);
    };

    const handleNewUserAuthenticated = (userData) => {
        // New user - redirect to profile ONLY during first authentication
        navigate('/customer/profile');
        if (pendingItem) {
            // Clear pending item since user is redirected
            setPendingItem(null);
        }
    };

    const handleExistingUserAuthenticated = (userData) => {
        // Existing user not logged in - add pending item to cart
        if (pendingItem) {
            const { item, customizations } = pendingItem;
            const cartItem = {
                id: `${item.id}-${Date.now()}`,
                name: item.name,
                basePrice: item.basePrice,
                customizations,
                quantity: 1
            };
            if (onAddToCart) {
                onAddToCart(cartItem);
            }
            setAddedToCartItem(item.name);
            setPendingItem(null);
            setTimeout(() => setAddedToCartItem(null), 2000);
        }
    };

    return (
        <Box dir="rtl">
            {addedToCartItem && (
                <Alert severity="success" sx={{ mb: 2 }} icon={<Check />}>
                    {addedToCartItem} به سبد خریدتان اضافه شد
                </Alert>
            )}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'right' }}>
                منو و سفارش
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, textAlign: 'right' }}>
                از منوی ما مرور کنید و سفارش خود را ثبت کنید
            </Typography>

            <Grid container spacing={3}>
                {/* Menu Items */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection="row-reverse">
                            <Typography variant="h6">موارد منو</Typography>
                            <TextField
                                size="small"
                                placeholder="جستجو در منو..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ textAlign: 'right' }}
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
                                                            سفارشی‌سازی
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<Add />}
                                                        onClick={() => addToCart(item)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        افزودن به سبد
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
            </Grid>

            {/* Customization Dialog */}
            <Dialog open={customizeDialog.open} onClose={() => setCustomizeDialog({ open: false, item: null })}>
                <DialogTitle dir="rtl" sx={{ textAlign: 'right' }}>سفارشی‌سازی {customizeDialog.item?.name}</DialogTitle>
                <DialogContent>
                    {customizeDialog.item && (
                        <Box dir="rtl">
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>سایز</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                {customizeDialog.item.options.size.map((size) => (
                                    <Chip key={size} label={size} />
                                ))}
                            </Box>
                            
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>نوع شیر</Typography>
                            <Box display="flex" gap={1} mb={2}>
                                {customizeDialog.item.options.milk.map((milk) => (
                                    <Chip key={milk} label={milk} />
                                ))}
                            </Box>
                            
                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>اضافات</Typography>
                            <Box display="flex" gap={1}>
                                {customizeDialog.item.options.extras.map((extra) => (
                                    <Chip key={extra} label={extra} />
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'row-reverse' }}>
                    <Button onClick={() => setCustomizeDialog({ open: false, item: null })}>
                        انصراف
                    </Button>
                    <Button variant="contained" onClick={() => {
                        addToCart(customizeDialog.item);
                        setCustomizeDialog({ open: false, item: null });
                    }}>
                        افزودن به سبد
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Phone Authentication Dialog */}
            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => {
                    setAuthDialogOpen(false);
                    setPendingItem(null);
                }}
                onAuthenticated={handleExistingUserAuthenticated}
                onNewUser={handleNewUserAuthenticated}
            />
        </Box>
    );
};

export default MenuOrdering;
