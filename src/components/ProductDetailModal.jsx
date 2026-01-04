import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getImageUrl } from '../utils/imageUtils';

const ProductDetailModal = ({ open, onClose, product, apiBaseUrl, onReserve }) => {
  const [selectedBlendRatio, setSelectedBlendRatio] = useState(
    product?.coffee_blends && product.coffee_blends.length > 0 
      ? product.coffee_blends[0].ratio 
      : null
  );
  const [selectedCoffeeType, setSelectedCoffeeType] = useState(product?.coffee_type || '');
  const [availableCoffeeTypes] = useState(['Robusta', 'Arabica']);

  const isCoffee = product?.isCoffee || false;
  const selectedBlend = product?.coffee_blends?.find(b => b.ratio === selectedBlendRatio);
  const finalPrice = isCoffee && selectedBlend ? selectedBlend.price : (product?.price || 0);

  const handleReserve = () => {
    if (onReserve) {
      const reserveData = {
        ...product,
        selectedBlendRatio: isCoffee ? selectedBlendRatio : null,
        selectedBlendPrice: isCoffee && selectedBlend ? selectedBlend.price : null,
        selectedCoffeeType: isCoffee ? selectedCoffeeType : null,
        finalPrice
      };
      onReserve(reserveData);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          direction: 'rtl',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {product?.name || 'جزئیات محصول'}
        </Typography>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Product Image */}
          {product?.image && (
            <Box
              sx={{
                width: '100%',
                height: 250,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'var(--color-accent-soft)',
              }}
            >
              <img
                src={getImageUrl(product.image, apiBaseUrl) || ''}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}

          {/* Product Name */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
            {product?.name || 'محصول بدون نام'}
          </Typography>

          {/* Product Description */}
          {product?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {product.description}
            </Typography>
          )}

          {/* Coffee Blend Selection */}
          {isCoffee && product?.coffee_blends && product.coffee_blends.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                انتخاب ترکیب:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.coffee_blends.map((blend, idx) => (
                  <Button
                    key={idx}
                    variant={selectedBlendRatio === blend.ratio ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedBlendRatio(blend.ratio)}
                    sx={{
                      minWidth: 70,
                      ...(selectedBlendRatio === blend.ratio && {
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

          {/* Coffee Type Selection */}
          {isCoffee && (
            <Box>
              <Autocomplete
                options={availableCoffeeTypes}
                freeSolo
                value={selectedCoffeeType}
                onChange={(event, newValue) => {
                  setSelectedCoffeeType(newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="نوع قهوه (Robusta, Arabica و ...)"
                    placeholder="نوع قهوه را انتخاب یا وارد کنید"
                  />
                )}
              />
            </Box>
          )}

          {/* Price Display */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              قیمت:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {finalPrice.toLocaleString()} تومان
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          انصراف
        </Button>
        <Button
          onClick={handleReserve}
          variant="contained"
          sx={{
            bgcolor: 'var(--color-primary)',
            '&:hover': { bgcolor: 'var(--color-primary)' }
          }}
        >
          رزرو
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetailModal;


