import React, { useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';

const seatColors = {
    selected: 'var(--color-accent)',
    occupied: 'var(--color-primary)',
    recommended: 'var(--color-accent-soft)',
    available: 'var(--color-secondary)',
};

const CinemaBooking = () => {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const sessionTime = '09:15 AM';
    const pricePerSeat = 10;

    // Create seat grid: 8 rows, 8 columns divided into two blocks (4 columns each)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerBlock = 4;
    const seatsPerRow = seatsPerBlock * 2; // Total seats per row (8)
    const totalSeats = rows.length * seatsPerRow; // 8 rows * 8 seats = 64 total seats

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
                    Order Successful
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
                    Choose your seat by clicking on the available seats
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
                    Session Time: {sessionTime}
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
                            SCREEN
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
                            Available
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
                            Recommended
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
                            Selected
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
                            Occupied
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
                    You have selected{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                        {selectedSeats.length}
                    </span>
                    {' '}seat{selectedSeats.length !== 1 ? 's' : ''}:{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                        {selectedSeatNumbers.join(', ') || '-'}
                    </span>
                    {' '}for the price of{' '}
                    <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                        {totalPrice}€
                    </span>
                </Typography>

                {/* Buy Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        disabled={selectedSeats.length === 0}
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
                        Buy at {totalPrice || 0}€
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default CinemaBooking;