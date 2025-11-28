import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Visibility,
    Business,
    LocationOn,
    Phone,
    Email
} from '@mui/icons-material';

const CafeManagement = () => {
    // Mock data - in real app, this would come from API
    const cafes = [
        {
            id: 1,
            name: 'Coffee Corner',
            location: '123 Main St, Downtown',
            phone: '+1-555-0123',
            email: 'info@coffeecorner.com',
            status: 'Active',
            sales: 15000,
            manager: 'John Smith'
        },
        {
            id: 2,
            name: 'Bean & Brew',
            location: '456 Mall Ave, Mall District',
            phone: '+1-555-0456',
            email: 'contact@beanbrew.com',
            status: 'Active',
            sales: 12000,
            manager: 'Sarah Johnson'
        },
        {
            id: 3,
            name: 'Morning Glory',
            location: '789 University Blvd',
            phone: '+1-555-0789',
            email: 'hello@morningglory.com',
            status: 'Pending',
            sales: 8000,
            manager: 'Mike Wilson'
        },
        {
            id: 4,
            name: 'Espresso Express',
            location: '321 Business Park',
            phone: '+1-555-0321',
            email: 'orders@espressoexpress.com',
            status: 'Active',
            sales: 18000,
            manager: 'Lisa Brown'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Pending': return 'warning';
            case 'Inactive': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Café Management</Typography>
                <Button variant="contained" startIcon={<Add />}>
                    Add New Café
                </Button>
            </Box>

            {/* Search and Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search cafés..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            defaultValue="all"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button variant="outlined" fullWidth>
                            Filter
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Business color="primary" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Total Cafés</Typography>
                                    <Typography variant="h4">{cafes.length}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Chip label="Active" color="success" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Active</Typography>
                                    <Typography variant="h4">
                                        {cafes.filter(c => c.status === 'Active').length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Chip label="Pending" color="warning" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="h6">Pending</Typography>
                                    <Typography variant="h4">
                                        {cafes.filter(c => c.status === 'Pending').length}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center">
                                <Typography variant="h6" sx={{ mr: 2 }}>$</Typography>
                                <Box>
                                    <Typography variant="h6">Total Sales</Typography>
                                    <Typography variant="h4">
                                        {cafes.reduce((sum, cafe) => sum + cafe.sales, 0).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Cafés Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Café Name</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Sales</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cafes.map((cafe) => (
                            <TableRow key={cafe.id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Business sx={{ mr: 1 }} />
                                        {cafe.name}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <LocationOn sx={{ mr: 1, fontSize: 'small' }} />
                                        {cafe.location}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                                            <Phone sx={{ mr: 1, fontSize: 'small' }} />
                                            {cafe.phone}
                                        </Box>
                                        <Box display="flex" alignItems="center">
                                            <Email sx={{ mr: 1, fontSize: 'small' }} />
                                            {cafe.email}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{cafe.manager}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={cafe.status}
                                        color={getStatusColor(cafe.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>${cafe.sales.toLocaleString()}</TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary">
                                        <Visibility />
                                    </IconButton>
                                    <IconButton size="small" color="secondary">
                                        <Edit />
                                    </IconButton>
                                    <IconButton size="small" color="error">
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CafeManagement;
