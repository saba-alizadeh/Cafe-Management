import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Card, CardContent, CardMedia, Grid, CircularProgress, Alert, Chip,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Stepper, Step, StepLabel
} from '@mui/material';
import { Movie, Person } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { getImageUrl } from '../../../utils/imageUtils';

const seatColors = {
    selected: 'var(--color-accent)',
    occupied: '#d32f2f',
    available: '#a8c49a',
};

const steps = ['انتخاب جلسه', 'انتخاب صندلی', 'اطلاعات شرکت‌کنندگان'];

const CinemaReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [peopleNames, setPeopleNames] = useState([]);
    const [reservationDialog, setReservationDialog] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [cinemaCapacity, setCinemaCapacity] = useState(64);
    const [rows, setRows] = useState([]);
    const [seatsPerRow, setSeatsPerRow] = useState(8);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
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
            // Fetch user cinema reservations from API
            const res = await fetch(`${apiBaseUrl}/reservations?reservation_type=cinema&cafe_id=${selectedCafe.id}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'خطا در بارگذاری رزروها');
                setLoading(false);
                return;
            }
            
            const reservationsData = await res.json();
            
            // Get cinema capacity from selected café
            if (selectedCafe?.cinema_seating_capacity) {
                setCinemaCapacity(selectedCafe.cinema_seating_capacity);
                // Calculate rows and seats per row
                const calculatedSeatsPerRow = Math.ceil(Math.sqrt(selectedCafe.cinema_seating_capacity));
                const calculatedRows = Math.ceil(selectedCafe.cinema_seating_capacity / calculatedSeatsPerRow);
                const rowLabels = Array.from({ length: calculatedRows }, (_, i) => 
                    String.fromCharCode(65 + i)
                );
                setRows(rowLabels);
                setSeatsPerRow(calculatedSeatsPerRow);
            }
            
            // Map API data to component format
            // Only show completed/Confirmed reservations
            const mappedReservations = Array.isArray(reservationsData) ? reservationsData
                .filter(reservation => {
                    // Only show reservations with completed or Confirmed status
                    const status = reservation.status;
                    return status === 'completed' || status === 'Confirmed';
                })
                .map((reservation) => ({
                    id: reservation.id,
                    name: `رزرو سینما - ${reservation.date}`,
                    sessionId: reservation.session_id,
                    sessionDate: reservation.date,
                    sessionTime: reservation.time,
                    seatNumbers: reservation.seat_numbers || [],
                    attendeeNames: reservation.attendee_names || [],
                    numberOfPeople: reservation.number_of_people,
                    status: reservation.status,
                    notes: reservation.notes
                })) : [];
            
            setReservations(mappedReservations);
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
        // Generate some occupied seats for demo (in real app, this would come from API)
        const totalSeats = cinemaCapacity;
        const occupiedCount = Math.floor(totalSeats * 0.2); // 20% occupied
        const occupied = [];
        for (let i = 0; i < occupiedCount; i++) {
            occupied.push(Math.floor(Math.random() * totalSeats) + 1);
        }
        setOccupiedSeats([...new Set(occupied)]);
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
            // Initialize names array
            setPeopleNames(Array(selectedSeats.length).fill(''));
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const getSeatNumber = (rowIndex, blockIndex, seatInBlock) => {
        const seatsPerBlock = 4;
        const baseNumber = rowIndex * seatsPerRow + 1;
        return blockIndex === 0 
            ? baseNumber + seatInBlock - 1
            : baseNumber + seatsPerBlock + seatInBlock - 1;
    };

    const isSeatOccupied = (seatNumber) => {
        return occupiedSeats.includes(seatNumber);
    };

    const toggleSeat = (seatNumber) => {
        if (isSeatOccupied(seatNumber)) return;
        
        setSelectedSeats((prev) => {
            if (prev.includes(seatNumber)) {
                return prev.filter((s) => s !== seatNumber);
            } else {
                // Limit selection to available seats
                if (prev.length >= selectedSession?.availableSeats) {
                    alert(`فقط ${selectedSession?.availableSeats} صندلی در دسترس است`);
                    return prev;
                }
                return [...prev, seatNumber];
            }
        });
    };

    const getSeatStatus = (seatNumber) => {
        if (isSeatOccupied(seatNumber)) return 'occupied';
        if (selectedSeats.includes(seatNumber)) return 'selected';
        return 'available';
    };

    const getSeatColor = (status) => seatColors[status] || seatColors.available;

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
                    رزروهای سینما
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {reservations.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Movie sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                شما هنوز هیچ رزروی انجام نداده‌اید
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Grid container spacing={3}>
                        {reservations.map((reservation) => (
                            <Grid item xs={12} md={6} key={reservation.id}>
                                <Card>
                                    {reservation.image && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={getImageUrl(reservation.image, apiBaseUrl) || reservation.image}
                                            alt={reservation.name}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2 }}>
                                            {reservation.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            تاریخ: {new Date(reservation.sessionDate).toLocaleDateString('fa-IR')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            ساعت: {reservation.sessionTime}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            صندلی‌های موجود: {reservation.availableSeats}
                                        </Typography>
                                        {reservation.duration > 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                مدت زمان: {Math.floor(reservation.duration / 60)} ساعت و {reservation.duration % 60} دقیقه
                                            </Typography>
                                        )}
                                        <Typography variant="h6" sx={{ mt: 2, mb: 2, color: 'var(--color-primary)' }}>
                                            {reservation.price?.toLocaleString()} تومان (هر صندلی)
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => handleOpenReservationDialog(reservation)}
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

                {/* Reservation Dialog */}
                <Dialog open={reservationDialog} onClose={() => setReservationDialog(false)} maxWidth="lg" fullWidth>
                    <DialogTitle>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            رزرو سینما: {selectedSession?.name}
                        </Typography>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </DialogTitle>
                    <DialogContent>
                        {/* Step 1: Session Selection */}
                        {activeStep === 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    جلسه انتخاب شده:
                                </Typography>
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
                            <Box sx={{ mt: 3 }}>
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
                                                    if (seatNumber > cinemaCapacity) return null;
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
                                                                '&:hover': status !== 'occupied' ? {
                                                                    transform: 'scale(1.1)',
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
                                                    if (seatNumber > cinemaCapacity) return null;
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
                                                                '&:hover': status !== 'occupied' ? {
                                                                    transform: 'scale(1.1)',
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
                            <Box sx={{ mt: 3 }}>
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
                                        InputProps={{
                                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                        }}
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
                        {activeStep < steps.length - 1 ? (
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

export default CinemaReservations;

