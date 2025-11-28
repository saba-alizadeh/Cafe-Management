import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    Button,
    TextField,
    Rating,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Star,
    Add,
    Restaurant,
    Person,
    ThumbUp,
    ThumbDown
} from '@mui/icons-material';
import { useState } from 'react';

const Reviews = () => {
    const [reviewDialog, setReviewDialog] = useState({ open: false, type: 'cafe' });
    const [newReview, setNewReview] = useState({
        cafe: '',
        rating: 5,
        title: '',
        comment: '',
        type: 'cafe'
    });

    // Mock data - in real app, this would come from API
    const cafes = [
        { id: 1, name: 'کافه گوشه', location: 'مرکز شهر' },
        { id: 2, name: 'بین و برو', location: 'مجتمع تجاری' },
        { id: 3, name: 'طلوع صبح', location: 'منطقه دانشگاهی' }
    ];

    const reviews = [
        {
            id: 1,
            cafe: 'کافه گوشه',
            rating: 5,
            title: 'قهوه فوق‌العاده و برخورد عالی',
            comment: 'کاپوچینو کاملاً فومی بود و تیم خیلی با حوصله رفتار کردند.',
            author: 'محمد رضایی',
            date: '۲۰۲۴/۰۱/۱۵',
            helpful: 12,
            type: 'cafe'
        },
        {
            id: 2,
            cafe: 'بین و برو',
            rating: 4,
            title: 'فضای کاری مناسب',
            comment: 'اینترنت خوب و صندلی‌های راحت، برای کار کردن عالیه.',
            author: 'سارا احمدی',
            date: '۲۰۲۴/۰۱/۱۴',
            helpful: 8,
            type: 'cafe'
        },
        {
            id: 3,
            cafe: 'طلوع صبح',
            rating: 3,
            title: 'تجربه متوسط',
            comment: 'کیفیت قهوه خوب بود ولی در ساعات شلوغی کمی معطل شدیم.',
            author: 'نیما شریفی',
            date: '۲۰۲۴/۰۱/۱۳',
            helpful: 3,
            type: 'cafe'
        }
    ];

    const reviewTypeLabels = {
        cafe: 'کافه',
        barista: 'باریستا'
    };

    const handleSubmitReview = () => {
        // Mock review submission
        console.log('Submitting review:', newReview);
        setReviewDialog({ open: false, type: 'cafe' });
        setNewReview({
            cafe: '',
            rating: 5,
            title: '',
            comment: '',
            type: 'cafe'
        });
    };

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">نظرات و بازخوردها</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => setReviewDialog({ open: true, type: 'cafe' })}
                >
                    ثبت نظر جدید
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Review Statistics */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            آمار نظرات شما
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h4" color="primary">
                                            {reviews.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            نظرات ثبت‌شده
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h4" color="success.main">
                                            {Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10) / 10}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            میانگین امتیاز
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Recent Reviews */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            آخرین نظرات
                        </Typography>
                        <Grid container spacing={2}>
                            {reviews.map((review) => (
                                <Grid item xs={12} key={review.id}>
                                    <Card>
                                        <CardContent>
                                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar sx={{ ml: 2 }}>
                                                        {review.author.split(' ').map(n => n[0]).join('')}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2">{review.author}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {review.cafe} • {review.date}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Rating value={review.rating} readOnly size="small" />
                                            </Box>
                                            
                                            <Typography variant="h6" gutterBottom>
                                                {review.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {review.comment}
                                            </Typography>
                                            
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Chip
                                                    label={reviewTypeLabels[review.type] ?? 'سایر'}
                                                    color="primary"
                                                    size="small"
                                                />
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Button size="small" startIcon={<ThumbUp />}>
                                                        {review.helpful} مفید بود
                                                    </Button>
                                                    <Button size="small" startIcon={<ThumbDown />}>
                                                        مفید نبود
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Review Dialog */}
            <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, type: 'cafe' })}>
                <DialogTitle>ثبت نظر</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>انتخاب کافه</InputLabel>
                                <Select
                                    value={newReview.cafe}
                                    onChange={(e) => setNewReview({...newReview, cafe: e.target.value})}
                                >
                                    {cafes.map((cafe) => (
                                        <MenuItem key={cafe.id} value={cafe.name}>
                                            {cafe.name} - {cafe.location}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography>امتیاز:</Typography>
                                <Rating
                                    value={newReview.rating}
                                    onChange={(e, value) => setNewReview({...newReview, rating: value})}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="عنوان نظر"
                                value={newReview.title}
                                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="متن نظر"
                                multiline
                                rows={4}
                                value={newReview.comment}
                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                placeholder="تجربه خود را به اشتراک بگذارید..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewDialog({ open: false, type: 'cafe' })}>
                        انصراف
                    </Button>
                    <Button variant="contained" onClick={handleSubmitReview}>
                        ثبت نظر
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

};

export default Reviews;
