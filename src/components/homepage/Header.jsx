import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Badge } from '@mui/material';
import { Search, ShoppingCart, Favorite, Home, Menu } from '@mui/icons-material';

const Header = ({ cartItems }) => {
    return (
        <AppBar position="fixed" sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 'none', direction: 'rtl' }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'right', flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Cafe
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mr: 'auto', direction: 'rtl', marginRight: '30px', '& .MuiButton-startIcon': { marginLeft: '5px', marginRight: 0 } }}>
                        <Button startIcon={<Home />} sx={{ color: 'var(--color-primary)' }}>Home</Button>
                        <Button startIcon={<Menu />} sx={{ color: 'var(--color-primary)' }}>Orders</Button>
                        <Button startIcon={<Favorite />} sx={{ color: 'var(--color-primary)' }}>Favorites</Button>
                        <Badge badgeContent={cartItems} color="error">
                            <Button startIcon={<ShoppingCart />} sx={{ color: 'var(--color-primary)' }}>Cart</Button>
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
    );
};

export default Header;


