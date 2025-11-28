import React from 'react';
import { Container, Box, Typography, Grid, Card } from '@mui/material';
import { Restaurant, DeliveryDining, TakeoutDining, EventSeat } from '@mui/icons-material';

const services = [
  { icon: <Restaurant />, title: 'رزرو آنلاین', description: 'سفارش خود را به صورت آنلاین ثبت کنید و در سریع‌ترین زمان تحویل بگیرید' },
  { icon: <DeliveryDining />, title: 'خدمات ارسال', description: 'سفارش خود را با بهترین بسته‌بندی و در سریع‌ترین زمان دریافت کنید' },
  { icon: <TakeoutDining />, title: 'بیرون‌بر', description: 'می‌توانید سفارش خود را به صورت بیرون‌بر ثبت و تحویل بگیرید' },
  { icon: <EventSeat />, title: 'سرو در محل', description: 'سفارش خود را در محیط دنج و آرام کافه نوش‌جان کنید' },
];

const ServicesSection = () => {
  return (
    <Box
      sx={{
        py: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            خدمات ما
          </Typography>
        </Box>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 4,
                  height: '100%',
                  minHeight: 250,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '2px dashed #A81C1C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Box sx={{ color: '#A81C1C', fontSize: '2rem' }}>
                    {service.icon}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 220 }}
                >
                  {service.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ServicesSection;
