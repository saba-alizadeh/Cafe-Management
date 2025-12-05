import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Dialog,
    DialogContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { Close as CloseIcon, EventAvailable } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Mock event data
const eventsData = [
    {
        id: 1,
        title: 'کنسرت موسیقی زنده',
        shortSummary: 'شب موسیقی با هنرمندان محلی برای شام دلپذیر',
        fullDescription: 'یک شب موسیقی مخصوص با بهترین هنرمندان محلی. میزبانی شامل شام کامل، نوشیدنی و اجرای موسیقی زنده از ساعت 8 شب تا نیمه شب. ایده آل برای تاریخ های رمانتیک یا مناسبت های خصوصی.',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%236c8c68" width="400" height="300"/><circle cx="200" cy="150" r="40" fill="%23fcede9"/><path d="M180 100 L190 140 L200 100 L210 140 L220 100" stroke="%23fcede9" fill="none" stroke-width="2"/></svg>',
        price: 250000, // 250,000 Toman
        duration: '4 ساعت',
        maxPeople: 50
    },
    {
        id: 2,
        title: 'کارگاه کافه لاته آرت',
        shortSummary: 'یاد بگیرید چگونه طرح‌های زیبا روی قهوه بکشید',
        fullDescription: 'کارگاه آموزشی ۲ ساعته درباره هنر لاته آرت برای مبتدیان و حرفه‌ای‌ها. شامل دستور العمل‌های عملی، نمونه‌های محترفانه و فرصت برای تمرین روی قهوه واقعی. هر شرکت‌کننده ۶ فنجان قهوه برای تمرین دریافت می‌کند.',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%238b6f47" width="400" height="300"/><rect x="150" y="100" width="100" height="120" rx="10" fill="%23d4a574"/><ellipse cx="200" cy="100" rx="60" ry="20" fill="%23c99a62"/></svg>',
        price: 150000, // 150,000 Toman
        duration: '2 ساعت',
        maxPeople: 20
    },
    {
        id: 3,
        title: 'شام تاریخی و داستان‌گویی',
        shortSummary: 'غذاهای تاریخی همراه با داستان‌های جذاب فرهنگی',
        fullDescription: 'سفری تاریخی از طریق غذا. هر پیش‌غذا، اصلی و دسر با داستان‌های فاشیناتور درباره تاریخ، فرهنگ و نوآوری جفت شده است. با داستان‌گوی حرفه‌ای و سرآشپز مخصوص ملاقات کنید.',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23395035" width="400" height="300"/><circle cx="100" cy="150" r="35" fill="%23fcede9" opacity="0.8"/><circle cx="200" cy="130" r="40" fill="%23fcede9" opacity="0.7"/><circle cx="300" cy="160" r="38" fill="%23fcede9" opacity="0.75"/></svg>',
        price: 300000, // 300,000 Toman
        duration: '3 ساعت',
        maxPeople: 40
    },
    {
        id: 4,
        title: 'باشگاه کتاب و قهوه',
        shortSummary: 'بحث درباره کتاب برگزیده ماه همراه با قهوه خاص',
        fullDescription: 'هر ماه ما کتاب جدیدی را انتخاب می‌کنیم و مخصوصی قهوه جفت می‌کنیم. اعضا در یک گروه حمیمی با حداکثر 15 نفر درباره موضوعات کتاب بحث می‌کنند و قهوه‌های منحصربه‌فرد را می‌چشیند.',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23f8f3e7" width="400" height="300"/><rect x="80" y="80" width="25" height="140" fill="%23395035"/><rect x="120" y="90" width="25" height="130" fill="%236c8c68"/><rect x="160" y="85" width="25" height="135" fill="%238b6f47"/><rect x="200" y="95" width="25" height="125" fill="%23395035"/></svg>',
        price: 120000, // 120,000 Toman
        duration: '2.5 ساعت',
        maxPeople: 15
    },
    {
        id: 5,
        title: 'کلاس آشپزی آسیایی',
        shortSummary: 'یاد بگیرید طعام‌های آسیایی اصلی را با یک سرآشپز حرفه‌ای',
        fullDescription: 'کلاس آشپزی عملی ۳ ساعته برای یاد گرفتن تکنیک‌های آشپزی آسیایی. شرکت‌کنندگان ۳ پیش‌غذا و ۲ پیش‌غذا آماده می‌کنند که سپس با سرآشپز شام می‌خورند. تمام مواد شامل شده و دستور العمل‌ها برای خانه فراهم می‌شود.',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23d4a574" width="400" height="300"/><rect x="100" y="80" width="200" height="150" fill="%23fcede9" rx="10"/><circle cx="150" cy="120" r="15" fill="%238b6f47"/><circle cx="200" cy="140" r="12" fill="%238b6f47"/><circle cx="250" cy="125" r="14" fill="%238b6f47"/></svg>',
        price: 200000, // 200,000 Toman
        duration: '3 ساعت',
        maxPeople: 12
    },
    {
        id: 6,
        title: 'عصر عکاسی و قهوه',
        shortSummary: 'شنا کردن و عکاسی مواد غذایی با نویسنده محبوب بلاگ غذایی',
        fullDescription: 'کارگاه آموزشی ۲.5 ساعته درباره عکاسی غذایی. نویسنده بلاگ معروف نکات و ترفندهای خود را درباره روشنایی، ترکیب‌بندی و ویرایش به اشتراک می‌گذارد. شامل یک جلسه عملی با غذاهای واقعی برای عکاسی است.',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23395035" width="400" height="300"/><rect x="100" y="80" width="200" height="150" fill="%23cdd3c4" rx="5"/><rect x="120" y="100" width="160" height="110" fill="%23a8c49a" rx="3"/><circle cx="200" cy="155" r="8" fill="%23fcede9"/></svg>',
        price: 180000, // 180,000 Toman
        duration: '2.5 ساعت',
        maxPeople: 10
    }
];

