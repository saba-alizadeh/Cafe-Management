import { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, TextField, Table, TableHead, TableRow, TableCell,
    TableBody, Button, IconButton, Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, Chip, Divider, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, Movie } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';

const CinemaManagement = () => {
    const { apiBaseUrl, token } = useAuth();
    const [films, setFilms] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filmDialogOpen, setFilmDialogOpen] = useState(false);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [editingFilm, setEditingFilm] = useState(null);
    const [editingSession, setEditingSession] = useState(null);
    const [filmForm, setFilmForm] = useState({
        title: '', description: '', duration_minutes: '', genre: '', rating: ''
    });
    const [sessionForm, setSessionForm] = useState({
        film_id: '', session_date: '', start_time: '', available_seats: '', price_per_seat: ''
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
            const [filmsRes, sessionsRes] = await Promise.all([
                fetch(`${apiBaseUrl}/cinema/films`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                fetch(`${apiBaseUrl}/cinema/sessions`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            if (!filmsRes.ok || !sessionsRes.ok) {
                throw new Error('خطا در دریافت اطلاعات');
            }
            const filmsData = await filmsRes.json();
            const sessionsData = await sessionsRes.json();
            setFilms(filmsData);
            setSessions(sessionsData);
        } catch (err) {
            setError('خطا در دریافت اطلاعات: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilmSubmit = async () => {
        setSaving(true);
        setError('');
        const authToken = getToken();
        try {
            const url = editingFilm 
                ? `${apiBaseUrl}/cinema/films/${editingFilm.id}`
                : `${apiBaseUrl}/cinema/films`;
            const method = editingFilm ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title: filmForm.title,
                    description: filmForm.description || null,
                    duration_minutes: parseInt(filmForm.duration_minutes),
                    genre: filmForm.genre || null,
                    rating: filmForm.rating || null
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'خطا در ذخیره');
            }
            setSuccess(editingFilm ? 'فیلم بروزرسانی شد' : 'فیلم ایجاد شد');
            setFilmDialogOpen(false);
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
                ? `${apiBaseUrl}/cinema/sessions/${editingSession.id}`
                : `${apiBaseUrl}/cinema/sessions`;
            const method = editingSession ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    film_id: sessionForm.film_id,
                    session_date: sessionForm.session_date,
                    start_time: sessionForm.start_time,
                    available_seats: parseInt(sessionForm.available_seats),
                    price_per_seat: parseFloat(sessionForm.price_per_seat)
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

    const handleDeleteFilm = async (id) => {
        if (!window.confirm('آیا از حذف این فیلم مطمئن هستید؟')) return;
        const authToken = getToken();
        try {
            const res = await fetch(`${apiBaseUrl}/cinema/films/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error('خطا در حذف');
            setSuccess('فیلم حذف شد');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm('آیا از حذف این جلسه مطمئن هستید؟')) return;
        const authToken = getToken();
        try {
            const res = await fetch(`${apiBaseUrl}/cinema/sessions/${id}`, {
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
                <Typography variant="h4">مدیریت سینما</Typography>
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
                                <Typography variant="h6">فیلم‌ها</Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />}
                                    onClick={() => {
                                        setEditingFilm(null);
                                        setFilmForm({ title: '', description: '', duration_minutes: '', genre: '', rating: '' });
                                        setFilmDialogOpen(true);
                                    }}>
                                    افزودن فیلم
                                </Button>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>عنوان</TableCell>
                                        <TableCell>مدت (دقیقه)</TableCell>
                                        <TableCell>عملیات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {films.map((film) => (
                                        <TableRow key={film.id}>
                                            <TableCell>{film.title}</TableCell>
                                            <TableCell>{film.duration_minutes}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => {
                                                    setEditingFilm(film);
                                                    setFilmForm({
                                                        title: film.title,
                                                        description: film.description || '',
                                                        duration_minutes: film.duration_minutes.toString(),
                                                        genre: film.genre || '',
                                                        rating: film.rating || ''
                                                    });
                                                    setFilmDialogOpen(true);
                                                }}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteFilm(film.id)}>
                                                    <Delete />
                                                </IconButton>
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
                                <Typography variant="h6">جلسات فیلم</Typography>
                                <Button size="small" variant="outlined" startIcon={<Add />}
                                    onClick={() => {
                                        setEditingSession(null);
                                        setSessionForm({ film_id: '', session_date: '', start_time: '', available_seats: '', price_per_seat: '' });
                                        setSessionDialogOpen(true);
                                    }}>
                                    افزودن جلسه
                                </Button>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>فیلم</TableCell>
                                        <TableCell>تاریخ</TableCell>
                                        <TableCell>ساعت</TableCell>
                                        <TableCell>عملیات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sessions.map((session) => {
                                        const film = films.find(f => f.id === session.film_id);
                                        return (
                                            <TableRow key={session.id}>
                                                <TableCell>{film?.title || session.film_id}</TableCell>
                                                <TableCell>{session.session_date}</TableCell>
                                                <TableCell>{session.start_time}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => {
                                                        setEditingSession(session);
                                                        setSessionForm({
                                                            film_id: session.film_id,
                                                            session_date: session.session_date,
                                                            start_time: session.start_time,
                                                            available_seats: session.available_seats.toString(),
                                                            price_per_seat: session.price_per_seat.toString()
                                                        });
                                                        setSessionDialogOpen(true);
                                                    }}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteSession(session.id)}>
                                                        <Delete />
                                                    </IconButton>
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

            {/* Film Dialog */}
            <Dialog open={filmDialogOpen} onClose={() => setFilmDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingFilm ? 'ویرایش فیلم' : 'افزودن فیلم جدید'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="عنوان *" value={filmForm.title}
                                onChange={(e) => setFilmForm({ ...filmForm, title: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="توضیحات" multiline rows={3} value={filmForm.description}
                                onChange={(e) => setFilmForm({ ...filmForm, description: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="مدت (دقیقه) *" type="number" value={filmForm.duration_minutes}
                                onChange={(e) => setFilmForm({ ...filmForm, duration_minutes: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="ژانر" value={filmForm.genre}
                                onChange={(e) => setFilmForm({ ...filmForm, genre: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="رتبه‌بندی" value={filmForm.rating}
                                onChange={(e) => setFilmForm({ ...filmForm, rating: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilmDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleFilmSubmit} variant="contained" disabled={saving}>
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
                                <InputLabel>فیلم *</InputLabel>
                                <Select value={sessionForm.film_id}
                                    onChange={(e) => setSessionForm({ ...sessionForm, film_id: e.target.value })}>
                                    {films.map(film => (
                                        <MenuItem key={film.id} value={film.id}>{film.title}</MenuItem>
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
                            <TextField fullWidth label="صندلی‌های موجود *" type="number" value={sessionForm.available_seats}
                                onChange={(e) => setSessionForm({ ...sessionForm, available_seats: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="قیمت هر صندلی *" type="number" value={sessionForm.price_per_seat}
                                onChange={(e) => setSessionForm({ ...sessionForm, price_per_seat: e.target.value })} />
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

export default CinemaManagement;

