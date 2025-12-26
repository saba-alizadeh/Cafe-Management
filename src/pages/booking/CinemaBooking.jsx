import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent, CardMedia, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const seatColors = {
    selected: 'var(--color-accent)',
    occupied: 'var(--color-primary)',
    recommended: 'var(--color-accent-soft)',
    available: '#a8c49a',
};

const CinemaBooking = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [peopleNames, setPeopleNames] = useState([]);
    const [totalSeats, setTotalSeats] = useState(64);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rows, setRows] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    const [seatsPerRow, setSeatsPerRow] = useState(8);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [reservationDialog, setReservationDialog] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const { user, apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const seatsPerBlock = 4;

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
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
            // Fetch cinema sessions and films for the selected café
            const [sessionsRes, filmsRes] = await Promise.all([
                fetch(`${apiBaseUrl}/cinema/sessions?cafe_id=${selectedCafe.id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                fetch(`${apiBaseUrl}/cinema/films?cafe_id=${selectedCafe.id}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            
            if (!sessionsRes.ok || !filmsRes.ok) {
                const data = await sessionsRes.json().catch(() => ({}));
                setError(data.detail || 'خطا در بارگذاری اطلاعات سینما');
                setLoading(false);
                return;
            }
            
            const sessionsData = await sessionsRes.json();
            const filmsData = await filmsRes.json();
            
            // Get cinema capacity from selected café - use exact value
            let capacity = selectedCafe?.cinema_seating_capacity || 64;
            setTotalSeats(capacity);
            
            // Calculate rows and seats per row to match exact capacity
            // Using 8 seats per row (2 blocks of 4) as standard layout
            const seatsPerRowStandard = 8;
            const calculatedRows = Math.ceil(capacity / seatsPerRowStandard);
            const rowLabels = Array.from({ length: calculatedRows }, (_, i) => 
                String.fromCharCode(65 + i)
            );
            setRows(rowLabels);
            setSeatsPerRow(seatsPerRowStandard);
            
            // Map sessions data
            const mappedSessions = Array.isArray(sessionsData) ? sessionsData
                .filter(session => {
                    const sessionDate = new Date(session.session_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return sessionDate >= today && session.available_seats > 0;
                })
                .map((session) => {
                    const film = filmsData.find(f => f.id === session.film_id);
                    return {
                        id: session.id,
                        name: film?.title || 'فیلم بدون نام',
                        filmTitle: film?.title || 'فیلم بدون نام',
                        filmId: session.film_id,
                        sessionDate: session.session_date,
                        sessionTime: session.start_time,
                        endTime: session.end_time,
                        availableSeats: session.available_seats,
                        price: session.price_per_seat || 0,
                        image: session.image_url || (film?.banner_url || ''),
                        duration: film?.duration_minutes || 0
                    };
                }) : [];
            
            setSessions(mappedSessions);
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReservationDialog = (session) => {
        setSelectedSession(session);
        setSelectedSeats([]);
        setPeopleNames([]);
        setActiveStep(0);
        setReservationDialog(true);
        // All seats are initially available (no occupied seats)
        setOccupiedSeats([]);
    };

    // Helper function to convert row and position to seat number
    const getSeatNumber = (rowIndex, blockIndex, seatInBlock) => {
        const baseNumber = rowIndex * seatsPerRow + 1;
        const seatNumber = blockIndex === 0 
            ? baseNumber + seatInBlock - 1
            : baseNumber + seatsPerBlock + seatInBlock - 1;
        // Only return seat number if it's within the exact capacity
        return seatNumber <= totalSeats ? seatNumber : null;
    };

    // Helper function to check if seat is occupied
    const isSeatOccupied = (seatNumber) => {
        return occupiedSeats.includes(seatNumber);
    };

    const toggleSeat = (seatNumber) => {
        if (isSeatOccupied(seatNumber)) return;
        
        setSelectedSeats((prev) => {
            if (prev.includes(seatNumber)) {
                return prev.filter((s) => s !== seatNumber);
            } else {
                if (prev.length >= selectedSession?.availableSeats) {
                    alert(`فقط ${selectedSession?.availableSeats} صندلی در دسترس است`);
                    return prev;
                }
                return [...prev, seatNumber];
            }
        });
    };

    const handleNext = () => {
        if (activeStep === 0) {
            if (!selectedSession) {
                alert('لطفاً یک جلسه را انتخاب کنید');
                return;
            }
        } else if (activeStep === 1) {
            if (selectedSeats.length === 0) {
                alert('لطفاً حداقل یک صندلی انتخاب کنید');
                return;
            }
            setPeopleNames(Array(selectedSeats.length).fill(''));
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleNameChange = (index, value) => {
        const newNames = [...peopleNames];
        newNames[index] = value;
        setPeopleNames(newNames);
    };

    const handleAddToCart = () => {
        if (peopleNames.some(name => !name.trim())) {
            alert('لطفاً نام تمام شرکت‌کنندگان را وارد کنید');
            return;
        }

        const cinemaReservation = {
            id: `cinema-${selectedSession.id}-${Date.now()}`,
            type: 'cinema',
            name: `رزرو سینما: ${selectedSession.name}`,
            filmTitle: selectedSession.name,
            sessionId: selectedSession.id,
            sessionDate: selectedSession.sessionDate,
            sessionTime: selectedSession.sessionTime,
            selectedSeats: selectedSeats.sort((a, b) => a - b),
            peopleNames: peopleNames,
            quantity: selectedSeats.length,
            price: selectedSession.price * selectedSeats.length
        };

        addToCart(cinemaReservation);
        alert('رزرو سینما به سبد خرید اضافه شد');
        setReservationDialog(false);
        setActiveStep(0);
    };

    const getSeatStatus = (seatNumber) => {
        if (isSeatOccupied(seatNumber)) return 'occupied';
        if (selectedSeats.includes(seatNumber)) return 'selected';
        return 'available';
    };

    const getSeatColor = (status) => seatColors[status] || seatColors.available;

    if (loading) {
        return (
            <Box sx={{ 
                bgcolor: 'var(--color-secondary)', 
                minHeight: '100vh', 
                py: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: 'var(--color-secondary)', minHeight: '100vh', py: 6, direction: 'rtl' }}>
            <Container>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--color-primary)', textAlign: 'right' }}>
                    رزرو سینما
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {sessions.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                هیچ جلسه سینمایی برای رزرو وجود ندارد
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {sessions.map((session) => (
                            <Grid item xs={12} md={6} key={session.id}>
                                <Card>
                                    {session.image && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={session.image.startsWith('/') ? `${apiBaseUrl}${session.image}` : session.image}
                                            alt={session.name}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            {session.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            تاریخ: {new Date(session.sessionDate).toLocaleDateString('fa-IR')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ساعت: {session.sessionTime}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            صندلی‌های موجود: {session.availableSeats}
                                        </Typography>
                                        {session.duration > 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                مدت زمان: {Math.floor(session.duration / 60)} ساعت و {session.duration % 60} دقیقه
                                            </Typography>
                                        )}
                                        <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'var(--color-primary)' }}>
                                            {session.price?.toLocaleString()} تومان (هر صندلی)
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleOpenReservationDialog(session)}
                                            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
                                        >
                                            رزرو صندلی
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Reservation Dialog with Seat Selection */}
                <Dialog open={reservationDialog} onClose={() => {
                    setReservationDialog(false);
                    setActiveStep(0);
                }} maxWidth="lg" fullWidth>
                    <DialogTitle>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            رزرو سینما: {selectedSession?.name}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {/* Step 1: Session Info */}
                        {activeStep === 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Card sx={{ p: 2, bgcolor: 'var(--color-accent-soft)' }}>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>فیلم:</strong> {selectedSession?.name}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>تاریخ:</strong> {selectedSession?.sessionDate && new Date(selectedSession.sessionDate).toLocaleDateString('fa-IR')}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>ساعت:</strong> {selectedSession?.sessionTime}
                                        {selectedSession?.endTime && ` - ${selectedSession.endTime}`}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>صندلی‌های موجود:</strong> {selectedSession?.availableSeats}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>قیمت هر صندلی:</strong> {selectedSession?.price?.toLocaleString()} تومان
                                    </Typography>
                                </Card>
                            </Box>
                        )}

                        {/* Step 2: Seat Selection */}
                        {activeStep === 1 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                                    صندلی خود را انتخاب کنید
                                </Typography>
                                
                                {/* Screen */}
                                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{
                                        width: '70%',
                                        height: 40,
                                        bgcolor: 'var(--color-surface)',
                                        border: '2px solid var(--color-border)',
                                        borderRadius: '4px 4px 0 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography variant="body2" color="text.secondary">
                                            صفحه نمایش
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Seat Map */}
                                <Box sx={{ 
                                    mb: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    alignItems: 'center',
                                    maxHeight: '400px',
                                    overflowY: 'auto'
                                }}>
                                    {rows.map((row) => (
                                        <Box key={row} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                                                {row}
                                            </Typography>
                                            {/* Left Block */}
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {Array.from({ length: 4 }).map((_, idx) => {
                                                    const rowIndex = rows.indexOf(row);
                                                    const seatNumber = getSeatNumber(rowIndex, 0, idx + 1);
                                                    if (!seatNumber || seatNumber > totalSeats) return null;
                                                    const status = getSeatStatus(seatNumber);
                                                    const color = getSeatColor(status);
                                                    
                                                    return (
                                                        <Box
                                                            key={`${row}-left-${idx}`}
                                                            onClick={() => toggleSeat(seatNumber)}
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                bgcolor: color,
                                                                borderRadius: '4px 12px 12px 4px',
                                                                cursor: status === 'occupied' ? 'not-allowed' : 'pointer',
                                                                border: status === 'selected' ? '2px solid var(--color-accent)' : 'none',
                                                                transition: 'all 0.2s',
                                                                transform: 'rotate(90deg)',
                                                                '&:hover': status !== 'occupied' ? {
                                                                    transform: 'rotate(90deg) scale(1.1)',
                                                                    boxShadow: '0 3px 12px rgba(57,80,53,0.18)'
                                                                } : {}
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                            <Box sx={{ width: 24 }} />
                                            {/* Right Block */}
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {Array.from({ length: 4 }).map((_, idx) => {
                                                    const rowIndex = rows.indexOf(row);
                                                    const seatNumber = getSeatNumber(rowIndex, 1, idx + 1);
                                                    if (!seatNumber || seatNumber > totalSeats) return null;
                                                    const status = getSeatStatus(seatNumber);
                                                    const color = getSeatColor(status);
                                                    
                                                    return (
                                                        <Box
                                                            key={`${row}-right-${idx}`}
                                                            onClick={() => toggleSeat(seatNumber)}
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                bgcolor: color,
                                                                borderRadius: '4px 12px 12px 4px',
                                                                cursor: status === 'occupied' ? 'not-allowed' : 'pointer',
                                                                border: status === 'selected' ? '2px solid var(--color-accent)' : 'none',
                                                                transition: 'all 0.2s',
                                                                transform: 'rotate(90deg)',
                                                                '&:hover': status !== 'occupied' ? {
                                                                    transform: 'rotate(90deg) scale(1.1)',
                                                                    boxShadow: '0 3px 12px rgba(57,80,53,0.18)'
                                                                } : {}
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Legend */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 20, height: 20, bgcolor: seatColors.available, borderRadius: 1 }} />
                                        <Typography variant="caption">آزاد</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 20, height: 20, bgcolor: seatColors.selected, borderRadius: 1 }} />
                                        <Typography variant="caption">انتخاب شده</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 20, height: 20, bgcolor: seatColors.occupied, borderRadius: 1 }} />
                                        <Typography variant="caption">اشغال شده</Typography>
                                    </Box>
                                </Box>

                                {selectedSeats.length > 0 && (
                                    <Box sx={{ p: 2, bgcolor: 'var(--color-accent-soft)', borderRadius: 2, mt: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            صندلی‌های انتخاب شده: {selectedSeats.sort((a, b) => a - b).join(', ')}
                                        </Typography>
                                        <Typography variant="h6" color="var(--color-primary)">
                                            مجموع: {(selectedSession?.price * selectedSeats.length)?.toLocaleString()} تومان
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Step 3: Attendee Names */}
                        {activeStep === 2 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    اطلاعات شرکت‌کنندگان ({selectedSeats.length} نفر)
                                </Typography>
                                {selectedSeats.sort((a, b) => a - b).map((seatNumber, index) => (
                                    <TextField
                                        key={seatNumber}
                                        label={`نام صندلی ${seatNumber}`}
                                        value={peopleNames[index] || ''}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        fullWidth
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                ))}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ direction: 'rtl', p: 2 }}>
                        <Button onClick={() => {
                            setReservationDialog(false);
                            setActiveStep(0);
                        }}>
                            انصراف
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        {activeStep > 0 && (
                            <Button onClick={handleBack}>
                                قبلی
                            </Button>
                        )}
                        {activeStep < 2 ? (
                            <Button variant="contained" onClick={handleNext} sx={{ bgcolor: 'var(--color-primary)' }}>
                                بعدی
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleAddToCart}
                                sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
                            >
                                افزودن به سبد خرید
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default CinemaBooking;