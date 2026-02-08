import ReservationListSection from '../../admin/components/ReservationListSection';
import { Box, Typography } from '@mui/material';

const CoworkingReservations = () => (
    <Box sx={{ direction: 'rtl' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>رزروهای فضای مشترک</Typography>
        <ReservationListSection
            reservationType="coworking"
            typeLabel="فضای مشترک"
            getResourceInfo={(r) => `میز اشتراکی ${r.table_id || ''}`}
        />
    </Box>
);

export default CoworkingReservations;
