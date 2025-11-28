import React, { useState } from 'react';
import { Container, Box, Typography, IconButton, Card, CardContent, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const branches = [
    { name: 'Esfahan Branch', phone: '09123456789 | 09123456789', address: 'Iran, Esfahan, Imam Square', image: '/api/placeholder/300/200' },
    { name: 'Tehran Branch', phone: '09123456789 | 09123456789', address: 'Iran, Tehran, Milad Tower', image: '/api/placeholder/300/200' },
    { name: 'Shiraz Branch', phone: '09123456789 | 09123456789', address: 'Iran, Shiraz, Persepolis', image: '/api/placeholder/300/200', active: true },
    { name: 'Mashhad Branch', phone: '09123456789 | 09123456789', address: 'Iran, Mashhad, Imam Reza Holy Shrine', image: '/api/placeholder/300/200' },
];

const BranchesSection = () => {
    const [hoveredCard, setHoveredCard] = useState(null);
    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Toranj Branches</Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {branches.map((branch, index) => (
                        <Card key={index} sx={{ minWidth: 300, position: 'relative', '&:hover .more-info-button': { opacity: 1, visibility: 'visible' } }} onMouseEnter={() => setHoveredCard(index)} onMouseLeave={() => setHoveredCard(null)}>
                            <img src={branch.image} alt={branch.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{branch.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{branch.phone}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{branch.address}</Typography>
                                <Button className="more-info-button" variant="contained" sx={{ bgcolor: 'var(--color-primary)', color: 'var(--color-secondary)', opacity: hoveredCard === index ? 1 : 0, visibility: hoveredCard === index ? 'visible' : 'hidden', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'var(--color-primary)' } }}>
                                    More Information
                                </Button>
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
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--color-accent-soft)' }} />
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--color-primary)' }} />
                </Box>
            </Box>
        </Container>
    );
};

export default BranchesSection;


