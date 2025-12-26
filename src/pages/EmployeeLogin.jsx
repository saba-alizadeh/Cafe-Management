import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import { Person, Restaurant } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeLogin = () => {
    const { login, setAuthToken, apiBaseUrl } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`${apiBaseUrl}/auth/employee-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || data.message || 'خطا در ورود. لطفاً دوباره تلاش کنید.');
                setSubmitting(false);
                return;
            }

            if (data.access_token) {
                setAuthToken(data.access_token);
            }

            const user = data.user || {};
            login(user, false);

            // Redirect to waiter/barista panel based on role
            if (user.role === 'barista' || user.role === 'waiter' || user.role === 'floor_staff' || user.role === 'bartender') {
                navigate('/barista');
            } else {
                setError('دسترسی برای این کاربر مجاز نیست.');
            }
        } catch (err) {
            console.error('Employee login error:', err);
            setError('خطا در اتصال به سرور. لطفاً بعداً تلاش کنید.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 6 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-soft)',
                    direction: 'rtl'
                }}
            >
                <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Person fontSize="large" color="primary" />
                    <Typography variant="h5" fontWeight={700} textAlign="center">
                        ورود کارمند
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        با نام کاربری و رمز عبور وارد شوید
                    </Typography>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="نام کاربری"
                        value={form.username}
                        onChange={handleChange('username')}
                        margin="normal"
                        disabled={submitting}
                    />
                    <TextField
                        fullWidth
                        label="رمز عبور"
                        type="password"
                        value={form.password}
                        onChange={handleChange('password')}
                        margin="normal"
                        disabled={submitting}
                    />

                    <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 3 }}>
                        {submitting && <CircularProgress size={22} />}
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 999,
                                px: 4,
                                backgroundColor: 'var(--color-accent)',
                                '&:hover': { backgroundColor: 'var(--color-primary)' }
                            }}
                            disabled={submitting || !form.username.trim() || !form.password.trim()}
                            startIcon={<Restaurant />}
                        >
                            ورود
                        </Button>
                    </Stack>
                </Box>
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                        component={Link}
                        to="/admin-login"
                        sx={{
                            textTransform: 'none',
                            color: 'text.secondary',
                            '&:hover': {
                                color: 'primary.main',
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        ورود مدیر / ادمین
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default EmployeeLogin;
