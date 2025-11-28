import React from 'react';
import { Container, Box, Typography, Grid, Card, CardContent } from '@mui/material';

const socials = [
  { name: 'تلگرام', icon: '📱', color: 'var(--color-accent)', text: 'در تلگرام همراه ما باشید' },
  { name: 'اینستاگرام', icon: '📷', color: 'var(--color-accent)', text: 'ما را در اینستاگرام دنبال کنید' },
  { name: 'ایکس (X)', icon: '🐦', color: 'var(--color-accent)', text: 'خبرها و پست‌های ما را ببینید' },
  { name: 'واتساپ', icon: '💬', color: 'var(--color-accent)', text: 'از طریق واتساپ با ما در تماس باشید' },
];

const SocialLinks = () => {
  return (
    <Box sx={{ bgcolor: 'var(--color-secondary)', py: 6, textAlign: 'center', fontFamily: 'Vazir, sans-serif' }} dir="rtl">
      <Container>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', mb: 4, color: 'var(--color-primary)' }}
        >
          راه‌های ارتباط با ما
        </Typography>

        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
        >
          {socials.map((social, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'var(--color-secondary)',
                  borderRadius: 3,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: social.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h4">{social.icon}</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {social.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-primary)' }}>
                    {social.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default SocialLinks;
