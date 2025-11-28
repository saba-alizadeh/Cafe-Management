import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton
} from '@mui/material';
import {
    Settings,
    Business,
    Schedule,
    Menu,
    Notifications,
    Security,
    Edit,
    Delete,
    Add
} from '@mui/icons-material';

const CafeSettings = () => {
    const cafeInfo = {
        name: 'کافه اکسیر',
        address: 'تهران، خیابان انقلاب، کوچه سپید، پلاک ۱۲',
        phone: '۰۲۱-۸۸۷۷۶۶۵۵',
        email: 'hello@cafexir.ir',
        hours: '۸:۰۰ الی ۲۳:۳۰',
        capacity: 52,
        wifiPassword: 'CafeXir1403'
    };

    const menuItems = [
        { id: 1, name: 'کاپوچینو کاراملی', price: 185000, category: 'نوشیدنی گرم', available: true },
        { id: 2, name: 'لاته زعفرانی', price: 195000, category: 'نوشیدنی گرم', available: true },
        { id: 3, name: 'اسپرسو دوبل', price: 110000, category: 'نوشیدنی گرم', available: true },
        { id: 4, name: 'چیزکیک پسته', price: 245000, category: 'دسر', available: false }
    ];

    return (
        <Box sx={{ direction: 'rtl' }}>
            <Typography variant="h4" gutterBottom>
                تنظیمات کافه
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                مدیریت اطلاعات شعبه، منو و تنظیمات عملیاتی
            </Typography>

            <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Business sx={{ mr: 1 }} />
                            <Typography variant="h6">اطلاعات پایه</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="نام کافه"
                                    defaultValue={cafeInfo.name}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="آدرس"
                                    defaultValue={cafeInfo.address}
                                    multiline
                                    rows={2}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="تلفن تماس"
                                    defaultValue={cafeInfo.phone}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ایمیل"
                                    defaultValue={cafeInfo.email}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ساعات کاری"
                                    defaultValue={cafeInfo.hours}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ظرفیت (نفر)"
                                    type="number"
                                    defaultValue={cafeInfo.capacity}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Operational Settings */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Settings sx={{ mr: 1 }} />
                            <Typography variant="h6">تنظیمات عملیاتی</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="دریافت سفارش آنلاین"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="امکان رزرو میز"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch />}
                                    label="ارسال بیرون‌بر فعال باشد"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="رمز وای‌فای"
                                    defaultValue={cafeInfo.wifiPassword}
                                    type="password"
                                    inputProps={{ dir: 'ltr' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="حداکثر مدت رزرو (ساعت)"
                                    type="number"
                                    defaultValue={2}
                                    inputProps={{ dir: 'rtl' }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Menu Management */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" alignItems="center">
                                <Menu sx={{ mr: 1 }} />
                            <Typography variant="h6">مدیریت منو</Typography>
                            </Box>
                            <Button variant="contained" startIcon={<Add />}>
                                آیتم جدید
                            </Button>
                        </Box>
                        <List>
                            {menuItems.map((item) => (
                                <ListItem key={item.id} divider>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`${item.category} • ${item.price.toLocaleString('fa-IR')} تومان`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton size="small">
                                            <Edit />
                                        </IconButton>
                                        <IconButton size="small" color="error">
                                            <Delete />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Notifications sx={{ mr: 1 }} />
                            <Typography variant="h6">اعلان‌ها</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="اعلان سفارش جدید"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="هشدار رزرو"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch />}
                                    label="هشدار موجودی"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="دیدگاه مشتریان"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Security Settings */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Security sx={{ mr: 1 }} />
                            <Typography variant="h6">امنیت و دسترسی</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button variant="outlined" fullWidth>
                                    تغییر رمز مدیر
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="outlined" fullWidth>
                                    مدیریت دسترسی پرسنل
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="outlined" fullWidth>
                                    مشاهده گزارش دسترسی
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined">
                            بازنشانی
                        </Button>
                        <Button variant="contained">
                            ذخیره تغییرات
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CafeSettings;
