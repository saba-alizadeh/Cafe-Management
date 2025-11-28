import React, { useRef } from 'react';
import {
  Box,
  Container,
  Card,
  Avatar,
  Typography,
  IconButton,
  Rating
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const testimonials = [
  { name: 'پیتا محمدی', text: 'قهوه فوق‌العاده‌ای بود، طعمش بی‌نظیر بود و فضای کافه خیلی دل‌نشین بود.', image: 'https://randomuser.me/api/portraits/women/65.jpg', rating: 5 },
  { name: 'محمود الهی', text: 'همه چیز عالی بود، از سرویس گرفته تا نوشیدنی‌ها. فقط کمی صبر داشت سفارش بیاد.', image: 'https://randomuser.me/api/portraits/men/45.jpg', rating: 4.5 },
  { name: 'سارا احمدی', text: 'کاپوچینو و فضای کار خیلی عالی بود، حتما دوباره میام.', image: 'https://randomuser.me/api/portraits/women/32.jpg', rating: 4 },
  { name: 'علی رضایی', text: 'نوشیدنی‌های خاص و حرفه‌ای. برخورد کارکنان هم خیلی خوب بود.', image: 'https://randomuser.me/api/portraits/men/52.jpg', rating: 5 },
  { name: 'نیلوفر حیدری', text: 'موزیک ملایم و محیط آرومش فوق‌العاده بود. فقط صندلی‌ها می‌تونستن راحت‌تر باشن.', image: 'https://randomuser.me/api/portraits/women/12.jpg', rating: 4.5 },
  { name: 'امیر ساعی', text: 'لاته خیلی خوش‌طعم بود و بسته‌بندی برای بیرون‌بر هم عالی بود.', image: 'https://randomuser.me/api/portraits/men/30.jpg', rating: 5 }
];

const Testimonials = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });

  return (
    <Box sx={{  py: 6, position: 'relative' }}>
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            mb: 4,
            borderBottom: '1px dashed #ccc',
            display: 'inline-block',
            pb: 1,
            mx: 'auto'
          }}
        >
          نظرات مشتریان
        </Typography>

        {/* ناحیه کارت‌ها */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            px: 1,
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {testimonials.map((item, index) => (
            <Card
              key={index}
              sx={{
                minWidth: 300,
                maxWidth: 300,
                flexShrink: 0,
                borderRadius: 3,
                boxShadow: 2,
                textAlign: 'center',
                p: 2,
                bgcolor: 'white',
                transition: '0.3s',
                '&:hover': { boxShadow: 4, transform: 'translateY(-5px)' }
              }}
            >
              <Avatar
                src={item.image}
                alt={item.name}
                sx={{ width: 64, height: 64, mx: 'auto', mb: 1 }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {item.name}
              </Typography>
              <Rating
                name="half-rating-read"
                defaultValue={item.rating}
                precision={0.5}
                readOnly
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" sx={{ color: 'gray', fontSize: '0.9rem' }}>
                {item.text}
              </Typography>
              <Typography variant="h6" sx={{ color: '#ccc', mt: 1 }}>
                “
              </Typography>
            </Card>
          ))}
        </Box>

        {/* دکمه‌های فلش */}
        <IconButton
          onClick={scrollLeft}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'white',
            color: 'black',
            boxShadow: 2,
            zIndex: 2,
            '&:hover': { bgcolor: '#A81C1C', color: 'white' }
          }}
        >
          <ArrowBack />
        </IconButton>

        <IconButton
          onClick={scrollRight}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'white',
            color: 'black',
            boxShadow: 2,
            zIndex: 2,
            '&:hover': { bgcolor: '#A81C1C', color: 'white' }
          }}
        >
          <ArrowForward />
        </IconButton>
      </Container>
    </Box>
  );
};

export default Testimonials;
