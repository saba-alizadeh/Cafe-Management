import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Typography, Button, IconButton } from '@mui/material';
import { Search, Favorite, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const HeaderBar = () => {
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const requireAuthAndGoProfile = () => {
        if (user) {
            navigate('/customer/profile');
        } else {
            setAuthDialogOpen(true);
        }
    };


    const handleFavoritesClick = () => {
        if (user) {
            navigate('/customer/reviews');
        } else {
            setAuthDialogOpen(true);
        }
    };

    return (
        <>
            <AppBar position="fixed" sx={{ bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 'none', direction: 'rtl' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'right', flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                            کافه
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mr: 'auto', direction: 'rtl', marginRight: '30px', '& .MuiButton-startIcon': { marginLeft: '5px', marginRight: 0, } }}>
                            <Button startIcon={<Home />} sx={{ color: 'var(--color-primary)' }} onClick={() => navigate('/')}>خانه</Button>
                            <Button startIcon={<Favorite />} sx={{ color: 'var(--color-primary)' }} onClick={handleFavoritesClick}>مورد علاقه ها</Button>
                        </Box>
                    </Box>
                    <IconButton sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
                        <Search />
                    </IconButton>
                    <Box sx={{ display: 'flex', gap: 1, marginRight: '7px' }}>
                        <Button
                            variant="outlined"
                            sx={{
                                color: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
                                '&:hover': { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }
                            }}
                            onClick={() => navigate('/admin-login')}
                        >
                            ورود مدیر / ادمین
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ bgcolor: 'var(--color-primary)' }}
                            onClick={requireAuthAndGoProfile}
                        >
                            ورود | ثبت نام
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onAuthenticated={(user) => {
                    setAuthDialogOpen(false);
                    // Redirect regular users (customers) to /customer
                    if (user && user.role === 'customer') {
                        navigate('/customer');
                    }
                }}
            />
        </>
    );
};

export default HeaderBar;


