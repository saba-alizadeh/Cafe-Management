import { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, TextField, Table, TableHead, TableRow, TableCell,
    TableBody, Button, IconButton, Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, Divider, Select, MenuItem, FormControl, InputLabel, Stack
} from '@mui/material';
import { Add, Edit, Delete, Event, CloudUpload } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getImageUrl } from '../../../utils/imageUtils';

const EventsManagement = () => {
    const { apiBaseUrl, token } = useAuth();
    const [events, setEvents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [eventDialogOpen, setEventDialogOpen] = useState(false);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingSession, setEditingSession] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [eventForm, setEventForm] = useState({
        name: '', description: '', duration_minutes: '', price_per_person: '', image_urls: []
    });
    const [sessionForm, setSessionForm] = useState({
        event_id: '', session_date: '', start_time: '', available_spots: '', price_per_person: ''
    });

    const getToken = () => token || localStorage.getItem('authToken');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
            return;
        }
        try {
            const [eventsRes, sessionsRes] = await Promise.all([
                fetch(`${apiBaseUrl}/events`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                fetch(`${apiBaseUrl}/events/sessions`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            if (!eventsRes.ok || !sessionsRes.ok) {
                throw new Error('خطا در دریافت اطلاعات');
            }
            const eventsData = await eventsRes.json();
            const sessionsData = await sessionsRes.json();
            setEvents(eventsData);
            setSessions(sessionsData);
        } catch (err) {
            setError('خطا در دریافت اطلاعات: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${apiBaseUrl}/events/upload-image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getToken()}`
                },
                body: formData
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(data.detail || data.message || 'خطا در آپلود تصویر');
                setUploadingImage(false);
                return;
            }

            const imageUrl = data.url;
            if (!imageUrl) {
                setError('آدرس فایل بازگشتی نامعتبر است');
                setUploadingImage(false);
                return;
            }

            setEventForm(prev => ({ ...prev, image_urls: [...(prev.image_urls || []), imageUrl] }));
        } catch (err) {
            console.error('Image upload exception:', err);
            setError('خطا در ارتباط با سرور هنگام آپلود تصویر: ' + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleEventSubmit = async () => {
        // Validation
        if (!eventForm.name || !eventForm.duration_minutes || !eventForm.price_per_person) {
            setError('لطفاً تمام فیلدهای الزامی را پر کنید');
            return;
        }
        
        if (!eventForm.image_urls || eventForm.image_urls.length === 0) {
            setError('حداقل یک تصویر الزامی است');
            return;
        }
        
        setSaving(true);
        setError('');
        const authToken = getToken();
        try {
            const url = editingEvent 
                ? `${apiBaseUrl}/events/${editingEvent.id}`
                : `${apiBaseUrl}/events`;
            const method = editingEvent ? 'PUT' : 'POST';
            
            const requestBody = {
                name: eventForm.name,
                description: eventForm.description || null,
                duration_minutes: parseInt(eventForm.duration_minutes),
                price_per_person: parseFloat(eventForm.price_per_person),
                image_urls: eventForm.image_urls
            };
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify(requestBody)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'خطا در ذخیره');
            }
            setSuccess(editingEvent ? 'رویداد بروزرسانی شد' : 'رویداد ایجاد شد');
            setEventDialogOpen(false);
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSessionSubmit = async () => {
        setSaving(true);
        setError('');
        const authToken = getToken();
        try {
            const url = editingSession 
                ? `${apiBaseUrl}/events/sessions/${editingSession.id}`
                : `${apiBaseUrl}/events/sessions`;
            const method = editingSession ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    event_id: sessionForm.event_id,
                    session_date: sessionForm.session_date,
                    start_time: sessionForm.start_time,
                    available_spots: parseInt(sessionForm.available_spots),
                    price_per_person: sessionForm.price_per_person ? parseFloat(sessionForm.price_per_person) : null
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'خطا در ذخیره');
            }
            setSuccess(editingSession ? 'جلسه بروزرسانی شد' : 'جلسه ایجاد شد');
            setSessionDialogOpen(false);
            fetchData();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('آیا از حذف این رویداد مطمئن هستید؟')) return;
        const authToken = getToken();
        try {
            const res = await fetch(`${apiBaseUrl}/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error('خطا در حذف');
            setSuccess('رویداد حذف شد');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm('آیا از حذف این جلسه مطمئن هستید؟')) return;
        const authToken = getToken();
        try {
            const res = await fetch(`${apiBaseUrl}/events/sessions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error('خطا در حذف');
            setSuccess('جلسه حذف شد');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">مدیریت رویدادها</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={fetchData}>
                    بروزرسانی
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">رویدادها</Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />}
                                    onClick={() => {
                                        setEditingEvent(null);
                                        setEventForm({ name: '', description: '', duration_minutes: '', price_per_person: '', image_urls: [] });
                                        setEventDialogOpen(true);
                                    }}>
                                    افزودن رویداد
                                </Button>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>نام</TableCell>
                                        <TableCell>مدت (دقیقه)</TableCell>
                                        <TableCell>قیمت</TableCell>
                                        <TableCell>عملیات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>{event.name}</TableCell>
                                            <TableCell>{event.duration_minutes}</TableCell>
                                            <TableCell>{event.price_per_person.toLocaleString()} تومان</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <IconButton size="small" onClick={() => {
                                                        setEditingEvent(event);
                                                        setEventForm({
                                                            name: event.name,
                                                            description: event.description || '',
                                                            duration_minutes: event.duration_minutes.toString(),
                                                            price_per_person: event.price_per_person.toString(),
                                                            image_urls: event.image_urls || []
                                                        });
                                                        setEventDialogOpen(true);
                                                    }}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">جلسات رویداد</Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />}
                                    onClick={() => {
                                        setEditingSession(null);
                                        setSessionForm({ event_id: '', session_date: '', start_time: '', available_spots: '', price_per_person: '' });
                                        setSessionDialogOpen(true);
                                    }}>
                                    افزودن جلسه
                                </Button>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>رویداد</TableCell>
                                        <TableCell>تاریخ</TableCell>
                                        <TableCell>ساعت</TableCell>
                                        <TableCell>عملیات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sessions.map((session) => {
                                        const event = events.find(e => e.id === session.event_id);
                                        return (
                                            <TableRow key={session.id}>
                                                <TableCell>{event?.name || session.event_id}</TableCell>
                                                <TableCell>{session.session_date}</TableCell>
                                                <TableCell>{session.start_time}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <IconButton size="small" onClick={() => {
                                                            setEditingSession(session);
                                                            setSessionForm({
                                                                event_id: session.event_id,
                                                                session_date: session.session_date,
                                                                start_time: session.start_time,
                                                                available_spots: session.available_spots.toString(),
                                                                price_per_person: session.price_per_person ? session.price_per_person.toString() : ''
                                                            });
                                                            setSessionDialogOpen(true);
                                                        }}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteSession(session.id)}>
                                                            <Delete />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Event Dialog */}
            <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingEvent ? 'ویرایش رویداد' : 'افزودن رویداد جدید'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="نام رویداد *" value={eventForm.name}
                                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="توضیحات" multiline rows={3} value={eventForm.description}
                                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="مدت (دقیقه) *" type="number" value={eventForm.duration_minutes}
                                onChange={(e) => setEventForm({ ...eventForm, duration_minutes: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="قیمت هر نفر *" type="number" value={eventForm.price_per_person}
                                onChange={(e) => setEventForm({ ...eventForm, price_per_person: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="event-image-upload"
                                type="file"
                                onChange={handleImageUpload}
                                disabled={saving || uploadingImage}
                            />
                            <label htmlFor="event-image-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CloudUpload />}
                                    disabled={saving || uploadingImage}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    {uploadingImage ? 'در حال آپلود...' : 'آپلود تصویر رویداد'}
                                </Button>
                            </label>
                            {eventForm.image_urls && eventForm.image_urls.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    {eventForm.image_urls.map((url, index) => (
                                        <Box key={index} sx={{ mb: 2, textAlign: 'center' }}>
                                            <Box
                                                component="img"
                                                src={getImageUrl(url, apiBaseUrl) || url}
                                                alt={`Event image ${index + 1}`}
                                                sx={{ maxWidth: '100%', maxHeight: 200, mb: 1, borderRadius: 1 }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const newUrls = eventForm.image_urls.filter((_, i) => i !== index);
                                                    setEventForm(prev => ({ ...prev, image_urls: newUrls }));
                                                }}
                                                disabled={saving}
                                            >
                                                حذف تصویر
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEventDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleEventSubmit} variant="contained" disabled={saving}>
                        {saving ? 'در حال ذخیره...' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Session Dialog */}
            <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSession ? 'ویرایش جلسه' : 'افزودن جلسه جدید'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>رویداد *</InputLabel>
                                <Select value={sessionForm.event_id}
                                    onChange={(e) => setSessionForm({ ...sessionForm, event_id: e.target.value })}>
                                    {events.map(event => (
                                        <MenuItem key={event.id} value={event.id}>{event.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="تاریخ *" type="date" value={sessionForm.session_date}
                                onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="ساعت شروع *" type="time" value={sessionForm.start_time}
                                onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="ظرفیت موجود *" type="number" value={sessionForm.available_spots}
                                onChange={(e) => setSessionForm({ ...sessionForm, available_spots: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="قیمت هر نفر (اختیاری)" type="number" value={sessionForm.price_per_person}
                                onChange={(e) => setSessionForm({ ...sessionForm, price_per_person: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSessionDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleSessionSubmit} variant="contained" disabled={saving}>
                        {saving ? 'در حال ذخیره...' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventsManagement;

