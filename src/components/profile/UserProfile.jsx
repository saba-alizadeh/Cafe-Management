import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Typography,
    Grid,
    Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        details: ''
    });
    const [saving, setSaving] = useState(false);

    const storageKey = `cafeUserProfile_${user?.role || 'guest'}`;

    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProfile((prev) => ({ ...prev, ...parsed }));
            } catch {
                // ignore malformed data
            }
        } else if (user?.phone) {
            setProfile((prev) => ({ ...prev, phone: user.phone }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    const handleChange = (field) => (event) => {
        setProfile((prev) => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setSaving(true);

        localStorage.setItem(storageKey, JSON.stringify(profile));

        // Also keep the auth user in sync with profile info
        if (user) {
            login({
                ...user,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone || user.phone,
                address: profile.address
            });
        }

        setTimeout(() => {
            setSaving(false);
        }, 300);
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Typography variant="h4" gutterBottom>
                پروفایل کاربری
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                اطلاعات شخصی خود را برای تجربه بهتر در سامانه تکمیل کنید.
            </Typography>

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
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="نام خانوادگی"
                                value={profile.lastName}
                                onChange={handleChange('lastName')}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="شماره همراه"
                                value={profile.phone}
                                onChange={handleChange('phone')}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="آدرس"
                                value={profile.address}
                                onChange={handleChange('address')}
                                margin="normal"
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
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
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


