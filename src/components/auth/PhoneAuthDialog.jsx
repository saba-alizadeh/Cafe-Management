import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    InputAdornment,
    Alert,
    CircularProgress
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const FIXED_OTP = '123456';

const PhoneAuthDialog = ({ open, onClose, onAuthenticated, onNewUser = null }) => {
    const { login, setAuthToken, apiBaseUrl } = useAuth();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1 = phone, 2 = otp
    const [error, setError] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);

    const resetState = () => {
        setPhone('');
        setOtp('');
        setStep(1);
        setError('');
        setSubmitting(false);
        setIsNewUser(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (step === 1) {
            if (!phone.trim()) {
                setError('لطفاً شماره همراه را وارد کنید.');
                return;
            }

            setSubmitting(true);
            setError('');

            try {
                // Call POST /api/auth/login to send SMS
                const response = await fetch(`${apiBaseUrl}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: phone.trim()
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'خطا در ارسال کد. دوباره تلاش کنید.');
                    setSubmitting(false);
                    return;
                }

                // Successfully sent SMS code
                setStep(2);
                setSubmitting(false);
            } catch (err) {
                setError('خطا در ارتباط با سرور. دوباره تلاش کنید.');
                setSubmitting(false);
                console.error('Login error:', err);
            }
            return;
        }

        // Step 2: verify OTP
        if (!otp.trim()) {
            setError('لطفاً کد یکبار مصرف را وارد کنید.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Call endpoint to verify OTP and get JWT
            const response = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone.trim(),
                    code: otp.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'کد نادرست است.');
                setSubmitting(false);
                return;
            }

            // Successful verification
            const { token, isNewUser: isNew, user } = data;

            // Store JWT
            setAuthToken(token);

            // Check if new user
            if (isNew) {
                setIsNewUser(true);
                login(user || { phone: phone.trim(), role: 'customer' }, true);
                if (onNewUser) {
                    onNewUser(user || { phone: phone.trim() });
                }
            } else {
                login(user || { phone: phone.trim(), role: 'customer' }, false);
                if (onAuthenticated) {
                    onAuthenticated(user || { phone: phone.trim() });
                }
            }

            resetState();
            onClose();
        } catch (err) {
            setError('خطا در تایید کد. دوباره تلاش کنید.');
            console.error('OTP verification error:', err);
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        resetState();
        onClose();
    };

    const dialogTitle = step === 1 ? 'ورود و ثبت نام' : 'تایید کد یکبار مصرف';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: 'var(--shadow-soft)',
                    backgroundColor: 'var(--color-surface)'
                }
            }}
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ direction: 'rtl' }}>
                <DialogTitle sx={{ textAlign: 'right', pb: 1 }}>
                    {dialogTitle}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {step === 1 ? (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'right' }}>
                                برای ادامه، لطفاً شماره همراه خود را وارد کنید.
                            </Typography>
                            <TextField
                                autoFocus
                                fullWidth
                                label="شماره همراه"
                                placeholder="9120000000"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value.replace(/[^0-9]/g, ''));
                                    if (error) setError('');
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            +98
                                        </InputAdornment>
                                    )
                                }}
                                helperText="شماره موبایل را بدون صفر وارد کنید."
                                type="tel"
                                margin="dense"
                                disabled={submitting}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'right' }}>
                                کد یکبار مصرف برای شما ارسال شد. برای تست، کد <strong>123456</strong> را وارد کنید.
                            </Typography>
                            <TextField
                                autoFocus
                                fullWidth
                                label="کد یکبار مصرف"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/[^0-9]/g, ''));
                                    if (error) setError('');
                                }}
                                helperText={error || 'کد ۶ رقمی ارسال شده را وارد کنید.'}
                                error={Boolean(error)}
                                type="tel"
                                margin="dense"
                                disabled={submitting}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
                    <Button
                        onClick={handleClose}
                        color="inherit"
                        sx={{
                            borderRadius: 999,
                            px: 3
                        }}
                        disabled={submitting}
                    >
                        انصراف
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {submitting && <CircularProgress size={20} />}
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
                            disabled={submitting || (step === 1 ? !phone.trim() : !otp.trim())}
                        >
                            {step === 1 ? 'ارسال کد' : 'تایید و ادامه'}
                        </Button>
                    </Box>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default PhoneAuthDialog;


