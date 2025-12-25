import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Card, CardContent, CardMedia, Grid, CircularProgress, Alert, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Event, ShoppingCart, Person } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';

const EventReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventSessions, setEventSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [reservationDialog, setReservationDialog] = useState(false);
    const [reservationData, setReservationData] = useState({
        sessionId: '',
        numberOfPeople: 1,
        peopleNames: ['']
    });
    const { apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
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
            // Fetch available events from API
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
                const hours = Math.floor(event.duration_minutes / 60);
                const minutes = event.duration_minutes % 60;
                const durationText = minutes > 0 ? `${hours}.${minutes} ساعت` : `${hours} ساعت`;
                
                const imageUrl = event.image_urls && event.image_urls.length > 0 
                    ? event.image_urls[0] 
                    : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%236c8c68" width="400" height="300"/><circle cx="200" cy="150" r="40" fill="%23fcede9"/></svg>';
                
                return {
                    id: event.id,
                    name: event.name || 'رویداد بدون نام',
                    eventTitle: event.name || 'رویداد بدون نام',
                    description: event.description || '',
                    image: imageUrl,
                    price: event.price_per_person || 0,
                    duration: durationText,
                    duration_minutes: event.duration_minutes,
                    maxPeople: 50
                };
            }) : [];
            
            setReservations(mappedEvents);
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

    const handleOpenReservationDialog = async (event) => {
        setSelectedEvent(event);
        setReservationData({
            sessionId: '',
            numberOfPeople: 1,
            peopleNames: ['']
        });
        setReservationDialog(true);
        await fetchEventSessions(event.id);
    };

    const handleNumberOfPeopleChange = (value) => {
        const numPeople = Math.max(1, parseInt(value) || 1);
        const currentNames = reservationData.peopleNames;
        const newNames = [];
        
        // Adjust names array to match number of people
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                    رزروهای رویداد
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {reservations.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Event sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                هیچ رویدادی برای رزرو وجود ندارد
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {reservations.map((reservation) => (
                            <Grid item xs={12} md={6} key={reservation.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {reservation.image && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={reservation.image.startsWith('/') ? `${apiBaseUrl}${reservation.image}` : reservation.image}
                                            alt={reservation.name}
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            {reservation.name}
                                        </Typography>
                                        {reservation.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {reservation.description.length > 100 
                                                    ? reservation.description.substring(0, 100) + '...' 
                                                    : reservation.description}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            مدت زمان: {reservation.duration}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ظرفیت: تا {reservation.maxPeople} نفر
                                        </Typography>
                                        <Typography variant="h6" sx={{ mt: 'auto', mb: 2, color: 'var(--color-primary)' }}>
                                            {reservation.price?.toLocaleString()} تومان (هر نفر)
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<ShoppingCart />}
                                            onClick={() => handleOpenReservationDialog(reservation)}
                                            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
                                        >
                                            رزرو رویداد
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Reservation Dialog */}
                <Dialog open={reservationDialog} onClose={() => setReservationDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>رزرو رویداد: {selectedEvent?.name}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            {/* Session Selection */}
                            <FormControl fullWidth required>
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
                            />

                            {/* People Names */}
                            <Box>
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
                                <Box sx={{ p: 2, bgcolor: 'var(--color-accent-soft)', borderRadius: 2 }}>
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
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ direction: 'rtl', p: 2 }}>
                        <Button onClick={() => setReservationDialog(false)}>انصراف</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
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
                                    name: `رزرو رویداد: ${selectedEvent.name}`,
                                    eventTitle: selectedEvent.name,
                                    eventDescription: selectedEvent.description,
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
                                setReservationDialog(false);
                            }}
                            disabled={!reservationData.sessionId || loadingSessions}
                            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
                        >
                            افزودن به سبد خرید
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default EventReservations;

