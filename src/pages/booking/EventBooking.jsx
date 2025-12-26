import React, { useState, useEffect } from 'react';
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
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Close as CloseIcon, EventAvailable, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const timeSlots = [
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' }
];

const EventBooking = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [eventSessions, setEventSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [reservationData, setReservationData] = useState({
        sessionId: '',
        numberOfPeople: 1,
        peopleNames: ['']
    });
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError('');
        const authToken = token || localStorage.getItem('authToken');
        
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
            return;
        }

        // Get selected café from localStorage
        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        if (!selectedCafe || !selectedCafe.id) {
            setError('لطفاً ابتدا یک کافه انتخاب کنید');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiBaseUrl}/events?cafe_id=${selectedCafe.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'خطا در بارگذاری رویدادها');
                setLoading(false);
                return;
            }
            
            const data = await res.json();
            // Map API data to component format
            const mappedEvents = Array.isArray(data) ? data.map((event) => {
                // Convert duration_minutes to hours format
                const hours = Math.floor(event.duration_minutes / 60);
                const minutes = event.duration_minutes % 60;
                const durationText = minutes > 0 ? `${hours}.${minutes} ساعت` : `${hours} ساعت`;
                
                // Get first image URL or use default
                const imageUrl = event.image_urls && event.image_urls.length > 0 
                    ? event.image_urls[0] 
                    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%236c8c68" width="400" height="300"/><circle cx="200" cy="150" r="40" fill="%23fcede9"/></svg>';
                
                // Split description into short and full
                const description = event.description || '';
                const shortSummary = description.length > 100 ? description.substring(0, 100) + '...' : description;
                
                return {
                    id: event.id,
                    title: event.name || 'رویداد بدون نام',
                    shortSummary: shortSummary,
                    fullDescription: description || 'توضیحات در دسترس نیست',
                    image: imageUrl,
                    price: event.price_per_person || 0,
                    duration: durationText,
                    duration_minutes: event.duration_minutes,
                    maxPeople: 50 // Default, can be updated if API provides this
                };
            }) : [];
            
            setEvents(mappedEvents);
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const fetchEventSessions = async (eventId) => {
        setLoadingSessions(true);
        const authToken = token || localStorage.getItem('authToken');
        const selectedCafe = JSON.parse(localStorage.getItem('selectedCafe') || 'null');
        
        if (!authToken || !selectedCafe?.id) {
            setLoadingSessions(false);
            return;
        }

        try {
            const res = await fetch(`${apiBaseUrl}/events/sessions?cafe_id=${selectedCafe.id}&event_id=${eventId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setEventSessions(Array.isArray(data) ? data.filter(s => s.available_spots > 0) : []);
            }
        } catch (err) {
            console.error('Error fetching event sessions:', err);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleOpenEvent = async (event) => {
        setSelectedEvent(event);
        setReservationData({
            sessionId: '',
            numberOfPeople: 1,
            peopleNames: ['']
        });
        setOpenDialog(true);
        await fetchEventSessions(event.id);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEvent(null);
    };

    const handleNumberOfPeopleChange = (value) => {
        const numPeople = Math.max(1, parseInt(value) || 1);
        const currentNames = reservationData.peopleNames;
        const newNames = [];
        
        for (let i = 0; i < numPeople; i++) {
            newNames.push(currentNames[i] || '');
        }
        
        setReservationData({
            ...reservationData,
            numberOfPeople: numPeople,
            peopleNames: newNames
        });
    };

    const handleNameChange = (index, value) => {
        const newNames = [...reservationData.peopleNames];
        newNames[index] = value;
        setReservationData({
            ...reservationData,
            peopleNames: newNames
        });
    };

    const handleReserve = () => {
        if (!reservationData.sessionId) {
            alert('لطفاً یک بخش را انتخاب کنید');
            return;
        }
        if (reservationData.numberOfPeople < 1) {
            alert('تعداد نفرات باید حداقل 1 باشد');
            return;
        }
        if (reservationData.peopleNames.some(name => !name.trim())) {
            alert('لطفاً نام تمام شرکت‌کنندگان را وارد کنید');
            return;
        }
        
        const selectedSession = eventSessions.find(s => s.id === reservationData.sessionId);
        const pricePerPerson = selectedSession?.price_per_person || selectedEvent?.price || 0;
        
        const eventReservation = {
            id: `event-${selectedEvent.id}-${reservationData.sessionId}-${Date.now()}`,
            type: 'event',
            name: `رزرو رویداد: ${selectedEvent.title}`,
            eventTitle: selectedEvent.title,
            eventDescription: selectedEvent.fullDescription,
            eventId: selectedEvent.id,
            sessionId: reservationData.sessionId,
            sessionDate: selectedSession?.session_date,
            sessionTime: selectedSession?.start_time,
            numberOfPeople: reservationData.numberOfPeople,
            peopleNames: reservationData.peopleNames,
            quantity: 1,
            price: pricePerPerson * reservationData.numberOfPeople
        };

        addToCart(eventReservation);
        alert('رویداد به سبد خرید اضافه شد');
        setOpenDialog(false);
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

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : events.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'right' }}>
                        رویدادی برای نمایش وجود ندارد
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {events.map((event) => (
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
                )}
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

                            {/* Session Selection */}
                            <FormControl fullWidth required sx={{ mb: 2 }}>
                                <InputLabel>انتخاب بخش (Session)</InputLabel>
                                <Select
                                    value={reservationData.sessionId}
                                    onChange={(e) => setReservationData({ ...reservationData, sessionId: e.target.value })}
                                    label="انتخاب بخش (Session)"
                                >
                                    {loadingSessions ? (
                                        <MenuItem disabled>در حال بارگذاری...</MenuItem>
                                    ) : eventSessions.length === 0 ? (
                                        <MenuItem disabled>هیچ بخشی در دسترس نیست</MenuItem>
                                    ) : (
                                        eventSessions.map((session) => (
                                            <MenuItem key={session.id} value={session.id}>
                                                {new Date(session.session_date).toLocaleDateString('fa-IR')} - {session.start_time}
                                                {session.end_time && ` تا ${session.end_time}`}
                                                {session.available_spots > 0 && ` (${session.available_spots} جای خالی)`}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            {/* Number of People */}
                            <TextField
                                label="تعداد نفرات"
                                type="number"
                                value={reservationData.numberOfPeople}
                                onChange={(e) => handleNumberOfPeopleChange(e.target.value)}
                                inputProps={{ min: 1 }}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />

                            {/* People Names */}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    نام شرکت‌کنندگان:
                                </Typography>
                                {reservationData.peopleNames.map((name, index) => (
                                    <TextField
                                        key={index}
                                        label={`نام نفر ${index + 1}`}
                                        value={name}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        fullWidth
                                        required
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Price Display */}
                            {reservationData.sessionId && (
                                <Box sx={{ mb: 2, p: 2, bgcolor: 'var(--color-accent-soft)', borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                        قیمت هر نفر:
                                    </Typography>
                                    <Typography variant="h6" color="var(--color-primary)">
                                        {(() => {
                                            const selectedSession = eventSessions.find(s => s.id === reservationData.sessionId);
                                            const pricePerPerson = selectedSession?.price_per_person || selectedEvent?.price || 0;
                                            return pricePerPerson.toLocaleString();
                                        })()} تومان
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        مجموع: {(() => {
                                            const selectedSession = eventSessions.find(s => s.id === reservationData.sessionId);
                                            const pricePerPerson = selectedSession?.price_per_person || selectedEvent?.price || 0;
                                            return (pricePerPerson * reservationData.numberOfPeople).toLocaleString();
                                        })()} تومان
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleReserve}
                                disabled={!reservationData.sessionId || loadingSessions}
                                sx={{
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    py: 1.5,
                                    mb: 1
                                }}
                            >
                                افزودن به سبد خرید
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


