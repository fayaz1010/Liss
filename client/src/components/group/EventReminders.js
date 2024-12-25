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
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Alarm as AlarmIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Mail as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as InactiveIcon,
  Repeat as RepeatIcon,
} from '@mui/icons-material';
import { format, parseISO, addDays, addHours, addMinutes } from 'date-fns';

const REMINDER_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
};

const REMINDER_TRIGGERS = {
  BEFORE_EVENT: 'before_event',
  AFTER_EVENT: 'after_event',
  CUSTOM_DATE: 'custom_date',
};

const REMINDER_FREQUENCIES = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
};

const RECIPIENT_TYPES = {
  ALL_GUESTS: 'all_guests',
  CONFIRMED_GUESTS: 'confirmed_guests',
  PENDING_GUESTS: 'pending_guests',
  SPECIFIC_GUESTS: 'specific_guests',
};

const ReminderForm = ({ reminder, onSubmit, onClose, guests = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: REMINDER_TYPES.EMAIL,
    triggerType: REMINDER_TRIGGERS.BEFORE_EVENT,
    triggerValue: 24,
    triggerUnit: 'hours',
    customDate: null,
    frequency: REMINDER_FREQUENCIES.ONCE,
    recipientType: RECIPIENT_TYPES.ALL_GUESTS,
    specificRecipients: [],
    active: true,
    ...reminder,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {reminder ? 'Edit Reminder' : 'Create Reminder'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reminder Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Reminder Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Reminder Type"
              >
                {Object.entries(REMINDER_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Trigger</InputLabel>
              <Select
                value={formData.triggerType}
                onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                label="Trigger"
              >
                {Object.entries(REMINDER_TRIGGERS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.replace('_', ' ').charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {formData.triggerType !== REMINDER_TRIGGERS.CUSTOM_DATE ? (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Trigger Value"
                  value={formData.triggerValue}
                  onChange={(e) => setFormData({ ...formData, triggerValue: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={formData.triggerUnit}
                    onChange={(e) => setFormData({ ...formData, triggerUnit: e.target.value })}
                    label="Unit"
                  >
                    <MenuItem value="minutes">Minutes</MenuItem>
                    <MenuItem value="hours">Hours</MenuItem>
                    <MenuItem value="days">Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Custom Date"
                value={formData.customDate}
                onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                label="Frequency"
              >
                {Object.entries(REMINDER_FREQUENCIES).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Recipients</InputLabel>
              <Select
                value={formData.recipientType}
                onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                label="Recipients"
              >
                {Object.entries(RECIPIENT_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.replace('_', ' ').charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {formData.recipientType === RECIPIENT_TYPES.SPECIFIC_GUESTS && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Guests</InputLabel>
                <Select
                  multiple
                  value={formData.specificRecipients}
                  onChange={(e) => setFormData({ ...formData, specificRecipients: e.target.value })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={guests.find(g => g._id === value)?.name || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {guests.map((guest) => (
                    <MenuItem key={guest._id} value={guest._id}>
                      {guest.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.title || !formData.message}
        >
          Save Reminder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventReminders = ({ event }) => {
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const dispatch = useDispatch();
  
  const { reminders, loading } = useSelector(state => state.eventReminders);
  const eventReminders = reminders[event._id] || [];
  const { guests } = useSelector(state => state.eventGuests);
  const eventGuests = guests[event._id] || [];

  useEffect(() => {
    dispatch(fetchEventReminders(event._id));
  }, [dispatch, event._id]);

  const handleSubmitReminder = async (reminderData) => {
    try {
      if (selectedReminder) {
        await dispatch(updateReminder({
          eventId: event._id,
          reminderId: selectedReminder._id,
          updates: reminderData,
        }));
      } else {
        await dispatch(createReminder({
          eventId: event._id,
          ...reminderData,
        }));
      }
      setShowReminderForm(false);
      setSelectedReminder(null);
    } catch (error) {
      console.error('Error submitting reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await dispatch(deleteReminder({
          eventId: event._id,
          reminderId,
        }));
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleToggleReminder = async (reminder) => {
    try {
      await dispatch(updateReminder({
        eventId: event._id,
        reminderId: reminder._id,
        updates: { active: !reminder.active },
      }));
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const getNextTriggerTime = (reminder) => {
    const now = new Date();
    const eventDate = parseISO(event.startDate);

    if (reminder.triggerType === REMINDER_TRIGGERS.CUSTOM_DATE) {
      return parseISO(reminder.customDate);
    }

    let triggerTime;
    if (reminder.triggerType === REMINDER_TRIGGERS.BEFORE_EVENT) {
      switch (reminder.triggerUnit) {
        case 'minutes':
          triggerTime = addMinutes(eventDate, -reminder.triggerValue);
          break;
        case 'hours':
          triggerTime = addHours(eventDate, -reminder.triggerValue);
          break;
        case 'days':
          triggerTime = addDays(eventDate, -reminder.triggerValue);
          break;
        default:
          triggerTime = eventDate;
      }
    } else {
      switch (reminder.triggerUnit) {
        case 'minutes':
          triggerTime = addMinutes(eventDate, reminder.triggerValue);
          break;
        case 'hours':
          triggerTime = addHours(eventDate, reminder.triggerValue);
          break;
        case 'days':
          triggerTime = addDays(eventDate, reminder.triggerValue);
          break;
        default:
          triggerTime = eventDate;
      }
    }

    return triggerTime;
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
          <Typography variant="h6">Event Reminders</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setShowReminderForm(true)}
          >
            Create Reminder
          </Button>
        </Box>

        <List>
          {eventReminders.map((reminder) => (
            <ListItem key={reminder._id}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: reminder.active ? 'success.main' : 'grey.500' }}>
                  {reminder.type === REMINDER_TYPES.EMAIL ? (
                    <EmailIcon />
                  ) : reminder.type === REMINDER_TYPES.SMS ? (
                    <SmsIcon />
                  ) : (
                    <AlarmIcon />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {reminder.title}
                    </Typography>
                    {reminder.frequency !== REMINDER_FREQUENCIES.ONCE && (
                      <Chip
                        size="small"
                        icon={<RepeatIcon />}
                        label={reminder.frequency}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {reminder.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        Next: {format(getNextTriggerTime(reminder), 'MMM d, yyyy h:mm a')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <GroupIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {reminder.recipientType.replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => handleToggleReminder(reminder)}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  {reminder.active ? <ActiveIcon color="success" /> : <InactiveIcon />}
                </IconButton>
                <IconButton
                  onClick={() => {
                    setSelectedReminder(reminder);
                    setShowReminderForm(true);
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteReminder(reminder._id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      {showReminderForm && (
        <ReminderForm
          reminder={selectedReminder}
          onSubmit={handleSubmitReminder}
          onClose={() => {
            setShowReminderForm(false);
            setSelectedReminder(null);
          }}
          guests={eventGuests}
        />
      )}
    </Paper>
  );
};

export default EventReminders;
