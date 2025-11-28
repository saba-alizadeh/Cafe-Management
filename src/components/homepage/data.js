import menuImage1 from '../../assets/MenuPics/1.png';
import menuImage2 from '../../assets/MenuPics/2.png';
import menuImage3 from '../../assets/MenuPics/3.png';
import menuImage4 from '../../assets/MenuPics/4.png';

export const categories = [
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

export const menuItems = [
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

export const specialItems = [
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

export const chefRecommendations = [
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

export const services = [
    {
        icon: 'Restaurant',
        title: 'Online Reservation',
        description: 'Order online in Toranj and receive it in the fastest time'
    },
    {
        icon: 'Delivery',
        title: 'Delivery Services',
        description: 'Receive your order in the fastest time and with the best packaging'
    },
    {
        icon: 'Takeout',
        title: 'Takeaway Services',
        description: 'You can register your order as takeaway in the Toranj application'
    },
    {
        icon: 'Catering',
        title: 'Catering Services',
        description: 'You can register your order very quickly and use the restaurant catering services'
    }
];

export const reviews = [
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

export const branches = [
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


