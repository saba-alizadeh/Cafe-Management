import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error loading cart from localStorage:', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart
            const existingItem = prevItems.find(i => i.id === item.id && i.type === item.type);
            if (existingItem) {
                // Update quantity if item exists
                return prevItems.map(i =>
                    i.id === item.id && i.type === item.type
                        ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                        : i
                );
            } else {
                // Add new item
                return [...prevItems, { ...item, quantity: item.quantity || 1 }];
            }
        });
    };

    const updateQuantity = (itemId, itemType, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId, itemType);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId && item.type === itemType
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        }
    };

    const removeFromCart = (itemId, itemType) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item.id === itemId && item.type === itemType))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                getTotalItems,
                getTotalPrice
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

