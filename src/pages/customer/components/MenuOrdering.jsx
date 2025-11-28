import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Paper,
    Button,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from '@mui/material';
import {
    Search,
    Add,
    Remove,
    ShoppingCart,
    LocalCafe,
    Tune
} from '@mui/icons-material';
import { useState } from 'react';

const MenuOrdering = () => {
    const cafes = [
        { id: 'central-branch', name: 'کافه مرکزی ولیعصر', location: 'تهران، ولیعصر، نبش کوچه دوازدهم' },
        { id: 'north-branch', name: 'کافه نیاوران', location: 'تهران، نیاوران، بلوار پورابتهاج' },
        { id: 'west-branch', name: 'کافه شهرک غرب', location: 'تهران، شهرک غرب، فاز ۲' }
    ];

    const ordersByCafe = {
        'central-branch': [
            {
                id: 'order-central-1',
                name: 'کاپوچینو کلاسیک',
                description: 'اسپرسو تیره با فوم نرم و دارچین تازه',
                basePrice: 145000,
                lastOrdered: '۱۴ آذر ۱۴۰۲',
                status: 'آماده تحویل',
                customizations: {
                    size: 'متوسط',
                    milk: 'بادام',
                    extras: ['وانیل', 'پودر دارچین']
                }
            },
            {
                id: 'order-central-2',
                name: 'ماکیاتو کاراملی',
                description: 'دو شات اسپرسو با سس کارامل دست‌ساز',
                basePrice: 165000,
                lastOrdered: '۲۷ آبان ۱۴۰۲',
                status: 'در حال آماده سازی',
                customizations: {
                    size: 'بزرگ',
                    milk: 'پرچرب',
                    extras: ['کارامل اضافه']
                }
            }
        ],
        'north-branch': [
            {
                id: 'order-north-1',
                name: 'لاته وانیلی',
                description: 'لاته ملایم با سیروپ وانیل ماداگاسکار',
                basePrice: 155000,
                lastOrdered: '۱۰ آذر ۱۴۰۲',
                status: 'تحویل شده',
                customizations: {
                    size: 'متوسط',
                    milk: 'جوی دوسر',
                    extras: ['وانیل', 'خامه']
                }
            },
            {
                id: 'order-north-2',
                name: 'چای ماسالا',
                description: 'چای ماسالا با ادویه‌های تازه آسیایی',
                basePrice: 120000,
                lastOrdered: '۲۵ مهر ۱۴۰۲',
                status: 'تحویل شده',
                customizations: {
                    size: 'کوچک',
                    milk: 'نارگیل',
                    extras: ['عسل ارگانیک']
                }
            }
        ],
        'west-branch': [
            {
                id: 'order-west-1',
                name: 'آفوگاتو',
                description: 'اسکوپ بستنی وانیل با شات اسپرسو تازه',
                basePrice: 180000,
                lastOrdered: '۶ آبان ۱۴۰۲',
                status: 'تحویل شده',
                customizations: {
                    size: 'تکی',
                    milk: 'بدون شیر',
                    extras: ['شکلات تلخ رنده شده']
                }
            }
        ]
    };

    const savedCustomDrink = {
        id: 'custom-1',
        name: 'ترکیب اختصاصی انرژی‌زا',
        description: 'اسپرسو دو شات با شیر بادام، سیروپ کارامل و تکه‌های بلوبری تازه',
        basePrice: 185000,
        ingredients: [
            { label: '☕ اسپرسو دو شات', type: 'base' },
            { label: '🥛 شیر بادام', type: 'milk' },
            { label: '🍯 سیروپ کارامل', type: 'syrup' },
            { label: '🫐 بلوبری تازه', type: 'fruit' },
            { label: '☁️ خامه زده شده', type: 'extra' }
        ]
    };

    const [selectedCafe, setSelectedCafe] = useState(cafes[0]?.id || '');
    const [reorderQuantities, setReorderQuantities] = useState({});
    const [customDrinkQuantity, setCustomDrinkQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [discountCode, setDiscountCode] = useState('');
    const [orderSearch, setOrderSearch] = useState('');

    const formatCurrency = (value) =>
        new Intl.NumberFormat('fa-IR', { style: 'currency', currency: 'IRR' }).format(value);

    const currentCafe = cafes.find((cafe) => cafe.id === selectedCafe);
    const cafeOrders = selectedCafe ? ordersByCafe[selectedCafe] || [] : [];
    const filteredOrders = cafeOrders.filter((item) => {
        if (!orderSearch.trim()) return true;
        const keyword = orderSearch.trim().toLowerCase();
        return (
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)
        );
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'آماده تحویل':
                return 'success';
            case 'در حال آماده سازی':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getReorderQuantity = (itemId) => reorderQuantities[itemId] || 1;

    const updateReorderQuantity = (itemId, delta) => {
        setReorderQuantities((prev) => {
            const current = prev[itemId] || 1;
            const nextValue = Math.max(1, current + delta);
            return { ...prev, [itemId]: nextValue };
        });
    };

    const updateCustomDrinkQuantity = (delta) => {
        setCustomDrinkQuantity((prev) => Math.max(1, prev + delta));
    };

    const getCustomizationSummary = (customizations) => {
        if (!customizations) return '';
        const summary = [];
        if (customizations.size) summary.push(`اندازه: ${customizations.size}`);
        if (customizations.milk) summary.push(`نوع شیر: ${customizations.milk}`);
        if (customizations.extras?.length) summary.push(`افزودنی‌ها: ${customizations.extras.join('، ')}`);
        if (customizations.ingredients?.length) summary.push(`مواد: ${customizations.ingredients.join('، ')}`);
        return summary.join(' | ');
    };

    const addToCart = (item, customizations = {}, quantity = 1) => {
        const normalizedQuantity = Math.max(1, quantity);
        const cartItem = {
            id: `${item.id}-${Date.now()}`,
            name: item.name,
            basePrice: item.basePrice,
            customizations,
            quantity: normalizedQuantity,
            totalPrice: item.basePrice * normalizedQuantity
        };
        setCart((prev) => [...prev, cartItem]);
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

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Typography variant="h4" gutterBottom>
                سفارش‌های من
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                ابتدا کافه مورد نظر را انتخاب کنید تا سفارش‌های همان کافه را مشاهده و مدیریت کنید
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <FormControl fullWidth size="small">
                    <InputLabel id="cafe-select-label">انتخاب کافه</InputLabel>
                    <Select
                        labelId="cafe-select-label"
                        label="انتخاب کافه"
                        value={selectedCafe}
                        onChange={(event) => setSelectedCafe(event.target.value)}
                    >
                        {cafes.map((cafe) => (
                            <MenuItem key={cafe.id} value={cafe.id}>
                                {cafe.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <LocalCafe color="primary" />
                                    <Box>
                                        <Typography variant="h6">
                                            سفارش‌های {currentCafe?.name}
                                        </Typography>
                                        {currentCafe && (
                                            <Typography variant="body2" color="text.secondary">
                                                {currentCafe.location}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                <TextField
                                    size="small"
                                    placeholder="جستجوی سفارش‌ها..."
                                    value={orderSearch}
                                    onChange={(event) => setOrderSearch(event.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {filteredOrders.length === 0 ? (
                                <Box py={6} textAlign="center">
                                    <Typography color="text.secondary">
                                        برای این کافه سفارشی ثبت نشده است.
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {filteredOrders.map((item) => (
                                        <Grid item xs={12} sm={6} key={item.id}>
                                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                <CardContent>
                                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                        <Typography variant="h6">
                                                            {item.name}
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label={item.status}
                                                            color={getStatusColor(item.status)}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                                        {item.description}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        آخرین سفارش: {item.lastOrdered}
                                                    </Typography>
                                                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                                                        {formatCurrency(item.basePrice)}
                                                    </Typography>
                                                    {getCustomizationSummary(item.customizations) && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {getCustomizationSummary(item.customizations)}
                                                        </Typography>
                                                    )}
                                                </CardContent>
                                                <CardActions sx={{ mt: 'auto', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <IconButton size="small" onClick={() => updateReorderQuantity(item.id, -1)}>
                                                            <Remove fontSize="small" />
                                                        </IconButton>
                                                        <Typography>{getReorderQuantity(item.id)}</Typography>
                                                        <IconButton size="small" onClick={() => updateReorderQuantity(item.id, 1)}>
                                                            <Add fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<ShoppingCart fontSize="small" />}
                                                        onClick={() => addToCart(item, item.customizations, getReorderQuantity(item.id))}
                                                    >
                                                        افزودن به سبد
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Paper>

                        <Paper sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Tune color="primary" />
                                    <Typography variant="h6">نوشیدنی سفارشی شما</Typography>
                                </Box>
                                <Typography variant="h6" color="primary">
                                    {formatCurrency(savedCustomDrink.basePrice)}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {savedCustomDrink.description}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                {savedCustomDrink.ingredients.map((ingredient) => (
                                    <Chip
                                        key={ingredient.label}
                                        label={ingredient.label}
                                        variant="outlined"
                                        sx={{ borderRadius: 1 }}
                                    />
                                ))}
                            </Stack>
                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <IconButton size="small" onClick={() => updateCustomDrinkQuantity(-1)}>
                                        <Remove fontSize="small" />
                                    </IconButton>
                                    <Typography>{customDrinkQuantity}</Typography>
                                    <IconButton size="small" onClick={() => updateCustomDrinkQuantity(1)}>
                                        <Add fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={() => addToCart(
                                        savedCustomDrink,
                                        { ingredients: savedCustomDrink.ingredients.map((item) => item.label) },
                                        customDrinkQuantity
                                    )}
                                >
                                    افزودن به سبد
                                </Button>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, position: { md: 'sticky' }, top: { md: 20 } }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <ShoppingCart sx={{ ml: 1 }} />
                            <Typography variant="h6">سبد خرید</Typography>
                        </Box>

                        {cart.length === 0 ? (
                            <Typography color="text.secondary" align="center">
                                سبد خرید شما خالی است
                            </Typography>
                        ) : (
                            <>
                                <List>
                                    {cart.map((item) => (
                                        <ListItem key={item.id} divider alignItems="flex-start">
                                            <ListItemText
                                                primary={item.name}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {formatCurrency(item.basePrice)} برای هر واحد
                                                        </Typography>
                                                        {getCustomizationSummary(item.customizations) && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {getCustomizationSummary(item.customizations)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        <Remove fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="body2">
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Add fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>

                                <Divider sx={{ my: 2 }} />

                                <Box display="flex" gap={1} mb={2}>
                                    <TextField
                                        size="small"
                                        placeholder="کد تخفیف"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        fullWidth
                                    />
                                    <Button variant="outlined" size="small">
                                        اعمال
                                    </Button>
                                </Box>

                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography>جمع جزء:</Typography>
                                    <Typography>{formatCurrency(getTotalPrice())}</Typography>
                                </Box>
                                {applyDiscount() > 0 && (
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography color="success.main">تخفیف:</Typography>
                                        <Typography color="success.main">
                                            -{formatCurrency(applyDiscount())}
                                        </Typography>
                                    </Box>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <Typography variant="h6">جمع کل:</Typography>
                                    <Typography variant="h6">{formatCurrency(finalTotal)}</Typography>
                                </Box>

                                <Button variant="contained" fullWidth size="large">
                                    ثبت سفارش
                                </Button>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MenuOrdering;
