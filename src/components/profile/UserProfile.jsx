import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Typography,
    Grid,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
    const { user, login, token, fetchUserProfile, apiBaseUrl } = useAuth();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        details: ''
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Load user profile from backend if authenticated
        const loadProfile = async () => {
            setLoading(true);
            setError('');

            if (token && token !== 'local-sample-token') {
                try {
                    // Fetch fresh user profile from backend
                    const response = await fetch(`${apiBaseUrl}/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setProfile({
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            phone: userData.phone || '',
                            address: userData.address || '',
                            details: userData.details || ''
                        });
                    } else if (response.status === 401) {
                        setError('جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.');
                    } else {
                        setError('خطا در بارگیری اطلاعات پروفایل.');
                    }
                } catch (err) {
                    console.error('Error loading profile:', err);
                    setError('خطا در ارتباط با سرور.');
                }
            } else if (user) {
                // Fallback if no token but user exists
                setProfile({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    details: user.details || ''
                });
            }

            setLoading(false);
        };

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, apiBaseUrl]);

    const handleChange = (field) => (event) => {
        setProfile((prev) => ({
            ...prev,
            [field]: event.target.value
        }));
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (!token) {
            setError('لطفاً ابتدا وارد شوید.');
            setSaving(false);
            return;
        }

        // Demo/local token: skip backend, just update local state
        if (token === 'local-sample-token') {
            login({
                ...user,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                address: profile.address,
                details: profile.details
            });
            setSuccess('اطلاعات شما به صورت محلی ذخیره شد (توکن آزمایشی).');
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
            return;
        }

        try {
            // Send profile update to backend
            const response = await fetch(`${apiBaseUrl}/auth/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });

            // Try to parse JSON safely (backend may return empty body on errors)
            let data = {};
            try {
                const text = await response.text();
                if (text) {
                    data = JSON.parse(text);
                }
            } catch (parseErr) {
                console.warn('Profile update parse warning:', parseErr);
            }

            if (!response.ok) {
                setError(data.message || data.detail || 'خطا در ذخیره اطلاعات.');
                setSaving(false);
                return;
            }

            // Update local user state
            if (user) {
                login({
                    ...user,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phone: profile.phone,
                    address: profile.address,
                    details: profile.details
                });
            }

            setSuccess('اطلاعات شما با موفقیت ذخیره شد.');
            setSaving(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('خطا در ارتباط با سرور.');
            console.error('Error updating profile:', err);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Typography variant="h4" gutterBottom>
                پروفایل کاربری
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                اطلاعات شخصی خود را برای تجربه بهتر در سامانه تکمیل کنید.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-soft)'
                }}
            >
                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="نام"
                                value={profile.firstName}
                                onChange={handleChange('firstName')}
                                margin="normal"
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="نام خانوادگی"
                                value={profile.lastName}
                                onChange={handleChange('lastName')}
                                margin="normal"
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="شماره همراه"
                                value={profile.phone}
                                onChange={handleChange('phone')}
                                margin="normal"
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="آدرس"
                                value={profile.address}
                                onChange={handleChange('address')}
                                margin="normal"
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="توضیحات تکمیلی"
                                value={profile.details}
                                onChange={handleChange('details')}
                                margin="normal"
                                multiline
                                minRows={3}
                                disabled={saving}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3, gap: 1 }}>
                        {saving && <CircularProgress size={24} />}
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 999,
                                px: 4,
                                backgroundColor: 'var(--color-accent)',
                                '&:hover': {
                                    backgroundColor: 'var(--color-primary)'
                                }
                            }}
                            disabled={saving}
                        >
                            ذخیره اطلاعات
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserProfile;


