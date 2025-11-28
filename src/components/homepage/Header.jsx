import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Badge } from '@mui/material';
import { Search, ShoppingCart, Favorite, Home, Menu } from '@mui/icons-material';

const Header = ({ cartItems }) => {
    return (
        <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none', direction: 'rtl' }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'right', flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                        Cafe
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, mr: 'auto', direction: 'rtl', marginRight: '30px', '& .MuiButton-startIcon': { marginLeft: '5px', marginRight: 0 } }}>
                        <Button startIcon={<Home />} sx={{ color: 'black' }}>Home</Button>
                        <Button startIcon={<Menu />} sx={{ color: 'black' }}>Orders</Button>
                        <Button startIcon={<Favorite />} sx={{ color: 'black' }}>Favorites</Button>
                        <Badge badgeContent={cartItems} color="error">
                            <Button startIcon={<ShoppingCart />} sx={{ color: 'black' }}>Cart</Button>
                        </Badge>
                    </Box>
                </Box>
                <IconButton sx={{ bgcolor: '#8B1717', color: 'white' }}>
                    <Search />
                </IconButton>
                <Box sx={{ display: 'flex', gap: 1, marginRight: '7px' }}>
                    <Button variant="contained" sx={{ bgcolor: '#A81C1C' }}>Login | Register</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;


