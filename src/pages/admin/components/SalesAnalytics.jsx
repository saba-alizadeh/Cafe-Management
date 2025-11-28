import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    AttachMoney,
    Business,
    People,
    Assessment
} from '@mui/icons-material';

const SalesAnalytics = () => {
    // Mock data - in real app, this would come from API
    const analytics = {
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
        topPerformingCafe: 'Espresso Express',
        totalOrders: 1250,
        averageOrderValue: 100,
        customerSatisfaction: 4.8
    };

    const topCafes = [
        { name: 'کافه 1', sales: 18000, growth: 15.2 },
        { name: 'کافه 2', sales: 15000, growth: 8.5 },
        { name: 'کافه 3', sales: 12000, growth: 12.1 },
        { name: 'کافه 4', sales: 8000, growth: -2.3 }
    ];

    const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="h6">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="h2">
                            {value}
                        </Typography>
                        {subtitle && (
                            <Box display="flex" alignItems="center" mt={1}>
                                {trend === 'up' ? (
                                    <TrendingUp color="success" sx={{ mr: 1 }} />
                                ) : (
                                    <TrendingDown color="error" sx={{ mr: 1 }} />
                                )}
                                <Typography color={trend === 'up' ? 'success.main' : 'error.main'} variant="body2">
                                    {subtitle}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box color={color}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                تجزیه و تحلیل فروش
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                عملکرد جامع فروش در تمام کافه‌ها
            </Typography>

            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="کل درآمد"
                        value={`$${analytics.totalRevenue.toLocaleString()}`}
                        icon={<AttachMoney />}
                        color="success.main"
                        subtitle={`${analytics.monthlyGrowth}% این ماه`}
                        trend="up"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="کل سفارشات"
                        value={analytics.totalOrders.toLocaleString()}
                        icon={<Assessment />}
                        color="primary.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="میانگین ارزش سفارش"
                        value={`$${analytics.averageOrderValue}`}
                        icon={<People />}
                        color="info.main"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="امتیاز مشتری"
                        value={`${analytics.customerSatisfaction}/5`}
                        icon={<TrendingUp />}
                        color="warning.main"
                    />
                </Grid>

                {/* Top Performing Cafés */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            کافه های برتر
                        </Typography>
                        <List>
                            {topCafes.map((cafe, index) => (
                                <ListItem key={cafe.name} divider>
                                    <ListItemIcon>
                                        <Business />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={cafe.name}
                                        secondary={`فروش: $${cafe.sales.toLocaleString()}`}
                                    />
                                    <Box display="flex" alignItems="center">
                                        <Chip
                                            label={`${cafe.growth}%`}
                                            color={cafe.growth >= 0 ? 'success' : 'error'}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            #{index + 1}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>


            </Grid>
        </Box>
    );
};

export default SalesAnalytics;
