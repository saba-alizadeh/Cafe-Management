import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton
} from '@mui/material';
import {
    Settings,
    Security,
    Notifications,
    Backup,
    Delete,
    Edit,
    Add
} from '@mui/icons-material';

const SystemSettings = () => {
    const systemSettings = {
        maintenanceMode: false,
        autoBackup: true,
        emailNotifications: true,
        smsNotifications: false,
        dataRetention: 365,
        maxUsers: 1000,
        apiRateLimit: 1000
    };

    const backupHistory = [
        { date: '2024-01-15', size: '2.5 GB', status: 'Completed' },
        { date: '2024-01-14', size: '2.4 GB', status: 'Completed' },
        { date: '2024-01-13', size: '2.3 GB', status: 'Failed' },
        { date: '2024-01-12', size: '2.4 GB', status: 'Completed' }
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                System Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                Configure system-wide settings and preferences
            </Typography>

            <Grid container spacing={3}>
                {/* General Settings */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Settings sx={{ mr: 1 }} />
                            <Typography variant="h6">General Settings</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked={systemSettings.maintenanceMode} />}
                                    label="Maintenance Mode"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked={systemSettings.autoBackup} />}
                                    label="Automatic Backup"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Data Retention (days)"
                                    type="number"
                                    defaultValue={systemSettings.dataRetention}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Maximum Users"
                                    type="number"
                                    defaultValue={systemSettings.maxUsers}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Notifications sx={{ mr: 1 }} />
                            <Typography variant="h6">Notification Settings</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked={systemSettings.emailNotifications} />}
                                    label="Email Notifications"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch defaultChecked={systemSettings.smsNotifications} />}
                                    label="SMS Notifications"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="API Rate Limit (requests/hour)"
                                    type="number"
                                    defaultValue={systemSettings.apiRateLimit}
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
                            <Typography variant="h6">Security Settings</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Password Policy"
                                    defaultValue="Minimum 8 characters, 1 uppercase, 1 number"
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Session Timeout (minutes)"
                                    type="number"
                                    defaultValue={30}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="outlined" fullWidth>
                                    Reset All Passwords
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Backup Management */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Backup sx={{ mr: 1 }} />
                            <Typography variant="h6">Backup Management</Typography>
                        </Box>
                        <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }}>
                            Create Backup
                        </Button>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            Recent Backups
                        </Typography>
                        <List dense>
                            {backupHistory.map((backup, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={backup.date}
                                        secondary={`${backup.size} • ${backup.status}`}
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

                {/* Save Button */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined">
                            Reset to Defaults
                        </Button>
                        <Button variant="contained">
                            Save Settings
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SystemSettings;
