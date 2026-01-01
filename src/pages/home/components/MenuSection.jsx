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
import ProductDetailModal from '../../../components/ProductDetailModal';
import { getImageUrl } from '../../../utils/imageUtils';

const MenuSection = ({ selectedCafe, selectedCategory }) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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
      // Fetch products for the selected cafe - public access (no auth required)
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const res = await fetch(`${apiBaseUrl}/products?cafe_id=${selectedCafe.id}`, {
        headers
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'خطا در بارگذاری محصولات');
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

  const handleCardClick = (item) => {
    setSelectedProduct(item);
    setModalOpen(true);
  };

  const handleReserve = (productData) => {
    const cartItem = {
      id: `product-${productData.id}${productData.selectedBlendRatio ? `-${productData.selectedBlendRatio}` : ''}`,
      type: 'product',
      name: productData.selectedBlendRatio 
        ? `${productData.name} (${productData.selectedBlendRatio})` 
        : productData.name,
      price: productData.finalPrice,
      quantity: 1,
      ...(productData.isCoffee && productData.selectedBlendRatio && {
        coffee_blend_ratio: productData.selectedBlendRatio,
        coffee_type: productData.selectedCoffeeType || productData.coffee_type
      })
    };
    addToCart(cartItem);
    alert(`${productData.name}${productData.selectedBlendRatio ? ` با ترکیب ${productData.selectedBlendRatio}` : ''} به سبد خرید اضافه شد`);
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
      <Container maxWidth="xl">
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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            {products.map((item) => (
            <Box
              key={item.id}
              sx={{
                flexBasis: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)', lg: 'calc(12.5% - 14px)' },
                maxWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)', lg: 'calc(12.5% - 14px)' },
                minWidth: { xs: '280px', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)', lg: 'calc(12.5% - 14px)' },
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Card
                sx={{
                  width: '100%',
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
                onClick={() => handleCardClick(item)}
              >
                {/* Image */}
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={getImageUrl(item.image, apiBaseUrl) || ''}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: 150,
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
                    p: 1.5,
                    '&:last-child': { pb: 1.5 }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}
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
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                        fontSize: '0.75rem',
                        mb: 0.5,
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
                      width: '100%',
                      mt: 0.5,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1rem' }}
                    >
                      {(item.selectedBlendPrice || item.price).toLocaleString()} تومان
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            ))}
          </Box>
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

      <ProductDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        apiBaseUrl={apiBaseUrl}
        onReserve={handleReserve}
      />
    </Box>
  );
};

export default MenuSection;
