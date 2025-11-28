import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';

const HeroSection = () => {
    return (
        <Box sx={{
            background: 'linear-gradient(135deg, var(--color-accent-soft) 0%, var(--color-accent) 100%)',
            color: 'var(--color-secondary)',
            py: 8,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Container>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2, marginTop: '100px' }}>
                            Delicious and Memorable Food Experience
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{ bgcolor: 'var(--color-primary)', px: 4, py: 2 }}
                        >
                            Restaurant Information
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img
                                src="src/assets/HeaderPics/CoffeeBeans.png"
                                alt="Coffee Beans"
                                style={{ maxWidth: '500px', height: 'auto' }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HeroSection;


