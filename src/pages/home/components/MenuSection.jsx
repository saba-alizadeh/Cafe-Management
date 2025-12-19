import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';
const menuItems = [
  {
    id: 1,
    name: 'لاته',
    description:
      'ترکیب بی‌نظیر اسپرسو و شیر بخار‌داده‌شده، با طعمی نرم و کرمی که شروع یه روز آرومه.',
    price: 95000,
    originalPrice: 110000,
    discount: 14,
    image: 'src/assets/MenuPics/latte.png',
    favorite: false,
  },
  {
    id: 2,
    name: 'کاپوچینو',
    description:
      'اسپرسو قوی با کف شیر سبک و دل‌چسب، مخصوص کسایی که دنبال طعم کلاسیک و انرژی‌بخشن.',
    price: 90000,
    originalPrice: 100000,
    discount: 10,
    image: 'src/assets/MenuPics/cappuccino.png',
    favorite: false,
  },
  {
    id: 3,
    name: 'موکا',
    description:
      'ترکیب جذاب قهوه و شکلات داغ که هر جرعه‌ش یه حس خوشایند و شیرینه.',
    price: 98000,
    originalPrice: 115000,
    discount: 15,
    image: 'src/assets/MenuPics/mocha.png',
    favorite: false,
  },
  {
    id: 4,
    name: 'آیس آمریکانو',
    description:
      'قهوه خالص و خنک برای روزای گرم؛ تلخ، ساده و شیک مثل یه حس خنکی ناگهانی!',
    price: 87000,
    originalPrice: 95000,
    discount: 8,
    image: 'src/assets/MenuPics/iceamericano.png',
    favorite: false,
  },
  
];

const MenuSection = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddClick = () => {
    if (user) {
      navigate('/customer/profile');
    } else {
      setAuthDialogOpen(true);
    }
  };

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
            نوشیدنی
          </Typography>

          <Box
            sx={{
              width: '100%',
              height: '2px',
              bgcolor: 'var(--color-accent-soft)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200px',
                height: '2px',
                bgcolor: 'var(--color-primary)',
                borderStyle: 'dashed',
                borderColor: 'var(--color-primary)',
              },
            }}
          />
        </Box>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
        >
          {menuItems.map((item) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              key={item.id}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Card
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                {/* Image */}
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    <Favorite color={item.favorite ? 'error' : 'action'} />
                  </IconButton>
                  {item.discount > 0 && (
                    <Chip
                      label={`${item.discount}%`}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'var(--color-accent)',
                        color: 'var(--color-secondary)',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', mb: 1 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5,
                        minHeight: '4.5em',
                        px: 1,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 3,
                      width: '100%',
                      px: 2,
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      {item.discount > 0 && (
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'line-through',
                            color: 'text.secondary',
                          }}
                        >
                          {item.originalPrice.toLocaleString()} تومان
                        </Typography>
                      )}
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}
                      >
                        {item.price.toLocaleString()} تومان
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        bgcolor: 'var(--color-accent-soft)',
                        color: 'var(--color-primary)',
                        '&:hover': {
                          bgcolor: 'var(--color-primary)',
                          color: 'var(--color-secondary)',
                        },
                      }}
                      onClick={handleAddClick}
                    >
                      +
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <PhoneAuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onAuthenticated={(user) => {
          setAuthDialogOpen(false);
          navigate('/customer');
        }}
      />
    </Box>
  );
};

export default MenuSection;
