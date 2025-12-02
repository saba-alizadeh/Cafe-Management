import React, { useState } from 'react';
import { Container, Box, Typography, IconButton, Card, CardContent, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const chefRecommendations = [
    { id: 1, name: 'Shami Kebab & Vegetables', description: 'This dish is prepared with fresh lamb meat and grilled, served with rice. Each...', price: 360000, image: '/api/placeholder/250/180' },
    { id: 2, name: 'Chelo Shami Kebab', description: 'This dish is prepared with fresh lamb meat and grilled, served with rice. Each...', price: 360000, image: '/api/placeholder/250/180' },
    { id: 3, name: 'Potato & Chicken Platter', description: 'This platter includes fried potatoes and fresh chicken pieces. Each serving of this...', price: 360000, image: '/api/placeholder/250/180' },
    { id: 4, name: 'Stuffed Chicken', description: 'This product is prepared from fresh chicken of superior quality and after frying in hot oil...', price: 285000, image: '/api/placeholder/250/180' },
];

const ChefRecommendations = () => {
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAddToCartClick = () => {
        if (user) {
            navigate('/customer/profile');
        } else {
            setAuthDialogOpen(true);
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Chef's Recommendation</Typography>
                <Box sx={{ width: '100%', height: '2px', bgcolor: 'var(--color-accent-soft)', position: 'relative', '&::before': { content: '""', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '2px', bgcolor: 'var(--color-primary)', borderStyle: 'dashed', borderColor: 'var(--color-primary)' } }} />
            </Box>
            <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {chefRecommendations.map((item) => (
                        <Card key={item.id} sx={{ minWidth: 280 }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{item.description}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{item.price.toLocaleString()} تومان</Typography>
                                    <Button
                                        variant="outlined"
                                        sx={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' } }}
                                        onClick={handleAddToCartClick}
                                    >
                                        Add to Cart
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                <IconButton sx={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 2 }}>
                    <ArrowBack />
                </IconButton>
                <IconButton sx={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 2 }}>
                    <ArrowForward />
                </IconButton>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button variant="contained" sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)', px: 4, '&:hover': { bgcolor: 'var(--color-primary)' } }}>View All ←</Button>
            </Box>
            <PhoneAuthDialog
                open={authDialogOpen}
                onClose={() => setAuthDialogOpen(false)}
                onAuthenticated={() => {
                    setAuthDialogOpen(false);
                    navigate('/customer/profile');
                }}
            />
        </Container>
    );
};

export default ChefRecommendations;


