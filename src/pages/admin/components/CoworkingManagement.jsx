import { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
    TableBody, Button, IconButton, Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Chip, Stack
} from '@mui/material';
import { Add, Edit, Delete, Work } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import ReservationListSection from './ReservationListSection';

const CoworkingManagement = () => {
    const { apiBaseUrl, token } = useAuth();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [form, setForm] = useState({
        name: '', capacity: '', is_available: true, amenities: ''
    });

    const getToken = () => token || localStorage.getItem('authToken');

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setLoading(true);
        setError('');
        const authToken = getToken();
        if (!authToken) {
            setError('لطفاً ابتدا وارد سیستم شوید');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${apiBaseUrl}/coworking/tables`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
            const data = await res.json();
            setTables(data);
        } catch (err) {
            setError('خطا در دریافت اطلاعات: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        const authToken = getToken();
        try {
            const url = editingTable 
                ? `${apiBaseUrl}/coworking/tables/${editingTable.id}`
                : `${apiBaseUrl}/coworking/tables`;
            const method = editingTable ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    name: form.name,
                    capacity: parseInt(form.capacity),
                    is_available: form.is_available,
                    amenities: form.amenities || null
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'خطا در ذخیره');
            }
            setSuccess(editingTable ? 'میز بروزرسانی شد' : 'میز ایجاد شد');
            setDialogOpen(false);
            fetchTables();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('آیا از حذف این میز مطمئن هستید؟')) return;
        const authToken = getToken();
        try {
            const res = await fetch(`${apiBaseUrl}/coworking/tables/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error('خطا در حذف');
            setSuccess('میز حذف شد');
            fetchTables();
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
                <Typography variant="h4">مدیریت فضای همکاری</Typography>
                <Box>
                    <Button variant="outlined" onClick={fetchTables} sx={{ mr: 1 }}>بروزرسانی</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => {
                        setEditingTable(null);
                        setForm({ name: '', capacity: '', is_available: true, amenities: '' });
                        setDialogOpen(true);
                    }}>
                        افزودن میز
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>نام میز</TableCell>
                                <TableCell>ظرفیت</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell>امکانات</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tables.map((table) => (
                                <TableRow key={table.id}>
                                    <TableCell>{table.name}</TableCell>
                                    <TableCell>{table.capacity} نفر</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={table.is_available ? 'در دسترس' : 'اشغال شده'} 
                                            color={table.is_available ? 'success' : 'default'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>{table.amenities || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton size="small" onClick={() => {
                                                setEditingTable(table);
                                                setForm({
                                                    name: table.name,
                                                    capacity: table.capacity.toString(),
                                                    is_available: table.is_available,
                                                    amenities: table.amenities || ''
                                                });
                                                setDialogOpen(true);
                                            }}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(table.id)}>
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

            <ReservationListSection
                reservationType="coworking"
                typeLabel="فضای مشترک"
                getResourceInfo={(r) => `میز اشتراکی ${r.table_id || ''}`}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTable ? 'ویرایش میز' : 'افزودن میز جدید'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="نام میز *" value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="ظرفیت *" type="number" value={form.capacity}
                                onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="وضعیت" select SelectProps={{ native: true }}
                                value={form.is_available ? 'true' : 'false'}
                                onChange={(e) => setForm({ ...form, is_available: e.target.value === 'true' })}>
                                <option value="true">در دسترس</option>
                                <option value="false">اشغال شده</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="امکانات" multiline rows={2} value={form.amenities}
                                onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={saving}>
                        {saving ? 'در حال ذخیره...' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CoworkingManagement;

