import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useCart } from '../../../context/CartContext';
import ShoppingCartDrawer from '../../../components/ShoppingCart/ShoppingCartDrawer';

const ShoppingCartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const [drawerOpen, setDrawerOpen] = React.useState(true);

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                    سبد خرید
                </Typography>
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
                    onCheckout={() => {
                        alert('سفارش شما با موفقیت ثبت شد.');
                        clearCart();
                    }}
                />
            </Container>
        </Box>
    );
};

export default ShoppingCartPage;

