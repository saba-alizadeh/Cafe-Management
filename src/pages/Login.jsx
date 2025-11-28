import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Avatar
} from '@mui/material';
import {
    AdminPanelSettings,
    Business,
    LocalCafe,
    Person
} from '@mui/icons-material';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [selectedRole, setSelectedRole] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const roles = [
        { id: 'admin', name: 'Admin', icon: AdminPanelSettings, color: '#f44336', description: 'System Administrator' },
        { id: 'manager', name: 'Café Manager', icon: Business, color: '#2196f3', description: 'Café Owner/Manager' },
        { id: 'barista', name: 'Barista', icon: LocalCafe, color: '#4caf50', description: 'Café Staff' },
        { id: 'customer', name: 'Customer', icon: Person, color: '#ff9800', description: 'Café Customer' }
    ];

    const handleLogin = (e) => {
        e.preventDefault();
        if (!selectedRole) {
            alert('Please select a role');
            return;
        }
        
        // Mock authentication - in real app, validate credentials
        const userData = {
            id: 1,
            username: credentials.username,
            role: selectedRole,
            name: credentials.username,
            cafeId: selectedRole === 'customer' ? null : 1 // Customers don't belong to specific cafe
        };
        
        login(userData);
        navigate(`/${selectedRole}`);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Café Management System
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    Choose your role and sign in
                </Typography>

                <Grid container spacing={3}>
                    {/* Role Selection */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            Select Your Role
                        </Typography>
                        <Grid container spacing={2}>
                            {roles.map((role) => {
                                const IconComponent = role.icon;
                                return (
                                    <Grid item xs={12} sm={6} key={role.id}>
                                        <Card
                                            sx={{
                                                cursor: 'pointer',
                                                border: selectedRole === role.id ? 2 : 1,
                                                borderColor: selectedRole === role.id ? role.color : 'divider',
                                                '&:hover': { boxShadow: 3 }
                                            }}
                                            onClick={() => setSelectedRole(role.id)}
                                        >
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <Avatar sx={{ bgcolor: role.color, mx: 'auto', mb: 2 }}>
                                                    <IconComponent />
                                                </Avatar>
                                                <Typography variant="h6">{role.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {role.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid>

                    {/* Login Form */}
                    <Grid item xs={12} md={4}>
                        <Box component="form" onSubmit={handleLogin}>
                            <Typography variant="h6" gutterBottom>
                                Sign In
                            </Typography>
                            <TextField
                                fullWidth
                                label="Username"
                                value={credentials.username}
                                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                margin="normal"
                                required
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={!selectedRole}
                            >
                                Sign In
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Login;
