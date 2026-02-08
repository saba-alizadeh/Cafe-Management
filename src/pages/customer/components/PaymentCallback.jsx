import { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { apiBaseUrl, token } = useAuth();
    const [status, setStatus] = useState('loading'); // loading | success | failed
    const [message, setMessage] = useState('');

    useEffect(() => {
        const authority = searchParams.get('Authority');
        const zarinpalStatus = searchParams.get('Status');

        if (!authority) {
            setStatus('failed');
            setMessage('پارامترهای بازگشتی از درگاه پرداخت یافت نشد');
            return;
        }

        const verify = async () => {
            const authToken = token || localStorage.getItem('authToken');
            if (!authToken) {
                setStatus('failed');
                setMessage('لطفاً ابتدا وارد شوید');
                return;
            }
            try {
                const url = `${apiBaseUrl}/payments/verify?authority=${encodeURIComponent(authority)}${zarinpalStatus ? `&status=${encodeURIComponent(zarinpalStatus)}` : ''}`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const data = await res.json();
                if (data.success) {
                    setStatus('success');
                    setMessage(data.message || 'پرداخت با موفقیت انجام شد');
                } else {
                    setStatus('failed');
                    setMessage(data.message || 'پرداخت ناموفق بود');
                }
            } catch (err) {
                setStatus('failed');
                setMessage(err.message || 'خطا در تایید پرداخت');
            }
        };

        verify();
    }, [searchParams, apiBaseUrl, token]);

    return (
        <Box sx={{ direction: 'rtl', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <Container maxWidth="sm">
                {status === 'loading' && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={48} sx={{ mb: 2 }} />
                        <Typography>در حال تایید پرداخت...</Typography>
                    </Box>
                )}
                {status === 'success' && (
                    <Alert
                        severity="success"
                        icon={<CheckCircle />}
                        sx={{ mb: 2 }}
                        action={
                            <Button color="inherit" size="small" onClick={() => navigate('/customer/cart')}>
                                بازگشت به سبد خرید
                            </Button>
                        }
                    >
                        <Typography variant="h6">{message}</Typography>
                    </Alert>
                )}
                {status === 'failed' && (
                    <Alert
                        severity="error"
                        icon={<ErrorIcon />}
                        sx={{ mb: 2 }}
                        action={
                            <Button color="inherit" size="small" onClick={() => navigate('/customer/cart')}>
                                بازگشت به سبد خرید
                            </Button>
                        }
                    >
                        <Typography variant="h6">{message}</Typography>
                    </Alert>
                )}
            </Container>
        </Box>
    );
};

export default PaymentCallback;
