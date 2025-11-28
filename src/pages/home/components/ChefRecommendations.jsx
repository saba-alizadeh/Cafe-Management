import React from 'react';
import { Container, Box, Typography, IconButton, Card, CardContent, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const chefRecommendations = [
    { id: 1, name: 'Shami Kebab & Vegetables', description: 'This dish is prepared with fresh lamb meat and grilled, served with rice. Each...', price: 360000, image: '/api/placeholder/250/180' },
    { id: 2, name: 'Chelo Shami Kebab', description: 'This dish is prepared with fresh lamb meat and grilled, served with rice. Each...', price: 360000, image: '/api/placeholder/250/180' },
    { id: 3, name: 'Potato & Chicken Platter', description: 'This platter includes fried potatoes and fresh chicken pieces. Each serving of this...', price: 360000, image: '/api/placeholder/250/180' },
    { id: 4, name: 'Stuffed Chicken', description: 'This product is prepared from fresh chicken of superior quality and after frying in hot oil...', price: 285000, image: '/api/placeholder/250/180' },
];

const ChefRecommendations = () => {
    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Chef's Recommendation</Typography>
                <Box sx={{ width: '100%', height: '2px', bgcolor: '#e0e0e0', position: 'relative', '&::before': { content: '""', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '2px', bgcolor: '#A81C1C', borderStyle: 'dashed', borderColor: '#A81C1C' } }} />
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
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#A81C1C' }}>{item.price.toLocaleString()} تومان</Typography>
                                    <Button variant="outlined" sx={{ borderColor: '#A81C1C', color: '#A81C1C', '&:hover': { bgcolor: '#A81C1C', color: 'white' } }}>Add to Cart</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                <IconButton sx={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', bgcolor: 'white', color: 'black', boxShadow: 2 }}>
                    <ArrowBack />
                </IconButton>
                <IconButton sx={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', bgcolor: 'white', color: 'black', boxShadow: 2 }}>
                    <ArrowForward />
                </IconButton>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button variant="contained" sx={{ bgcolor: '#A81C1C', color: 'white', px: 4, '&:hover': { bgcolor: '#8B1717' } }}>View All ←</Button>
            </Box>
        </Container>
    );
};

export default ChefRecommendations;


