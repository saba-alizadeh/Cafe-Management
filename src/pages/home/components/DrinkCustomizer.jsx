import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Card,
  Paper,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import PhoneAuthDialog from '../../../components/auth/PhoneAuthDialog';

const DrinkCustomizer = () => {
  const [selectedSize, setSelectedSize] = useState('medium');
  const [sizeMultiplier, setSizeMultiplier] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [showIce, setShowIce] = useState(false);
  const [showWhippedCream, setShowWhippedCream] = useState(false);
  const [floatingItems, setFloatingItems] = useState([]);
  const [isDraggingOverCup, setIsDraggingOverCup] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleDragStart = (event, item) => {
    try {
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'copy';
    } catch (err) {
      // ignore
    }
  };

  const handleDragOverCup = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOverCup) setIsDraggingOverCup(true);
  };

  const handleDragLeaveCup = () => {
    setIsDraggingOverCup(false);
  };

  const handleDropOnCup = (event) => {
    event.preventDefault();
    setIsDraggingOverCup(false);
    try {
      const data = event.dataTransfer.getData('application/json');
      if (!data) return;
      const item = JSON.parse(data);
      handleAddIngredient(item);
    } catch (err) {
      // ignore malformed payloads
    }
  };

  const sizes = [
    { name: 'کوچک', price: 0 },
    { name: 'متوسط', price: 1 },
    { name: 'بزرگ', price: 2 }
  ];

  const baseLiquids = [
    { name: 'اسپرسو', emoji: '☕', price: 3.5, color: '#8B4513', bgColor: '#D2B48C' },
    { name: 'قهوه', emoji: '☕', price: 2.5, color: '#6F4E37', bgColor: '#A0522D' },
    { name: 'آب', emoji: '💧', price: 1, color: '#87CEEB', bgColor: '#B0E0E6' },
    { name: 'شیر', emoji: '🥛', price: 2, color: 'var(--color-secondary)', bgColor: 'var(--color-surface)' },
    { name: 'چای سبز', emoji: '🍃', price: 2.5, color: '#90EE90', bgColor: '#98FB98' },
    { name: 'چای سیاه', emoji: '🫖', price: 2.5, color: '#CD853F', bgColor: '#D2A679' }
  ];

  const fruits = [
    { name: 'موز', emoji: '🍌', price: 1, bgColor: 'var(--color-secondary)' },
    { name: 'توت فرنگی', emoji: '🍓', price: 1.25, bgColor: 'var(--color-accent-soft)' },
    { name: 'بلوبری', emoji: '🫐', price: 1.5, bgColor: 'var(--color-accent-soft)' },
    { name: 'گیلاس ', emoji: '🍒', price: 1.25, bgColor: '#FFB6C1' },
    { name: 'انبه', emoji: '🥭', price: 1.5, bgColor: 'var(--color-accent-soft)' },
    { name: 'هلو', emoji: '🍑', price: 1.25, bgColor: 'var(--color-accent-soft)' },
    { name: 'سیب', emoji: '🍎', price: 1, bgColor: 'var(--color-accent-soft)' },
    { name: 'پرتقال', emoji: '🍊', price: 1, bgColor: 'var(--color-accent-soft)' }
  ];

  const syrups = [
    { name: 'وانیل', emoji: '🍦', price: 0.5, bgColor: 'var(--color-secondary)' },
    { name: 'کارامل', emoji: '🍯', price: 0.5, bgColor: 'var(--color-accent-soft)' },
    { name: 'شکلات', emoji: '🍫', price: 0.75, bgColor: '#8B4513' }
  ];

  const extras = [
    { name: 'یخ', emoji: '🧊', price: 0, bgColor: 'var(--color-accent-soft)' },
    { name: 'خامه زده شده', emoji: '☁️', price: 0.5, bgColor: 'var(--color-secondary)' },
    { name: 'نعناع', emoji: '🌿', price: 0.5, bgColor: 'var(--color-accent-soft)' }
  ];

  const handleSizeSelect = (sizeName, index) => {
    setSelectedSize(sizeName.toLowerCase());
    setSizeMultiplier(index);
  };

  const handleAddIngredient = (ingredient) => {
    if (ingredient.name === 'یخ') {
      setShowIce(true);
      if (!ingredients.some(ing => ing.name === 'یخ')) {
        setIngredients([...ingredients, ingredient]);
      }
    } else if (ingredient.name === 'خامه زده شده') {
      setShowWhippedCream(true);
      if (!ingredients.some(ing => ing.name === 'خامه زده شده')) {
        setIngredients([...ingredients, ingredient]);
      }
    } else if (['وانیل', 'کارامل', 'شکلات'].includes(ingredient.name)) {
      // Syrups
      setIngredients([...ingredients, ingredient]);
    } else if (baseLiquids.some(bl => bl.name === ingredient.name)) {
      // Replace base liquid
      const otherIngredients = ingredients.filter(ing =>
        !baseLiquids.some(bl => bl.name === ing.name)
      );
      setIngredients([...otherIngredients, ingredient]);
    } else if (fruits.some(f => f.name === ingredient.name)) {
      // Fruits
      setFloatingItems([...floatingItems, {
        ...ingredient,
        id: Date.now(),
        position: { top: Math.random() * 150 + 80, left: Math.random() * 100 + 50 }
      }]);
      setIngredients([...ingredients, ingredient]);
    } else {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const handleClearDrink = () => {
    setIngredients([]);
    setShowIce(false);
    setShowWhippedCream(false);
    setFloatingItems([]);
    setSelectedSize('medium');
    setSizeMultiplier(1);
  };

  const calculatePrice = () => {
    let basePrice = ingredients.reduce((sum, ing) => sum + ing.price, 0);
    basePrice += sizes[sizeMultiplier].price;
    return basePrice.toFixed(2);
  };

  const getCurrentBaseLiquid = () => {
    for (let i = ingredients.length - 1; i >= 0; i -= 1) {
      const ing = ingredients[i];
      if (baseLiquids.some(bl => bl.name === ing.name)) {
        return baseLiquids.find(bl => bl.name === ing.name);
      }
    }
    return null;
  };

  const getSyrupLayers = () => {
    return ingredients.filter(ing => syrups.some(s => s.name === ing.name));
  };

  const handleAddToOrderClick = () => {
    if (ingredients.length === 0) {
      alert('لطفاً ابتدا مواد پایه را اضافه کنید');
      return;
    }
    
    const customDrink = {
      id: `custom-drink-${Date.now()}`,
      type: 'custom_drink',
      name: `نوشیدنی سفارشی (${selectedSize})`,
      ingredients: ingredients.map(ing => ing.name).join(', '),
      size: selectedSize,
      price: parseFloat(calculatePrice()),
      quantity: 1
    };
    
    addToCart(customDrink);
    alert('نوشیدنی سفارشی به سبد خرید اضافه شد');
    handleClearDrink(); // Clear after adding
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          نوشیدنی مورد علاقت رو بساز !
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

      <Paper
        sx={{
          p: 4,
          bgcolor: 'var(--color-accent-soft)',
          boxShadow: 3,
          borderRadius: 3
        }}
      >
        <Grid container spacing={4} alignItems="flex-start">
          {/* Ingredients Panel - Left Side */}
          <Grid item xs={12} lg={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)' }}>
              اجزای نوشیدنیت رو انتخاب کن
            </Typography>

            {/* Base Liquids */}
            <Box sx={{ mb: 4, width: '600px' }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, color: 'var(--color-primary)' }}>
                🥤 مواد پایه
              </Typography>
              <Grid container spacing={2}>
                {baseLiquids.map((liquid) => (
                  <Grid item xs={6} sm={4} key={liquid.name}>
                    <Card
                      onClick={() => handleAddIngredient(liquid)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, liquid)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        bgcolor: liquid.bgColor,
                        border: liquid.name === 'شیر' ? '1px solid #E0E0E0' : 'none',
                        borderRadius: 2,
                        textAlign: 'center',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-4px)',
                          opacity: 0.9
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '2rem', mb: 1 }}>{liquid.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                        {liquid.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {liquid.price.toFixed(2)} تومان
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Fruits */}
            <Box sx={{ mb: 4, width: '600px' }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, color: 'var(--color-primary)' }}>
                🍓 میوه های تازه
              </Typography>
              <Grid container spacing={1.5}>
                {fruits.map((fruit) => (
                  <Grid item xs={4} sm={3} key={fruit.name}>
                    <Card
                      onClick={() => handleAddIngredient(fruit)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fruit)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        bgcolor: fruit.bgColor,
                        borderRadius: 2,
                        textAlign: 'center',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          opacity: 0.9
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{fruit.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.25 }}>
                        {fruit.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        {fruit.price.toFixed(2)} تومان
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Syrups & Extras */}
            <Box sx={{ mb: 4, width: '600px' }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, color: 'var(--color-primary)' }}>
                🍯 سیروپ ها
              </Typography>
              <Grid container spacing={1.5}>
                {[...syrups, ...extras].map((item) => (
                  <Grid item xs={4} key={item.name}>
                    <Card
                      onClick={() => handleAddIngredient(item)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        bgcolor: item.name === 'شکلات' ? 'var(--color-primary)' : item.bgColor,
                        border: item.name === 'خامه زده شده' ? '1px solid #E0E0E0' : 'none',
                        borderRadius: 2,
                        textAlign: 'center',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)',
                          opacity: 0.9
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: '1.25rem', mb: 0.5, filter: item.name === 'شکلات' ? 'brightness(0) invert(1)' : 'none' }}>
                        {item.emoji}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          mb: 0.25,
                          color: item.name === 'شکلات' ? 'var(--color-secondary)' : 'var(--color-primary)'
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography sx={{
                        fontSize: '0.75rem',
                        color: item.name === 'شکلات' ? 'var(--color-accent)' : 'var(--color-primary)',
                        fontWeight: 600
                      }}>
                        {item.price === 0 ? 'رایگان' : `${item.price.toFixed(2)} تومان`}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Drink Preview - Right Side */}
          <Grid item xs={12} lg={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)' }}>
              نوشیدنی شما
            </Typography>

            {/* Glass Container */}
            <Box
              sx={{
                position: '-moz-initial',
                top: 16,
                mx: 'auto',
                mb: 3,
                p: 3,
                bgcolor: isDraggingOverCup ? 'var(--color-accent-soft)' : 'var(--color-accent-soft)',
                borderRadius: 3,
                width: 280,
                maxWidth: 280,
                height: 360,
                boxShadow: 2,
                border: isDraggingOverCup ? '2px dashed var(--color-accent)' : '2px solid var(--color-accent-soft)'
              }}
              onDragOver={handleDragOverCup}
              onDragLeave={handleDragLeaveCup}
              onDrop={handleDropOnCup}
            >
              {/* SVG Glass */}
              <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
                <svg width="100%" viewBox="0 0 200 300" style={{ maxHeight: 280 }}>
                  <defs>
                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: 'var(--color-secondary)', stopOpacity: 0.3 }} />
                      <stop offset="30%" style={{ stopColor: 'var(--color-secondary)', stopOpacity: 0.1 }} />
                      <stop offset="70%" style={{ stopColor: 'var(--color-secondary)', stopOpacity: 0.05 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--color-secondary)', stopOpacity: 0.2 }} />
                    </linearGradient>
                    <clipPath id="glassClip">
                      <path d="M52 52 L148 52 L138 248 L62 248 Z" />
                    </clipPath>
                  </defs>

                  <ellipse cx="100" cy="280" rx="45" ry="8" fill="var(--color-primary)" opacity="0.1" />
                  <path
                    d="M50 50 L150 50 L140 250 L60 250 Z"
                    fill="url(#glassGradient)"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    opacity="0.9"
                  />
                  <path
                    d="M55 55 L75 55 L73 240 L57 240 Z"
                    fill="var(--color-secondary)"
                    opacity="0.4"
                  />

                  {/* Base Liquid Layer */}
                  <rect
                    x="52"
                    y={98}
                    width="86"
                    height={150}
                    fill={(getCurrentBaseLiquid() && getCurrentBaseLiquid().color) || 'transparent'}
                    clipPath="url(#glassClip)"
                    style={{ transition: 'all 0.4s ease' }}
                  />

                  {/* Syrup layers stacked on top of base */}
                  {getSyrupLayers().map((syrup, idx) => (
                    <rect
                      key={`syrup-${idx}`}
                      x="52"
                      y={98 + idx * 12}
                      width="86"
                      height={10}
                      fill={syrup.bgColor || 'var(--color-accent)'}
                      opacity="0.9"
                      clipPath="url(#glassClip)"
                    />
                  ))}
                </svg>

                {/* Floating ingredients */}
                {floatingItems.map((item, index) => (
                  <Box
                    key={item.id || index}
                    sx={{
                      position: 'absolute',
                      top: `${item.position?.top || 80}px`,
                      left: `${item.position?.left || 50}px`,
                      fontSize: '24px',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      pointerEvents: 'none'
                    }}
                  >
                    {item.emoji}
                  </Box>
                ))}

                {/* Ice cubes */}
                {showIce && (
                  <>
                    <Box sx={{
                      position: 'absolute',
                      top: 100,
                      left: 80,
                      fontSize: '24px',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      pointerEvents: 'none'
                    }}>
                      🧊
                    </Box>
                    <Box sx={{
                      position: 'absolute',
                      top: 140,
                      left: 120,
                      fontSize: '20px',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      pointerEvents: 'none'
                    }}>
                      🧊
                    </Box>
                    <Box sx={{
                      position: 'absolute',
                      top: 180,
                      left: 95,
                      fontSize: '22px',
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                      pointerEvents: 'none'
                    }}>
                      🧊
                    </Box>
                  </>
                )}

                {/* Whipped cream */}
                {showWhippedCream && (
                  <Box sx={{
                    position: 'absolute',
                    top: 60,
                    left: 80,
                    fontSize: '40px',
                    filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.2))',
                    pointerEvents: 'none'
                  }}>
                    ☁️
                  </Box>
                )}
              </Box>
            </Box>

            {/* Size Selection - Fixed to avoid overlapping */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 600, mb: 2, color: 'var(--color-primary)', textAlign: 'center' }}>
                اندازه نوشیدنیت رو انتخاب کن
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {sizes.map((size, index) => (
                  <Button
                    key={size.name}
                    variant={selectedSize === size.name.toLowerCase() ? 'contained' : 'outlined'}
                    onClick={() => handleSizeSelect(size.name, index)}
                    sx={{
                      minWidth: 90,
                      py: 1.5,
                      bgcolor: selectedSize === size.name.toLowerCase() ? 'var(--color-primary)' : 'transparent',
                      color: selectedSize === size.name.toLowerCase() ? 'var(--color-secondary)' : 'var(--color-primary)',
                      borderColor: 'var(--color-primary)',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: 'var(--color-primary)',
                        color: 'var(--color-secondary)',
                        borderColor: 'var(--color-primary)'
                      }
                    }}
                  >
                    {size.name}
                    <br />
                    <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400 }}>
                      +{size.price} تومان
                    </Box>
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Ingredients List */}
            <Paper sx={{ bgcolor: 'var(--color-secondary)', p: 2, mb: 3, borderRadius: 2, boxShadow: 2, overflow: 'hidden', maxHeight: 400, maxWidth: 350 }}>
              <Typography sx={{ fontWeight: 600, mb: 2, color: 'var(--color-primary)' }}>
                اجزای نوشیدنی
              </Typography>
              <Box sx={{ minHeight: 60, mb: 2 }}>
                {ingredients.length === 0 ? (
                  <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-primary)', textAlign: 'center', py: 2 }}>
                    برای اینکه نوشیدنیت رو بسازی باید مواد پایه رو اضافه کنی!
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ingredients.map((ing, index) => (
                      <Chip
                        key={index}
                        label={`${ing.name} - ${ing.price.toFixed(2)} تومان`}
                        size="small"
                        variant="outlined"
                        sx={{
                          bgcolor: 'var(--color-secondary)',
                          fontWeight: 500,
                          border: '1px solid #E0E0E0'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <Box sx={{ borderTop: '2px solid #E0E0E0', pt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--color-primary)', mb: 0.5 }}>
                      اندازه: {selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {calculatePrice()} تومان
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClearDrink}
                fullWidth
                sx={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'var(--color-primary)',
                    bgcolor: 'var(--color-primary)',
                    color: 'var(--color-secondary)'
                  }
                }}
              >
                🗑️ پاک کردن و شروع مجدد
              </Button>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: 'var(--color-primary)',
                  color: 'var(--color-secondary)',
                  py: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': { bgcolor: 'var(--color-primary)' }
                }}
                onClick={handleAddToOrderClick}
              >
                ✨ اضافه کردن به سفارش
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <PhoneAuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onAuthenticated={(user) => {
          setAuthDialogOpen(false);
          navigate('/customer');
        }}
      />
    </Container>
  );
};

export default DrinkCustomizer;
