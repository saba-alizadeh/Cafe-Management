import React, { useRef } from 'react';
import { Box, Container, Card, CardContent, Typography, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const categories = [
    { name: 'قهوه', icon: '☕', active: false },
    { name: 'چای', icon: '🫖', active: false },
    { name: 'نوشیدنی سرد', icon: '🧋', active: false },
    { name: 'نوشیدنی گرم', icon: '🍵', active: false },
    { name: 'کیک', icon: '🍰', active: false },
    { name: 'صبحانه', icon: '🥞', active: false },
    { name: 'ساندویچ', icon: '🥪', active: false },
    { name: 'شیک و بستنی', icon: '🍨', active: false },
    { name: 'نوشیدنی گازدار', icon: '🥤', active: true },
    { name: 'آبمیوه ها', icon: '🍹', active: false },
   
];

const CategoriesNavigation = () => {
    const scrollRef = useRef(null);
    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

    return (
        <Box sx={{ position: 'relative', py: 2, px: 2, mt: '50px', mb: '0px' }}>
            <Container>
                <IconButton onClick={scrollLeft} sx={{ position: 'absolute', left: 150, top: '50%', transform: 'translateY(-50%)', bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 2, zIndex: 2, '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' }, }}>
                    <ArrowBack />
                </IconButton>
                <IconButton onClick={scrollRight} sx={{ position: 'absolute', right: 150, top: '50%', transform: 'translateY(-50%)', bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', boxShadow: 2, zIndex: 2, '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)' }, }}>
                    <ArrowForward />
                </IconButton>
                <Box ref={scrollRef} sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, marginRight: '10px', marginLeft: '10px', marginTop: '10px', marginBottom: '10px', borderRadius: '10px', transition: 'all 0.3s ease', }}>
                    {categories.map((category, index) => (
                        <Card key={index} sx={{ minWidth: 120, cursor: 'pointer', bgcolor: 'var(--color-secondary)', color: 'var(--color-primary)', border: '1px solid var(--color-accent-soft)', '&:hover': { transform: 'translateY(-2px)', bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)', transition: 'all 0.3s ease', }, }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h4" sx={{ mb: 1 }}>{category.icon}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{category.name}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default CategoriesNavigation;


