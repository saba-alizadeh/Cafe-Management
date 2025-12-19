import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel,
    Divider,
    Stack
} from '@mui/material';
import {
    Business,
    Add,
    Edit,
    Delete,
    LocationOn,
    Phone,
    Email,
    Person,
    Check,
    Close,
    Refresh
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const CafeSettings = () => {
    const { apiBaseUrl, token } = useAuth();
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCafe, setEditingCafe] = useState(null);
    
    // Get token from localStorage as fallback
    const getToken = () => {
        return token || localStorage.getItem('authToken');
    };
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        phone: '',
        email: '',
        details: '',
        hours: '',
        capacity: '',
        wifi_password: '',
        is_active: true,
        has_cinema: false,
        cinema_seating_capacity: '',
        has_coworking: false,
        coworking_capacity: '',
        has_events: false,
        admin_username: '',
        admin_password: '',
        admin_email: '',
        admin_phone: '',
        admin_first_name: '',
        admin_last_name: '',
        admin_national_id: '',
        admin_registration_date: '',
        admin_commitment_image_url: '',
        admin_business_license_image_url: '',
        admin_national_id_image_url: ''
    });
    const [uploadingDocs, setUploadingDocs] = useState({
        commitment: false,
        business_license: false,
        national_id: false
    });

    useEffect(() => {
        const authToken = getToken();
        if (authToken) {
            fetchCafes();
        } else {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
        }
    }, [token, apiBaseUrl]);

    const fetchCafes = async () => {
        setLoading(true);
        setError('');
        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
            return;
        }
        try {
            console.log('Fetching cafes from:', `${apiBaseUrl}/cafes`);
            const res = await fetch(`${apiBaseUrl}/cafes`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('Fetch cafes response status:', res.status);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error('Fetch cafes error:', data);
                setError(data.detail || data.message || 'خطا در بارگذاری کافه‌ها');
                setLoading(false);
                return;
            }
            const data = await res.json();
            console.log('Fetched cafes:', data);
            setCafes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch cafes exception:', err);
            setError('خطا در ارتباط با سرور: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (cafe = null) => {
        if (cafe) {
            setEditingCafe(cafe);
            setFormData({
                name: cafe.name || '',
                location: cafe.location || '',
                phone: cafe.phone || '',
                email: cafe.email || '',
                details: cafe.details || '',
                hours: cafe.hours || '',
                capacity: cafe.capacity || '',
                wifi_password: cafe.wifi_password || '',
                is_active: cafe.is_active !== undefined ? cafe.is_active : true,
                has_cinema: cafe.has_cinema || false,
                cinema_seating_capacity: cafe.cinema_seating_capacity || '',
                has_coworking: cafe.has_coworking || false,
                coworking_capacity: cafe.coworking_capacity || '',
                has_events: cafe.has_events || false,
                admin_username: '',
                admin_password: '',
                admin_email: '',
                admin_phone: '',
                admin_first_name: '',
                admin_last_name: '',
                admin_national_id: '',
                admin_registration_date: '',
                admin_commitment_image_url: '',
                admin_business_license_image_url: '',
                admin_national_id_image_url: ''
            });
        } else {
            setEditingCafe(null);
            setFormData({
                name: '',
                location: '',
                phone: '',
                email: '',
                details: '',
                hours: '',
                capacity: '',
                wifi_password: '',
                is_active: true,
                has_cinema: false,
                cinema_seating_capacity: '',
                has_coworking: false,
                coworking_capacity: '',
                has_events: false,
                admin_username: '',
                admin_password: '',
                admin_email: '',
                admin_phone: '',
                admin_first_name: '',
                admin_last_name: '',
                admin_national_id: '',
                admin_registration_date: '',
                admin_commitment_image_url: '',
                admin_business_license_image_url: '',
                admin_national_id_image_url: ''
            });
        }
        setOpenDialog(true);
        setError('');
        setSuccess('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCafe(null);
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAdminDocUpload = async (event, docType) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            return;
        }

        setError('');
        setSuccess('');
        setUploadingDocs(prev => ({ ...prev, [docType]: true }));

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const res = await fetch(`${apiBaseUrl}/cafes/upload-admin-document?doc_type=${docType}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                body: formDataUpload
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = data.detail || data.message || 'خطا در آپلود تصویر';
                console.error('Admin doc upload error:', msg, data);
                setError(msg);
                return;
            }

            const url = data.url;
            if (!url) {
                setError('آدرس فایل بازگشتی نامعتبر است');
                return;
            }

            setFormData(prev => ({
                ...prev,
                admin_commitment_image_url: docType === 'commitment' ? url : prev.admin_commitment_image_url,
                admin_business_license_image_url: docType === 'business_license' ? url : prev.admin_business_license_image_url,
                admin_national_id_image_url: docType === 'national_id' ? url : prev.admin_national_id_image_url
            }));
        } catch (err) {
            console.error('Admin doc upload exception:', err);
            setError('خطا در ارتباط با سرور هنگام آپلود تصویر: ' + err.message);
        } finally {
            setUploadingDocs(prev => ({ ...prev, [docType]: false }));
        }
    };

    // Helper: trim strings and convert empty to null
    const cleanValue = (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        }
        return value;
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (editingCafe) {
                // Update existing cafe
                if (!formData.name || formData.name.trim() === '') {
                    setError('لطفاً نام کافه را وارد کنید');
                    setSaving(false);
                    return;
                }

                const updateData = {
                    name: formData.name.trim(),
                    location: cleanValue(formData.location),
                    phone: cleanValue(formData.phone),
                    email: cleanValue(formData.email),
                    details: cleanValue(formData.details),
                    hours: cleanValue(formData.hours),
                    capacity: formData.capacity && formData.capacity.trim() !== '' ? parseInt(formData.capacity) : null,
                    wifi_password: cleanValue(formData.wifi_password),
                    is_active: formData.is_active,
                    has_cinema: formData.has_cinema || false,
                    cinema_seating_capacity: formData.has_cinema && formData.cinema_seating_capacity && formData.cinema_seating_capacity.toString().trim() !== '' 
                        ? parseInt(formData.cinema_seating_capacity.toString().trim()) 
                        : null,
                    has_coworking: formData.has_coworking || false,
                    coworking_capacity: formData.has_coworking && formData.coworking_capacity && formData.coworking_capacity.toString().trim() !== '' 
                        ? parseInt(formData.coworking_capacity.toString().trim()) 
                        : null,
                    has_events: formData.has_events || false
                };

                const authToken = getToken();
                if (!authToken) {
                    setError('لطفاً ابتدا وارد سیستم شوید');
                    setSaving(false);
                    return;
                }
                const res = await fetch(`${apiBaseUrl}/cafes/${editingCafe.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify(updateData)
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const errorMsg = data.detail || data.message || JSON.stringify(data) || 'خطا در بروزرسانی کافه';
                    console.error('Update cafe error:', errorMsg, data);
                    setError(errorMsg);
                    setSaving(false);
                    return;
                }

                setSuccess('کافه با موفقیت بروزرسانی شد');
                await fetchCafes();
                setTimeout(() => {
                    handleCloseDialog();
                }, 1500);
            } else {
                // Create new cafe
                if (!formData.name || formData.name.trim() === '') {
                    setError('لطفاً نام کافه را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_username || formData.admin_username.trim() === '') {
                    setError('لطفاً نام کاربری مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_password || formData.admin_password.trim() === '') {
                    setError('لطفاً رمز عبور مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }


                if (!formData.admin_first_name || formData.admin_first_name.trim() === '') {
                    setError('لطفاً نام (کوچک) مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_last_name || formData.admin_last_name.trim() === '') {
                    setError('لطفاً نام خانوادگی مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_phone || formData.admin_phone.trim() === '') {
                    setError('لطفاً شماره همراه مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_email || formData.admin_email.trim() === '') {
                    setError('لطفاً ایمیل مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_national_id || formData.admin_national_id.trim() === '') {
                    setError('لطفاً کد ملی مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_registration_date || formData.admin_registration_date.trim() === '') {
                    setError('لطفاً تاریخ ثبت‌نام مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_commitment_image_url || formData.admin_commitment_image_url.trim() === '') {
                    setError('لطفاً آدرس تصویر تعهدنامه/قرارداد را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_business_license_image_url || formData.admin_business_license_image_url.trim() === '') {
                    setError('لطفاً آدرس تصویر مجوز کسب‌وکار را وارد کنید');
                    setSaving(false);
                    return;
                }

                if (!formData.admin_national_id_image_url || formData.admin_national_id_image_url.trim() === '') {
                    setError('لطفاً آدرس تصویر کارت ملی مدیر را وارد کنید');
                    setSaving(false);
                    return;
                }

                // Validate optional features
                if (formData.has_cinema && (!formData.cinema_seating_capacity || formData.cinema_seating_capacity.toString().trim() === '')) {
                    setError('در صورت فعال بودن سینما، ظرفیت صندلی‌های سینما الزامی است');
                    setSaving(false);
                    return;
                }

                if (formData.has_coworking && (!formData.coworking_capacity || formData.coworking_capacity.toString().trim() === '')) {
                    setError('در صورت فعال بودن فضای همکاری، ظرفیت کل الزامی است');
                    setSaving(false);
                    return;
                }

                // Build request data, ensuring empty strings become null for optional fields
                const requestData = {
                    name: formData.name.trim(),
                    location: cleanValue(formData.location),
                    phone: cleanValue(formData.phone),
                    email: cleanValue(formData.email) || null,
                    details: cleanValue(formData.details),
                    hours: cleanValue(formData.hours),
                    capacity: formData.capacity && formData.capacity.toString().trim() !== '' 
                        ? parseInt(formData.capacity.toString().trim()) 
                        : null,
                    wifi_password: cleanValue(formData.wifi_password),
                    is_active: formData.is_active,
                    has_cinema: formData.has_cinema || false,
                    cinema_seating_capacity: formData.has_cinema && formData.cinema_seating_capacity && formData.cinema_seating_capacity.toString().trim() !== '' 
                        ? parseInt(formData.cinema_seating_capacity.toString().trim()) 
                        : null,
                    has_coworking: formData.has_coworking || false,
                    coworking_capacity: formData.has_coworking && formData.coworking_capacity && formData.coworking_capacity.toString().trim() !== '' 
                        ? parseInt(formData.coworking_capacity.toString().trim()) 
                        : null,
                    has_events: formData.has_events || false,
                    admin_username: formData.admin_username.trim(),
                    admin_password: formData.admin_password,
                    admin_email: cleanValue(formData.admin_email) || null,
                    admin_phone: cleanValue(formData.admin_phone),
                    admin_first_name: formData.admin_first_name.trim(),
                    admin_last_name: formData.admin_last_name.trim(),
                    admin_national_id: formData.admin_national_id.trim(),
                    admin_registration_date: formData.admin_registration_date.trim(),
                    admin_commitment_image_url: cleanValue(formData.admin_commitment_image_url),
                    admin_business_license_image_url: cleanValue(formData.admin_business_license_image_url),
                    admin_national_id_image_url: cleanValue(formData.admin_national_id_image_url)
                };
                
                // Remove null/undefined values for cleaner request (optional)
                Object.keys(requestData).forEach(key => {
                    if (requestData[key] === null || requestData[key] === undefined || requestData[key] === '') {
                        // Keep null for optional fields, but ensure they're explicitly null
                        if (['email', 'admin_email', 'phone', 'admin_phone', 'location', 'details', 'hours', 'wifi_password', 'capacity'].includes(key)) {
                            requestData[key] = null;
                        }
                    }
                });

                const authToken = getToken();
                console.log('Creating cafe with data:', { ...requestData, admin_password: '***' });
                console.log('Token exists:', !!authToken);
                console.log('API Base URL:', apiBaseUrl);

                if (!authToken) {
                    setError('شما وارد سیستم نشده‌اید. لطفاً دوباره وارد شوید.');
                    setSaving(false);
                    return;
                }

                const res = await fetch(`${apiBaseUrl}/cafes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify(requestData)
                });
                
                console.log('Response status:', res.status);
                console.log('Response headers:', Object.fromEntries(res.headers.entries()));

                let data = {};
                try {
                    data = await res.json();
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                    data = { detail: 'خطا در پردازش پاسخ سرور' };
                }
                
                if (!res.ok) {
                    // Handle validation errors
                    let errorMsg = data.detail || data.message;
                    if (data.detail && Array.isArray(data.detail)) {
                        // Pydantic validation errors
                        errorMsg = data.detail.map(err => {
                            const field = err.loc ? err.loc.join('.') : 'field';
                            return `${field}: ${err.msg}`;
                        }).join(', ');
                    } else if (typeof data.detail === 'object' && data.detail !== null && !Array.isArray(data.detail)) {
                        errorMsg = JSON.stringify(data.detail);
                    }
                    errorMsg = errorMsg || JSON.stringify(data) || 'خطا در ایجاد کافه';
                    console.error('Create cafe error:', errorMsg, data, res.status);
                    setError(errorMsg);
                    setSaving(false);
                    return;
                }

                console.log('Cafe created successfully:', data);
                setSuccess('کافه و حساب مدیر با موفقیت ایجاد شد');
                // Close dialog first, then refresh list
                handleCloseDialog();
                // Wait a bit then refresh to ensure backend has processed
                setTimeout(async () => {
                    await fetchCafes();
                }, 500);
            }
        } catch (err) {
            console.error('Network error:', err);
            setError('خطا در ارتباط با سرور: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cafeId) => {
        if (!window.confirm('آیا از حذف این کافه مطمئن هستید؟ حساب مدیر نیز غیرفعال خواهد شد.')) {
            return;
        }

        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            return;
        }
        try {
            const res = await fetch(`${apiBaseUrl}/cafes/${cafeId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.detail || 'حذف کافه ناموفق بود');
                return;
            }

            setSuccess('کافه با موفقیت حذف شد');
            // Refresh the list
            await fetchCafes();
        } catch (err) {
            console.error('Delete cafe error:', err);
            setError('خطا در ارتباط با سرور: ' + err.message);
        }
    };

    const getStatusColor = (isActive) => {
        return isActive ? 'success' : 'error';
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
            <Typography variant="h4" gutterBottom>
                        مدیریت کافه‌ها
            </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        ایجاد و مدیریت کافه‌های متعدد و حساب‌های مدیر مربوطه
                        {cafes.length > 0 && ` (${cafes.length} کافه)`}
            </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchCafes}
                        disabled={loading}
                    >
                        بروزرسانی
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        sx={{ backgroundColor: 'var(--color-accent)' }}
                    >
                        افزودن کافه جدید
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : cafes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        هیچ کافه‌ای ثبت نشده است
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        برای شروع، اولین کافه خود را اضافه کنید
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        افزودن کافه جدید
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>نام کافه</TableCell>
                                <TableCell>موقعیت</TableCell>
                                <TableCell>اطلاعات تماس</TableCell>
                                <TableCell>ساعات کاری</TableCell>
                                <TableCell>ظرفیت</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cafes.map((cafe) => (
                                <TableRow key={cafe.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Business sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body1" fontWeight="medium">
                                                {cafe.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {cafe.location ? (
                                            <Box display="flex" alignItems="center">
                                                <LocationOn sx={{ mr: 0.5, fontSize: 'small', color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {cafe.location}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                تعریف نشده
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            {cafe.phone && (
                                                <Box display="flex" alignItems="center">
                                                    <Phone sx={{ mr: 0.5, fontSize: 'small', color: 'text.secondary' }} />
                                                    <Typography variant="body2">{cafe.phone}</Typography>
                                                </Box>
                                            )}
                                            {cafe.email && (
                                                <Box display="flex" alignItems="center">
                                                    <Email sx={{ mr: 0.5, fontSize: 'small', color: 'text.secondary' }} />
                                                    <Typography variant="body2">{cafe.email}</Typography>
                        </Box>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {cafe.hours || 'تعریف نشده'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {cafe.capacity ? `${cafe.capacity} نفر` : 'تعریف نشده'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={cafe.is_active ? 'فعال' : 'غیرفعال'}
                                            color={getStatusColor(cafe.is_active)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleOpenDialog(cafe)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(cafe.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { direction: 'rtl' } }}
            >
                <DialogTitle>
                    {editingCafe ? 'ویرایش کافه' : 'افزودن کافه جدید'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                اطلاعات کافه
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                label="نام کافه *"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                />
                            </Grid>

                        <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                label="موقعیت"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="تلفن تماس"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ایمیل"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ساعات کاری"
                                name="hours"
                                value={formData.hours}
                                onChange={handleInputChange}
                                placeholder="مثال: ۸:۰۰ الی ۲۳:۳۰"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ظرفیت (نفر)"
                                name="capacity"
                                    type="number"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                />
                            </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="جزئیات"
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                            />
                </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="رمز وای‌فای"
                                name="wifi_password"
                                type="password"
                                value={formData.wifi_password}
                                onChange={handleInputChange}
                                />
                            </Grid>

                        <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        name="is_active"
                                    />
                                }
                                label="فعال"
                                />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                ویژگی‌های اختیاری
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                </Grid>

                        {/* Cinema Feature */}
                            <Grid item xs={12}>
                                <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.has_cinema}
                                        onChange={handleInputChange}
                                        name="has_cinema"
                                    />
                                }
                                label="سینما"
                            />
                        </Grid>
                        {formData.has_cinema && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ظرفیت صندلی‌های سینما *"
                                    name="cinema_seating_capacity"
                                    type="number"
                                    value={formData.cinema_seating_capacity}
                                    onChange={handleInputChange}
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                        )}

                        {/* Co-working Space Feature */}
                            <Grid item xs={12}>
                                <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.has_coworking}
                                        onChange={handleInputChange}
                                        name="has_coworking"
                                    />
                                }
                                label="فضای همکاری (Co-working Space)"
                            />
                        </Grid>
                        {formData.has_coworking && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ظرفیت کل فضای همکاری *"
                                    name="coworking_capacity"
                                    type="number"
                                    value={formData.coworking_capacity}
                                    onChange={handleInputChange}
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                        )}

                        {/* Events Feature */}
                            <Grid item xs={12}>
                                <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.has_events}
                                        onChange={handleInputChange}
                                        name="has_events"
                                    />
                                }
                                label="رویدادها (Events)"
                                />
                            </Grid>

                        {!editingCafe && (
                            <>
                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        اطلاعات حساب مدیر
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        یک حساب مدیر به صورت خودکار برای این کافه ایجاد خواهد شد
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                        label="نام کاربری مدیر *"
                                        name="admin_username"
                                        value={formData.admin_username}
                                        onChange={handleInputChange}
                                        required
                                />
                            </Grid>

                                <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                        label="رمز عبور مدیر *"
                                        name="admin_password"
                                    type="password"
                                        value={formData.admin_password}
                                        onChange={handleInputChange}
                                        required
                                />
                            </Grid>
                                <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                        label="نام (کوچک) مدیر *"
                                        name="admin_first_name"
                                        value={formData.admin_first_name}
                                        onChange={handleInputChange}
                                        required
                                />
                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="نام خانوادگی مدیر *"
                                        name="admin_last_name"
                                        value={formData.admin_last_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="ایمیل مدیر *"
                                        name="admin_email"
                                        type="email"
                                        value={formData.admin_email}
                                        onChange={handleInputChange}
                                        required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="تلفن مدیر *"
                                        name="admin_phone"
                                        value={formData.admin_phone}
                                        onChange={handleInputChange}
                                        required
                                />
                            </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="کد ملی مدیر *"
                                        name="admin_national_id"
                                        value={formData.admin_national_id}
                                        onChange={handleInputChange}
                                        required
                                />
                            </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="تاریخ ثبت‌نام مدیر *"
                                        name="admin_registration_date"
                                        type="date"
                                        value={formData.admin_registration_date}
                                        onChange={handleInputChange}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                />
                </Grid>

                            <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        تصویر تعهدنامه/قرارداد مدیر *
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={uploadingDocs.commitment}
                                    >
                                        {uploadingDocs.commitment ? 'در حال آپلود...' : 'انتخاب و آپلود تصویر'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) => handleAdminDocUpload(e, 'commitment')}
                                        />
                                </Button>
                                    {formData.admin_commitment_image_url && (
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            فایل آپلود شده ثبت شد.
                                        </Typography>
                                    )}
                            </Grid>

                            <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        تصویر مجوز کسب‌وکار *
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={uploadingDocs.business_license}
                                    >
                                        {uploadingDocs.business_license ? 'در حال آپلود...' : 'انتخاب و آپلود تصویر'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) => handleAdminDocUpload(e, 'business_license')}
                                        />
                                </Button>
                                    {formData.admin_business_license_image_url && (
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            فایل آپلود شده ثبت شد.
                                        </Typography>
                                    )}
                </Grid>

                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        تصویر کارت ملی مدیر *
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={uploadingDocs.national_id}
                                    >
                                        {uploadingDocs.national_id ? 'در حال آپلود...' : 'انتخاب و آپلود تصویر'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) => handleAdminDocUpload(e, 'national_id')}
                                        />
                        </Button>
                                    {formData.admin_national_id_image_url && (
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            فایل آپلود شده ثبت شد.
                                        </Typography>
                                    )}
                </Grid>
                            </>
                        )}
            </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={saving}>
                        انصراف
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <Check />}
                    >
                        {saving ? 'در حال ذخیره...' : editingCafe ? 'ذخیره تغییرات' : 'ایجاد کافه'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CafeSettings;
