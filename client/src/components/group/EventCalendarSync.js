import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Google as GoogleIcon,
  Apple as AppleIcon,
  Microsoft as MicrosoftIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  CloudSync as CloudSyncIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const CALENDAR_PROVIDERS = {
  GOOGLE: {
    name: 'Google Calendar',
    icon: GoogleIcon,
    color: '#DB4437',
  },
  APPLE: {
    name: 'Apple Calendar',
    icon: AppleIcon,
    color: '#555555',
  },
  OUTLOOK: {
    name: 'Microsoft Outlook',
    icon: MicrosoftIcon,
    color: '#0078D4',
  },
};

const SYNC_FREQUENCY = {
  REALTIME: 'realtime',
  HOURLY: 'hourly',
  DAILY: 'daily',
  MANUAL: 'manual',
};

const CalendarSettings = ({ settings, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    provider: '',
    syncFrequency: SYNC_FREQUENCY.DAILY,
    autoSync: true,
    syncReminders: true,
    syncAttendees: true,
    syncNotes: true,
    defaultCalendarId: '',
    ...settings,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Calendar Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Calendar Provider</InputLabel>
              <Select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                label="Calendar Provider"
              >
                {Object.entries(CALENDAR_PROVIDERS).map(([key, { name }]) => (
                  <MenuItem key={key} value={key}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Sync Frequency</InputLabel>
              <Select
                value={formData.syncFrequency}
                onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value })}
                label="Sync Frequency"
              >
                {Object.entries(SYNC_FREQUENCY).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.autoSync}
                  onChange={(e) => setFormData({ ...formData, autoSync: e.target.checked })}
                />
              }
              label="Auto-sync new events"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.syncReminders}
                  onChange={(e) => setFormData({ ...formData, syncReminders: e.target.checked })}
                />
              }
              label="Sync reminders"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.syncAttendees}
                  onChange={(e) => setFormData({ ...formData, syncAttendees: e.target.checked })}
                />
              }
              label="Sync attendees"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.syncNotes}
                  onChange={(e) => setFormData({ ...formData, syncNotes: e.target.checked })}
                />
              }
              label="Sync notes and descriptions"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Default Calendar ID"
              value={formData.defaultCalendarId}
              onChange={(e) => setFormData({ ...formData, defaultCalendarId: e.target.value })}
              placeholder="Enter your calendar ID"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.provider}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SyncStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status.state) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'syncing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Alert
      severity={getStatusColor()}
      icon={
        status.state === 'success' ? <CheckIcon /> :
        status.state === 'error' ? <ErrorIcon /> :
        <SyncIcon />
      }
    >
      {status.message}
    </Alert>
  );
};

const EventCalendarSync = ({ event }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const dispatch = useDispatch();
  
  const { calendarSettings, loading } = useSelector(state => state.calendarSync);
  const settings = calendarSettings[event._id];

  useEffect(() => {
    dispatch(fetchCalendarSettings(event._id));
  }, [dispatch, event._id]);

  const handleConnect = async (provider) => {
    try {
      setSyncStatus({ state: 'syncing', message: 'Connecting to calendar...' });
      await dispatch(connectCalendar({
        eventId: event._id,
        provider,
      }));
      setSyncStatus({ state: 'success', message: 'Successfully connected to calendar!' });
    } catch (error) {
      setSyncStatus({ state: 'error', message: 'Failed to connect to calendar.' });
      console.error('Error connecting to calendar:', error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncStatus({ state: 'syncing', message: 'Syncing event...' });
      await dispatch(syncEvent(event._id));
      setSyncStatus({ state: 'success', message: 'Event synced successfully!' });
    } catch (error) {
      setSyncStatus({ state: 'error', message: 'Failed to sync event.' });
      console.error('Error syncing event:', error);
    }
  };

  const handleUpdateSettings = async (settingsData) => {
    try {
      await dispatch(updateCalendarSettings({
        eventId: event._id,
        settings: settingsData,
      }));
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating calendar settings:', error);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect this calendar?')) {
      try {
        await dispatch(disconnectCalendar(event._id));
      } catch (error) {
        console.error('Error disconnecting calendar:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Calendar Sync</Typography>
          {settings ? (
            <Box>
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => setShowSettings(true)}
                sx={{ mr: 1 }}
              >
                Settings
              </Button>
              <Button
                startIcon={<SyncIcon />}
                variant="contained"
                onClick={handleSync}
              >
                Sync Now
              </Button>
            </Box>
          ) : (
            <Typography variant="subtitle2" color="text.secondary">
              Connect a calendar to get started
            </Typography>
          )}
        </Box>

        {syncStatus && (
          <Box sx={{ mb: 3 }}>
            <SyncStatus status={syncStatus} />
          </Box>
        )}

        {!settings ? (
          <Grid container spacing={2}>
            {Object.entries(CALENDAR_PROVIDERS).map(([key, { name, icon: Icon, color }]) => (
              <Grid item xs={12} sm={4} key={key}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Icon />}
                  onClick={() => handleConnect(key)}
                  sx={{
                    borderColor: color,
                    color: color,
                    '&:hover': {
                      borderColor: color,
                      bgcolor: `${color}10`,
                    },
                  }}
                >
                  Connect {name}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {React.createElement(CALENDAR_PROVIDERS[settings.provider].icon, {
                      style: { color: CALENDAR_PROVIDERS[settings.provider].color, marginRight: 8 },
                    })}
                    <Typography variant="subtitle1">
                      {CALENDAR_PROVIDERS[settings.provider].name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Calendar ID: {settings.defaultCalendarId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sync Frequency: {settings.syncFrequency}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      color="error"
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sync Settings
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Auto-sync new events"
                        secondary={settings.autoSync ? 'Enabled' : 'Disabled'}
                      />
                      <ListItemSecondaryAction>
                        <CheckIcon color={settings.autoSync ? 'success' : 'disabled'} />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Sync reminders"
                        secondary={settings.syncReminders ? 'Enabled' : 'Disabled'}
                      />
                      <ListItemSecondaryAction>
                        <CheckIcon color={settings.syncReminders ? 'success' : 'disabled'} />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Sync attendees"
                        secondary={settings.syncAttendees ? 'Enabled' : 'Disabled'}
                      />
                      <ListItemSecondaryAction>
                        <CheckIcon color={settings.syncAttendees ? 'success' : 'disabled'} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Sync History
              </Typography>
              <List>
                {/* Add sync history items here */}
              </List>
            </Box>
          </Box>
        )}
      </Box>

      {showSettings && (
        <CalendarSettings
          settings={settings}
          onSubmit={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Paper>
  );
};

export default EventCalendarSync;
