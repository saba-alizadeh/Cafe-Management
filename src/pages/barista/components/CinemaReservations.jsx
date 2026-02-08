import ReservationListSection from '../../admin/components/ReservationListSection';
import { Box, Typography } from '@mui/material';

const CinemaReservations = () => (
    <Box sx={{ direction: 'rtl' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>رزروهای سینما</Typography>
        <ReservationListSection
            reservationType="cinema"
            typeLabel="سینما"
            getResourceInfo={(r) => `سینما - جلسه ${r.session_id || ''} | صندلی‌ها: ${(r.seat_numbers || []).join(', ') || '-'}`}
        />
    </Box>
);

export default CinemaReservations;
