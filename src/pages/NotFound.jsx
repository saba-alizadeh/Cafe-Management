import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h1" component="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                The page you're looking for doesn't exist.
            </Typography>
            <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
            >
                Go Home
            </Button>
        </Container>
    );
};

export default NotFound;
