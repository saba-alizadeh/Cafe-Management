import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    InputAdornment
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const FIXED_OTP = '123456';

const PhoneAuthDialog = ({ open, onClose, onAuthenticated, onNewUser = null }) => {
    const { login, setUnloggedPhone } = useAuth();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1 = phone, 2 = otp
    const [error, setError] = useState('');
    const [isNewUser, setIsNewUser] = useState(false); // Track if this is a new user

    const resetState = () => {
        setPhone('');
        setOtp('');
        setStep(1);
        setError('');
        setSubmitting(false);
        setIsNewUser(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (step === 1) {
            if (!phone.trim()) {
                return;
            }

            // Simulate sending OTP
            setSubmitting(true);
            setTimeout(() => {
                setSubmitting(false);
                setStep(2);
            }, 400);
            return;
        }

        // Step 2: verify OTP
        if (!otp.trim()) {
            setError('لطفاً کد یکبار مصرف را وارد کنید.');
            return;
        }

        if (otp.trim() !== FIXED_OTP) {
            setError('کد وارد شده نادرست است. برای تست، از 123456 استفاده کنید.');
            return;
        }

        setSubmitting(true);

        // Mock: Check if user exists (for demo, assume new user if odd phone number)
        const phoneNumber = parseInt(phone);
        const mockIsNewUser = phoneNumber % 2 === 1;
        setIsNewUser(mockIsNewUser);

        const userData = {
            id: Date.now(),
            role: 'customer',
            phone: phone.trim(),
            name: phone.trim()
        };

        if (mockIsNewUser) {
            // New user - will be redirected to profile
            login(userData, true);
            if (onNewUser) {
                onNewUser(userData);
            }
        } else {
            // Existing user, not logged in yet
            login(userData, false);
            setUnloggedPhone(phone.trim());
            if (onAuthenticated) {
                onAuthenticated(userData);
            }
        }

        resetState();
        onClose();
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
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
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
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default PhoneAuthDialog;


