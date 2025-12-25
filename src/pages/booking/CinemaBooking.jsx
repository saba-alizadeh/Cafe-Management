import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, CircularProgress, Alert } from '@mui/material';
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
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [totalSeats, setTotalSeats] = useState(64); // Default value
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rows, setRows] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    const [seatsPerRow, setSeatsPerRow] = useState(8);
    const sessionTime = '09:15 AM';
    const pricePerSeat = 150000; // 150,000 Toman
    const { user, apiBaseUrl, token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const seatsPerBlock = 4;

    useEffect(() => {
        fetchCinemaCapacity();
    }, []);

    const fetchCinemaCapacity = async () => {
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
            
            // Use the selected café's cinema capacity if available
            // Otherwise, use a default value
            const cafe = selectedCafe;
            let capacity = cafe?.cinema_seating_capacity || 64; // Default cinema capacity
            
            if (capacity) {
                setTotalSeats(capacity);
                
                // Calculate rows and seats per row dynamically
                // Try to create a reasonable grid layout
                const calculatedSeatsPerRow = Math.ceil(Math.sqrt(capacity));
                const calculatedRows = Math.ceil(capacity / calculatedSeatsPerRow);
                
                // Generate row labels (A, B, C, etc.)
                const rowLabels = Array.from({ length: calculatedRows }, (_, i) => 
                    String.fromCharCode(65 + i)
                );
                
                setRows(rowLabels);
                setSeatsPerRow(calculatedSeatsPerRow);
            }
        } catch (err) {
            console.error(err);
            setError('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    // Generate occupied seats (some scattered throughout) - using seat numbers
    const occupiedSeatNumbers = [1, 2, 3, 9, 10, 19, 25, 28, 34, 41, 43];

    // Helper function to convert row and position to seat number
    const getSeatNumber = (rowIndex, blockIndex, seatInBlock) => {
        const baseNumber = rowIndex * seatsPerRow + 1;
        return blockIndex === 0 
            ? baseNumber + seatInBlock - 1
            : baseNumber + seatsPerBlock + seatInBlock - 1;
    };

    // Helper function to check if seat is occupied
    const isSeatOccupied = (seatNumber) => {
        return occupiedSeatNumbers.includes(seatNumber);
    };

    const toggleSeat = (seatNumber) => {
        // Don't allow selection of occupied seats
        if (isSeatOccupied(seatNumber)) return;
        
        setSelectedSeats((prev) =>
            prev.includes(seatNumber) 
                ? prev.filter((s) => s !== seatNumber) 
                : [...prev, seatNumber]
        );
    };

    const getSeatStatus = (seatNumber) => {
        if (isSeatOccupied(seatNumber)) return 'occupied';
        if (selectedSeats.includes(seatNumber)) return 'selected';
        return 'available';
    };

    const getSeatColor = (status) => seatColors[status] || seatColors.available;

    const totalPrice = selectedSeats.length * pricePerSeat;
    const selectedSeatNumbers = [...selectedSeats].sort((a, b) => a - b);

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
        <Box sx={{ 
            bgcolor: 'var(--color-secondary)', 
            minHeight: '100vh', 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Container maxWidth="md" sx={{ width: '100%' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                
                {/* Order Successful Banner */}
                <Box sx={{
                    bgcolor: 'var(--color-primary)',
                    color: 'var(--color-secondary)',
                    textAlign: 'center',
                    py: 1.5,
                    mb: 3,
                    borderRadius: 1,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }}>
                    سفارش موفق
                </Box>

                {/* Main Heading */}
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 2, 
                        textAlign: 'center',
                        color: 'var(--color-primary)',
                        fontSize: '1.75rem'
                    }}
                >
                    صندلی خود را با کلیک روی صندلی‌های موجود انتخاب کنید
                </Typography>

                {/* Session Time */}
                <Typography 
                    variant="body1" 
                    sx={{ 
                        textAlign: 'center', 
                        mb: 4,
                        color: 'var(--color-primary)',
                        fontSize: '1rem'
                    }}
                >
                    زمان جلسه: {sessionTime}
                </Typography>

                {/* Screen Representation */}
                <Box sx={{ 
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Box sx={{
                        width: '70%',
                        height: 40,
                        bgcolor: 'var(--color-surface)',
                        border: '2px solid var(--color-border)',
                        position: 'relative',
                        borderRadius: '4px 4px 0 0',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -2,
                            left: '-10%',
                            width: '120%',
                            height: 40,
                            bgcolor: 'var(--color-secondary)',
                            clipPath: 'polygon(0% 100%, 10% 0%, 90% 0%, 100% 100%)',
                            zIndex: -1,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }
                    }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                textAlign: 'center', 
                                pt: 1,
                                color: 'var(--color-primary)',
                                fontSize: '0.875rem'
                            }}
                        >
                            صفحه نمایش
                        </Typography>
                    </Box>
                </Box>

                {/* Seat Map */}
                <Box sx={{ 
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    alignItems: 'center'
                }}>
                    {rows.map((row) => (
                        <Box 
                            key={row} 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1,
                                mb: 0.5
                            }}
                        >
                            {/* Left Block */}
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 0.5
                            }}>
                                {Array.from({ length: seatsPerBlock }).map((_, idx) => {
                                    const rowIndex = rows.indexOf(row);
                                    const seatInBlock = idx + 1;
                                    const seatNumber = getSeatNumber(rowIndex, 0, seatInBlock);
                                    const status = getSeatStatus(seatNumber);
                                    const color = getSeatColor(status);
                                    
                                    return (
                                        <Box
                                            key={`${row}-left-${seatInBlock}`}
                                            onClick={() => toggleSeat(seatNumber)}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: color,
                                                borderRadius: '4px 12px 12px 4px',
                                                cursor: status === 'occupied' ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
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

                            {/* Aisle Spacing */}
                            <Box sx={{ width: 24 }} />

                            {/* Right Block */}
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 0.5
                            }}>
                                {Array.from({ length: seatsPerBlock }).map((_, idx) => {
                                    const rowIndex = rows.indexOf(row);
                                    const seatInBlock = idx + 1;
                                    const seatNumber = getSeatNumber(rowIndex, 1, seatInBlock);
                                    const status = getSeatStatus(seatNumber);
                                    const color = getSeatColor(status);
                                    
                                    return (
                                        <Box
                                            key={`${row}-right-${seatInBlock}`}
                                            onClick={() => toggleSeat(seatNumber)}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: color,
                                                borderRadius: '4px 12px 12px 4px',
                                                cursor: status === 'occupied' ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
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

                {/* Color Legend */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 3,
                    mb: 4,
                    flexWrap: 'wrap'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            bgcolor: seatColors.available,
                            borderRadius: 1
                        }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            موجود
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            bgcolor: seatColors.recommended,
                            borderRadius: 1
                        }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            توصیه شده
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            bgcolor: seatColors.selected,
                            borderRadius: 1
                        }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            انتخاب شده
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            bgcolor: seatColors.occupied,
                            borderRadius: 1
                        }} />
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            اشغال
                        </Typography>
                    </Box>
                </Box>

                {/* Booking Summary */}
                <Typography 
                    variant="body1" 
                    sx={{ 
                        textAlign: 'center', 
                        mb: 3,
                        color: 'var(--color-primary)',
                        fontSize: '1rem'
                    }}
                >
                    شما انتخاب کردید{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                        {selectedSeats.length}
                    </span>
                    {' '}صندلی:{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                        {selectedSeatNumbers.join(', ') || '-'}
                    </span>
                    {' '}به قیمت{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                        {totalPrice.toLocaleString('fa-IR')} تومان
                    </span>
                </Typography>

                {/* Reserve Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        disabled={selectedSeats.length === 0}
                        onClick={() => {
                            if (selectedSeats.length > 0) {
                                const cinemaReservation = {
                                    id: `cinema-${Date.now()}`,
                                    type: 'cinema',
                                    name: `رزرو سینما - صندلی‌های ${selectedSeatNumbers.join(', ')}`,
                                    seats: selectedSeatNumbers.join(', '),
                                    sessionTime,
                                    quantity: 1,
                                    price: totalPrice
                                };
                                addToCart(cinemaReservation);
                                alert('رزرو سینما به سبد خرید اضافه شد');
                                navigate(-1); // Go back to previous page
                            }
                        }}
                        sx={{
                            bgcolor: 'var(--color-accent)',
                            color: 'var(--color-secondary)',
                            fontWeight: 'bold',
                            px: 6,
                            py: 1.5,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                                bgcolor: 'var(--color-accent)'
                            },
                            '&:disabled': {
                                bgcolor: 'var(--color-accent-soft)',
                                color: 'var(--color-muted)'
                            }
                        }}
                    >
                        رزرو کنید
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CinemaBooking;