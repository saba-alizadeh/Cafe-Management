import React, { useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    Avatar,
    Rating,
    Paper,
    AppBar,
    Toolbar,
    Badge
} from '@mui/material';
import {
    Search,
    ShoppingCart,
    Favorite,
    Home,
    Menu,
    ArrowBack,
    ArrowForward,
    LocationOn,
    Phone,
    Email,
    Star,
    LocalOffer,
    Restaurant,
    DeliveryDining,
    TakeoutDining,
    EventSeat
} from '@mui/icons-material';
import menuImage1 from '../assets/MenuPics/1.png';
import menuImage2 from '../assets/MenuPics/2.png';
import menuImage3 from '../assets/MenuPics/3.png';
import menuImage4 from '../assets/MenuPics/4.png';
import ShoppingCartDrawer from './ShoppingCart/ShoppingCartDrawer';

const HomePage = () => {
    const [cartItems, setCartItems] = useState(3);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);

    // Food categories
    const categories = [
        { name: 'Kebab', icon: '🍢', active: false },
        { name: 'Coffee', icon: '☕', active: false },
        { name: 'Appetizer', icon: '🥗', active: false },
        { name: 'Drinks', icon: '🥤', active: false },
        { name: 'Ice Cream', icon: '🍦', active: false },
        { name: 'Iranian', icon: '🍽️', active: false },
        { name: 'Fries', icon: '🍟', active: false },
        { name: 'Chicken', icon: '🍗', active: false },
        { name: 'Pizza', icon: '🍕', active: true },
        { name: 'Soda', icon: '🥤', active: false },
        { name: 'Sandwich', icon: '🥪', active: false }
    ];

    // Menu items (burgers/sandwiches)
    const menuItems = [
        {
            id: 1,
            name: 'Steak Burger',
            description: 'This burger is prepared using fresh beef and steak preparation method',
            price: 145000,
            originalPrice: 180000,
            discount: 19,
            image: menuImage1,
            favorite: false
        },
        {
            id: 2,
            name: 'Meat & Cheese Burger',
            description: 'This burger is prepared using fresh beef and steak preparation method',
            price: 176000,
            originalPrice: 180000,
            discount: 2,
            image: menuImage2,
            favorite: false
        },
        {
            id: 3,
            name: 'Meat & Mushroom Burger',
            description: 'This burger is prepared using fresh beef and steak preparation method',
            price: 165000,
            originalPrice: 180000,
            discount: 8,
            image: menuImage3,
            favorite: false
        },
        {
            id: 4,
            name: 'Special Burger',
            description: 'This burger is prepared using fresh beef and steak preparation method',
            price: 180000,
            originalPrice: 180000,
            discount: 0,
            image: menuImage4,
            favorite: false
        }
    ];

    // Special discounts
    const specialItems = [
        {
            id: 1,
            name: 'Mixed Pizza',
            price: 199000,
            image: '/api/placeholder/200/150'
        },
        {
            id: 2,
            name: 'Roast Beef Pizza',
            price: 259000,
            discount: 8,
            image: '/api/placeholder/200/150'
        },
        {
            id: 3,
            name: 'Stuffed Chicken',
            price: 299000,
            discount: 5,
            image: '/api/placeholder/200/150'
        },
        {
            id: 4,
            name: 'Chelo Kebab',
            price: 360000,
            image: '/api/placeholder/200/150'
        },
        {
            id: 5,
            name: 'Shami Kebab & Vegetables',
            price: 360000,
            image: '/api/placeholder/200/150'
        }
    ];

    // Chef recommendations
    const chefRecommendations = [
        {
            id: 1,
            name: 'Shami Kebab & Vegetables',
            description: 'This dish is prepared with fresh lamb meat and grilled, served with rice. Each...',
            price: 360000,
            image: '/api/placeholder/250/180'
        },
        {
            id: 2,
            name: 'Chelo Shami Kebab',
            description: 'This dish is prepared with fresh lamb meat and grilled, served with rice. Each...',
            price: 360000,
            image: '/api/placeholder/250/180'
        },
        {
            id: 3,
            name: 'Potato & Chicken Platter',
            description: 'This platter includes fried potatoes and fresh chicken pieces. Each serving of this...',
            price: 360000,
            image: '/api/placeholder/250/180'
        },
        {
            id: 4,
            name: 'Stuffed Chicken',
            description: 'This product is prepared from fresh chicken of superior quality and after frying in hot oil...',
            price: 285000,
            image: '/api/placeholder/250/180'
        }
    ];

    // Services
    const services = [
        {
            icon: <Restaurant />,
            title: 'Online Reservation',
            description: 'Order online in Toranj and receive it in the fastest time'
        },
        {
            icon: <DeliveryDining />,
            title: 'Delivery Services',
            description: 'Receive your order in the fastest time and with the best packaging'
        },
        {
            icon: <TakeoutDining />,
            title: 'Takeaway Services',
            description: 'You can register your order as takeaway in the Toranj application'
        },
        {
            icon: <EventSeat />,
            title: 'Catering Services',
            description: 'You can register your order very quickly and use the restaurant catering services'
        }
    ];

    // Customer reviews
    const reviews = [
        {
            name: 'Sara Ahmadi',
            avatar: '/api/placeholder/60/60',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
        },
        {
            name: 'Mahmoud Elahi',
            avatar: '/api/placeholder/60/60',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
        },
        {
            name: 'Bita Mohammadi',
            avatar: '/api/placeholder/60/60',
            comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.'
        }
    ];

    // Branches
    const branches = [
        {
            name: 'Esfahan Branch',
            phone: '09123456789 | 09123456789',
            address: 'Iran, Esfahan, Imam Square',
            image: '/api/placeholder/300/200'
        },
        {
            name: 'Tehran Branch',
            phone: '09123456789 | 09123456789',
            address: 'Iran, Tehran, Milad Tower',
            image: '/api/placeholder/300/200'
        },
        {
            name: 'Shiraz Branch',
            phone: '09123456789 | 09123456789',
            address: 'Iran, Shiraz, Persepolis',
            image: '/api/placeholder/300/200',
            active: true
        },
        {
            name: 'Mashhad Branch',
            phone: '09123456789 | 09123456789',
            address: 'Iran, Mashhad, Imam Reza Holy Shrine',
            image: '/api/placeholder/300/200'
        }
    ];

    const scrollRef = useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };


    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            {/* Header */}
            <AppBar position="fixed" sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 'none', direction: 'rtl' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'right', flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                            Cafe
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mr: 'auto', direction: 'rtl', marginRight: '30px', '& .MuiButton-startIcon': { marginLeft: '5px', marginRight: 0, } }}>
                            <Button startIcon={<Home />} sx={{ color: 'var(--color-primary)' }}>Home</Button>
                            <Button startIcon={<Menu />} sx={{ color: 'var(--color-primary)' }}>Orders</Button>
                            <Button startIcon={<Favorite />} sx={{ color: 'var(--color-primary)' }}>Favorites</Button>
                            <Badge badgeContent={cart.length} color="error">
                                <Button startIcon={<ShoppingCart />} sx={{ color: 'var(--color-primary)' }} onClick={() => setCartDrawerOpen(true)}>سبد خرید</Button>
                            </Badge>
                        </Box>
                    </Box>
                    <IconButton sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
                        <Search />
                    </IconButton>
                    <Box sx={{ display: 'flex', gap: 1, marginRight: '7px' }}>
                        <Button variant="contained" sx={{ bgcolor: 'var(--color-primary)' }}>Login | Register</Button>

                    </Box>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, var(--color-accent-soft) 0%, var(--color-accent) 100%)',
                color: 'var(--color-secondary)',
                py: 6,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Delicious and Memorable Food Experience
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{ bgcolor: 'var(--color-primary)', px: 4, py: 2 }}
                            >
                                Restaurant Information
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: 'center' }}>
                                <img
                                    src="src/assets/HeaderPics/CoffeeBeans.png"
                                    alt="Coffee Beans"
                                    style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>


            {/* Categories Navigation */}
            <Box sx={{ position: 'relative', py: 2, px: 2, mt: '50px', mb: '0px' }}>
                <Container>

                    {/* BackWard */}
                    <IconButton
                        onClick={scrollLeft}
                        sx={{
                            position: 'absolute',
                            left: 150,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            boxShadow: 2,
                            zIndex: 2,
                            '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' },
                        }}
                    >
                        <ArrowBack />
                    </IconButton>

                    {/* ForWard */}
                    <IconButton
                        onClick={scrollRight}
                        sx={{
                            position: 'absolute',
                            right: 150,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            boxShadow: 2,
                            zIndex: 2,
                            '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' },
                        }}
                    >
                        <ArrowForward />
                    </IconButton>


                    {/* Categories Navigation */}
                    <Box
                        ref={scrollRef}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            overflowX: 'auto',
                            pb: 1,
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                            marginRight: '10px',
                            marginLeft: '10px',
                            marginTop: '10px',
                            marginBottom: '10px',
                            borderRadius: '10px',

                            transition: 'all 0.3s ease',
                        }}
                    >
                        {categories.map((category, index) => (
                            <Card
                                key={index}
                                sx={{
                                    minWidth: 120,
                                    cursor: 'pointer',
                                    bgcolor: 'var(--color-secondary)',
                                    color: 'var(--color-primary)',
                                    border: '1px solid var(--color-accent-soft)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        bgcolor: 'var(--color-primary)',
                                        color: 'var(--color-secondary)',
                                        transition: 'all 0.3s ease',
                                    },
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="h4" sx={{ mb: 1 }}>
                                        {category.icon}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {category.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Menu Section */}
            <Container sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Sandwich
                    </Typography>
                    <Box sx={{
                        width: '100%',
                        height: '2px',
                        bgcolor: 'var(--color-accent-soft)',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '200px',
                            height: '2px',
                            bgcolor: 'var(--color-primary)',
                            borderStyle: 'dashed',
                            borderColor: 'var(--color-primary)'
                        }
                    }} />
                </Box>

                <Grid container spacing={3} justifyContent="center">
                    {menuItems.map((item) => (
                        <Grid item xs={12} sm={6} key={item.id}>
                            <Card
                                sx={{
                                    position: 'relative',
                                    height: 420, // ارتفاع ثابت کارت
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                                }}
                            >
                                <Box sx={{ position: 'relative' }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderTopLeftRadius: 8,
                                            borderTopRightRadius: 8,
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            {item.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2, 
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {item.description}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            {item.discount > 0 && (
                                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                                    {item.originalPrice.toLocaleString()} تومان
                                                </Typography>
                                            )}
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                                {item.price.toLocaleString()} تومان
                                            </Typography>
                                        </Box>
                                        <IconButton sx={{ bgcolor: 'var(--color-accent-soft)', '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' } }}>+</IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Container>

            {/* Special Discounts */}
            <Box sx={{ bgcolor: 'var(--color-primary)', py: 4 }}>
                <Container>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 'bold', color: 'var(--color-secondary)', mb: 2 }}
                        >
                            Special Discounts
                        </Typography>
                    </Box>

                    {/* گرید دو ستونه که همیشه ارتفاع مساوی داره */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr', // موبایل
                                sm: 'repeat(2, 1fr)' // از تبلت به بالا دو ستون
                            },
                            gap: 3,
                            alignItems: 'stretch' // 👈 کارت‌ها هم‌ارتفاع میشن
                        }}
                    >
                        {specialItems.slice(0, 4).map((item) => (
                            <Card
                                key={item.id}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    color: 'var(--color-secondary)',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%', // 👈 کارت ارتفاع کامل می‌گیره
                                    boxShadow: 2,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                }}
                            >
                                {/* تصویر */}
                                <Box sx={{ width: '100%', height: 140 }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </Box>

                                {/* محتوا */}
                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {item.name}
                                    </Typography>

                                    {item.discount && (
                                        <Chip
                                            label={`${item.discount}%`}
                                            sx={{
                                                bgcolor: 'var(--color-accent)',
                                                color: 'var(--color-secondary)',
                                                my: 1
                                            }}
                                        />
                                    )}


                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 'bold',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {item.price.toLocaleString()} تومان
                                    </Typography>
                                </Box>

                                {/* دکمه پایین */}
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'var(--color-primary)',
                                        color: 'var(--color-secondary)',
                                        borderRadius: 0,
                                        '&:hover': { bgcolor: 'var(--color-primary)' }
                                    }}
                                >
                                    Order
                                </Button>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>


            {/* Chef Recommendations */}
            <Container sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Chef's Recommendation
                    </Typography>
                    <Box sx={{
                        width: '100%',
                        height: '2px',
                        bgcolor: 'var(--color-accent-soft)',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '200px',
                            height: '2px',
                            bgcolor: 'var(--color-primary)',
                            borderStyle: 'dashed',
                            borderColor: 'var(--color-primary)'
                        }
                    }} />
                </Box>

                {/* Grid اصلی */}
                <Grid container spacing={3}>
                    {chefRecommendations.slice(0, 4).map((item) => (
                        <Grid item xs={12} sm={6} key={item.id}>
                            <Card sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: 360,  // ارتفاع ثابت
                                borderRadius: 2,
                                overflow: 'hidden',
                                transition: '0.3s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                            }}>
                                <Box sx={{ height: 180, overflow: 'hidden' }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>

                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }} noWrap>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,  // حداکثر ۳ خط توضیحات
                                                WebkitBoxOrient: 'vertical',
                                                textOverflow: 'ellipsis'
                                            }}>
                                            {item.description}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                            {item.price.toLocaleString()} تومان
                                        </Typography>
                                        <Button variant="outlined" sx={{
                                            borderColor: 'var(--color-primary)',
                                            color: 'var(--color-primary)',
                                            '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' }
                                        }}>
                                            Add to Cart
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="contained" sx={{
                        bgcolor: 'var(--color-primary)',
                        color: 'var(--color-secondary)',
                        px: 4,
                        '&:hover': { bgcolor: 'var(--color-primary)' }
                    }}>
                        View All ←
                    </Button>
                </Box>
            </Container>

            {/* Services Section */}
            <Container sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Our Services
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {services.map((service, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    border: '2px dashed var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2
                                }}>
                                    <Box sx={{ color: 'var(--color-primary)', fontSize: '2rem' }}>
                                        {service.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {service.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {service.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Customer Reviews */}
            <Container sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Customer Reviews
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {reviews.map((review, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ p: 3, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar src={review.avatar} sx={{ mr: 2 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {review.name}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    position: 'relative',
                                    '&::before': {
                                        content: '"',
                                        fontSize: '3rem',
                                        color: 'var(--color-accent-soft)',
                                        position: 'absolute',
                                        top: -10,
                                        left: -10
                                    },
                                    '&::after': {
                                        content: '"',
                                        fontSize: '3rem',
                                        color: 'var(--color-accent-soft)',
                                        position: 'absolute',
                                        bottom: -20,
                                        right: -10
                                    }
                                }}>
                                    {review.comment}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Branches */}
            <Container sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Toranj Branches
                    </Typography>
                </Box>

                <Box sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                        {branches.map((branch, index) => (
                            <Card
                                key={index}
                                sx={{
                                    minWidth: 300,
                                    position: 'relative',
                                    '&:hover .more-info-button': {
                                        opacity: 1,
                                        visibility: 'visible'
                                    }
                                }}
                                onMouseEnter={() => setHoveredCard(index)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <img
                                    src={branch.image}
                                    alt={branch.name}
                                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                />
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                        {branch.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {branch.phone}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {branch.address}
                                    </Typography>
                                    <Button
                                        className="more-info-button"
                                        variant="contained"
                                        sx={{
                                            bgcolor: 'var(--color-primary)',
                                            color: 'var(--color-secondary)',
                                            opacity: hoveredCard === index ? 1 : 0,
                                            visibility: hoveredCard === index ? 'visible' : 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { bgcolor: 'var(--color-primary)' }
                                        }}
                                    >
                                        More Information
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <IconButton
                        sx={{
                            position: 'absolute',
                            left: -20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            boxShadow: 2
                        }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <IconButton
                        sx={{
                            position: 'absolute',
                            right: -20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'var(--color-secondary)',
                            color: 'var(--color-primary)',
                            boxShadow: 2
                        }}
                    >
                        <ArrowForward />
                    </IconButton>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--color-accent-soft)' }} />
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--color-primary)' }} />
                    </Box>
                </Box>
            </Container>

            {/* Contact Section */}
            <Box sx={{ bgcolor: 'var(--color-secondary)', py: 4 }}>
                <Container>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                                Contact Us
                            </Typography>
                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Full Name"
                                    placeholder="John Doe"
                                    variant="outlined"
                                    fullWidth
                                />
                                <TextField
                                    label="Phone Number"
                                    placeholder="0912 ..."
                                    variant="outlined"
                                    fullWidth
                                />
                                <TextField
                                    label="Request Subject"
                                    placeholder="Feedback"
                                    variant="outlined"
                                    fullWidth
                                    select
                                />
                                <TextField
                                    label="Message Subject"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'var(--color-primary)',
                                        color: 'var(--color-secondary)',
                                        alignSelf: 'flex-start',
                                        px: 4
                                    }}
                                >
                                    Send Message
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                                <Box sx={{
                                    bgcolor: 'var(--color-accent-soft)',
                                    height: '200px',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
                                        توسعه دهنده گرامی، کلید<br />
                                        دسترسی معتبر نیست. لطفا<br />
                                        با پشتیبانی مپ تماس<br />
                                        بگیرید.<br />
                                        اطلاعات بیشتر در:<br />
                                        map.ir/unauthorized
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'var(--color-accent-soft)',
                                    height: '200px',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography variant="body2" color="text.secondary">
                                        محتوای اضافی
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Social Media Links */}
            <Container sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Ways to Connect with Toranj
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {[
                        { name: 'On Telegram', icon: '📱', color: 'var(--color-accent)' },
                        { name: 'On Instagram', icon: '📷', color: 'var(--color-accent)' },
                        { name: 'On X', icon: '🐦', color: 'var(--color-accent)' },
                        { name: 'On WhatsApp', icon: '💬', color: 'var(--color-accent)' }
                    ].map((social, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{
                                cursor: 'pointer',
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                            }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Box sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        bgcolor: social.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2
                                    }}>
                                        <Typography variant="h4">{social.icon}</Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        {social.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Follow Toranj
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Shopping Cart Drawer */}
            <ShoppingCartDrawer
                open={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
                cartItems={cart}
                onUpdateQuantity={(itemId, newQuantity) => {
                    if (newQuantity <= 0) {
                        setCart(cart.filter(item => item.id !== itemId));
                    } else {
                        setCart(cart.map(item =>
                            item.id === itemId
                                ? { ...item, quantity: newQuantity }
                                : item
                        ));
                    }
                }}
                onRemoveItem={(itemId) => {
                    setCart(cart.filter(item => item.id !== itemId));
                }}
                onCheckout={() => {
                    alert('سفارش شما با موفقیت ثبت شد.');
                    setCart([]);
                }}
            />
        </Box>
    );
};

export default HomePage;


