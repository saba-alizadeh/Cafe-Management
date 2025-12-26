import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const MenuSection = ({ selectedCafe, selectedCategory }) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, apiBaseUrl, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCafe?.id) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCafe, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    const authToken = token || localStorage.getItem('authToken');
    
    if (!selectedCafe || !selectedCafe.id) {
      setLoading(false);
      return;
    }

    try {
      // Try to fetch products - if no auth, might need a public endpoint
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      // Note: This assumes there's a public endpoint or the endpoint works without auth
      // If not, you may need to create a public products endpoint in the backend
      const res = await fetch(`${apiBaseUrl}/products?cafe_id=${selectedCafe.id}`, {
        headers
      });
      
      if (!res.ok) {
        // If endpoint requires auth and fails, use fallback data
        console.warn('Could not fetch products from API, using fallback');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      const mappedProducts = Array.isArray(data) ? data
        .filter(product => {
          // Filter by selected category if one is selected
          if (selectedCategory) {
            // Check if product labels include the selected category
            const labels = product.labels || [];
            return labels.includes(selectedCategory);
          }
          // If no category selected, show all active products
          return product.is_active !== false;
        })
        .map((product) => {
          const isCoffee = product.labels && product.labels.some(label => 
            label.toLowerCase().includes('قهوه') || label.toLowerCase().includes('coffee')
          );
          const coffeeBlends = product.coffee_blends || [];
          const defaultPrice = product.price || 0;
          const firstBlend = coffeeBlends.length > 0 ? coffeeBlends[0] : null;
          
          return {
            id: product.id,
            name: product.name || 'محصول بدون نام',
            description: product.description || '',
            price: defaultPrice,
            originalPrice: defaultPrice,
            discount: product.discount_percent || 0,
            image: product.image_url || '',
            favorite: false,
            labels: product.labels || [],
            coffee_blends: coffeeBlends,
            coffee_type: product.coffee_type || '',
            isCoffee: isCoffee,
            selectedBlendRatio: firstBlend ? firstBlend.ratio : null,
            selectedBlendPrice: firstBlend ? firstBlend.price : defaultPrice
          };
        }) : [];
      
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('خطا در بارگذاری محصولات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (item) => {
    // For coffee products, use selected blend price
    const finalPrice = item.isCoffee && item.selectedBlendPrice ? item.selectedBlendPrice : item.price;
    const cartItem = {
      id: `product-${item.id}${item.selectedBlendRatio ? `-${item.selectedBlendRatio}` : ''}`,
      type: 'product',
      name: item.selectedBlendRatio ? `${item.name} (${item.selectedBlendRatio})` : item.name,
      price: finalPrice,
      quantity: 1,
      ...(item.isCoffee && item.selectedBlendRatio && {
        coffee_blend_ratio: item.selectedBlendRatio,
        coffee_type: item.coffee_type
      })
    };
    addToCart(cartItem);
    alert(`${item.name}${item.selectedBlendRatio ? ` با ترکیب ${item.selectedBlendRatio}` : ''} به سبد خرید اضافه شد`);
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
            {selectedCategory || 'منوی کافه'}
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {selectedCategory ? `هیچ محصولی در دسته "${selectedCategory}" یافت نشد` : 'هیچ محصولی یافت نشد'}
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {products.map((item) => (
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
                    src={item.image && item.image.startsWith('/') ? `${apiBaseUrl}${item.image}` : (item.image || '')}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
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
                    <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                      {item.discount > 0 && (
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'line-through',
                            color: 'text.secondary',
                          }}
                        >
                          {(item.selectedBlendPrice || item.originalPrice).toLocaleString()} تومان
                        </Typography>
                      )}
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}
                      >
                        {(item.selectedBlendPrice || item.price).toLocaleString()} تومان
                      </Typography>
                      
                      {/* Coffee Blend Buttons - Below Price */}
                      {item.isCoffee && item.coffee_blends && item.coffee_blends.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
                            انتخاب ترکیب:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {item.coffee_blends.map((blend, idx) => (
                              <Button
                                key={idx}
                                variant={item.selectedBlendRatio === blend.ratio ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => {
                                  const updatedProducts = products.map(p => 
                                    p.id === item.id 
                                      ? { ...p, selectedBlendRatio: blend.ratio, selectedBlendPrice: blend.price }
                                      : p
                                  );
                                  setProducts(updatedProducts);
                                }}
                                sx={{
                                  minWidth: 60,
                                  fontSize: '0.7rem',
                                  ...(item.selectedBlendRatio === blend.ratio && {
                                    backgroundColor: 'var(--color-accent)',
                                    '&:hover': { backgroundColor: 'var(--color-accent)' }
                                  })
                                }}
                              >
                                {blend.ratio}
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      )}
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
                      onClick={() => handleAddClick(item)}
                    >
                      +
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            ))}
          </Grid>
        )}
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
