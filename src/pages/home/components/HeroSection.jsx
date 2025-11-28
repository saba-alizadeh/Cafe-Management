import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';

const HeroSection = () => {
    return (
        <Box
            sx={{
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-primary)',
                py: 8,
                position: 'relative',
                overflow: 'hidden',
                direction: 'rtl',
            }}
        >
            <Container maxWidth="lg">
                <Grid
                    container
                    spacing={4}
                    alignItems="center"
                    justifyContent="space-between"
                    direction={{ xs: 'column-reverse', md: 'row-reverse' }}
                >

                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end', 
                                alignItems: 'center',
                            }}
                        >
                            <img
                                src="src/assets/HeaderPics/CoffeeBeans.png"
                                alt="Coffee Beans"
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    height: 'auto',
                                    marginRight: '40px', 
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Box
                            sx={{
                                textAlign: 'right', 
                                pl: { md: 8 },
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 2,
                                    color: 'var(--color-primary)',
                                }}
                            >
                                یه فنجون قهوه، یه بهونه برای موندن.
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    opacity: 0.8,
                                }}
                            >
                                جایی برای لحظه‌هایی که فقط مال توئه.
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    bgcolor: 'var(--color-primary)',
                                    px: 4,
                                    py: 2,
                                    borderRadius: '12px',
                                    '&:hover': { bgcolor: 'var(--color-primary)' },
                                }}
                            >
                                اطلاعات کافه
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HeroSection;