const timeSlots = [
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' }
];

const EventBooking = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [numPeople, setNumPeople] = useState(1);
    const [timeSlot, setTimeSlot] = useState('18:00');
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleOpenEvent = (event) => {
        setSelectedEvent(event);
        setOpenDialog(true);
        setNumPeople(1);
        setTimeSlot('18:00');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEvent(null);
    };

    const handleReserve = () => {
        if (!selectedEvent || numPeople < 1) return;

        const eventReservation = {
            id: `event-${selectedEvent.id}-${Date.now()}`,
            type: 'event',
            title: 'رزرو رویداد',
            eventTitle: selectedEvent.title,
            eventDescription: selectedEvent.fullDescription,
            people: numPeople,
            timeSlot,
            quantity: 1,
            price: selectedEvent.price * numPeople
        };

        if (user) {
            localStorage.setItem('pendingReservation', JSON.stringify(eventReservation));
            navigate('/customer/cart');
        } else {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
            navigate('/login');
        }
    };

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', py: 6, direction: 'rtl' }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-primary)', textAlign: 'right' }}>
                        رویدادهای خاص
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'right' }}>
                        رویدادهای منحصربه‌فرد و کلاس‌های آموزشی برای تجربه‌ای به‌یادماندنی
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {eventsData.map((event) => (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 8px 24px rgba(57, 80, 53, 0.2)'
                                    }
                                }}
                                onClick={() => handleOpenEvent(event)}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={event.image}
                                    alt={event.title}
                                />
                                <CardContent sx={{ flexGrow: 1, textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'var(--color-primary)' }}>
                                        {event.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, flexGrow: 1 }}>
                                        {event.shortSummary}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        <Chip
                                            label={event.duration}
                                            size="small"
                                            variant="outlined"
                                            sx={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                                        />
                                        <Chip
                                            label={`${(event.price).toLocaleString('fa-IR')} تومان`}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'var(--color-accent)',
                                                color: 'var(--color-secondary)',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', display: 'block' }}>
                                        ظرفیت: {event.maxPeople} نفر
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Event Details Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                        direction: 'rtl'
                    }
                }}
            >
                {selectedEvent && (
                    <>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                component="img"
                                src={selectedEvent.image}
                                alt={selectedEvent.title}
                                sx={{
                                    width: '100%',
                                    height: 250,
                                    objectFit: 'cover'
                                }}
                            />
                            <Button
                                onClick={handleCloseDialog}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: 'var(--color-primary)',
                                    minWidth: 'auto',
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 1)'
                                    }
                                }}
                            >
                                <CloseIcon />
                            </Button>
                        </Box>

                        <DialogContent sx={{ py: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-primary)', textAlign: 'right' }}>
                                {selectedEvent.title}
                            </Typography>

                            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, textAlign: 'right' }}>
                                {selectedEvent.fullDescription}
                            </Typography>

                            <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(102, 123, 104, 0.1)', borderRadius: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            مدت زمان
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {selectedEvent.duration}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            قیمت هر نفر
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>
                                            {(selectedEvent.price).toLocaleString('fa-IR')} تومان
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'right' }}>
                                تعداد شرکت‌کنندگان
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                value={numPeople}
                                onChange={(e) => setNumPeople(Math.max(1, Math.min(selectedEvent.maxPeople, parseInt(e.target.value) || 1)))}
                                inputProps={{ min: 1, max: selectedEvent.maxPeople }}
                                sx={{ mb: 2 }}
                            />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'right' }}>
                                ساعت شروع
                            </Typography>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Select
                                    value={timeSlot}
                                    onChange={(e) => setTimeSlot(e.target.value)}
                                >
                                    {timeSlots.map((slot) => (
                                        <MenuItem key={slot.value} value={slot.value}>
                                            {slot.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box sx={{ mb: 2, p: 2, backgroundColor: 'var(--color-secondary)', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'right' }}>
                                    مبلغ کل:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-primary)', textAlign: 'right' }}>
                                    {(selectedEvent.price * numPeople).toLocaleString('fa-IR')} تومان
                                </Typography>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleReserve}
                                sx={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    py: 1.5,
                                    mb: 1
                                }}
                            >
                                رزرو کنید
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleCloseDialog}
                                sx={{
                                    color: 'var(--color-primary)',
                                    borderColor: 'var(--color-primary)',
                                    fontWeight: 'bold'
                                }}
                            >
                                بستن
                            </Button>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default EventBooking;


