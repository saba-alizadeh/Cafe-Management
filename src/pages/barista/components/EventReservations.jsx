import ReservationListSection from '../../admin/components/ReservationListSection';
import { Box, Typography } from '@mui/material';

const EventReservations = () => (
    <Box sx={{ direction: 'rtl' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>رزروهای رویدادها</Typography>
        <ReservationListSection
            reservationType="event"
            typeLabel="رویدادها"
            getResourceInfo={(r) => `رویداد ${r.event_id || ''} - جلسه ${r.session_id || ''}`}
        />
    </Box>
);

export default EventReservations;
