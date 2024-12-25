import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  IconButton,
  Chip,
  Avatar,
  AvatarGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  QuestionMark as MaybeIcon,
} from '@mui/icons-material';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import {
  fetchGroupEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  respondToEvent,
} from '../../store/slices/eventSlice';
import FileUpload from '../common/FileUpload';

const EVENT_TYPES = {
  SOCIAL: {
    label: 'Social Gathering',
    types: ['Coffee', 'Dinner', 'Party', 'Casual Meetup'],
  },
  SPORTS: {
    label: 'Sports & Activities',
    types: ['Team Sports', 'Fitness Session', 'Outdoor Activity'],
  },
  BUSINESS: {
    label: 'Business',
    types: ['Meeting', 'Workshop', 'Presentation', 'Networking'],
  },
  OTHER: {
    label: 'Other',
    types: ['Custom Event'],
  },
};

const EventForm = ({ open, onClose, event, groupId, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: addHours(new Date(), 2),
    venue: '',
    eventType: '',
    subType: '',
    maxParticipants: '',
    agenda: '',
    attachments: [],
    subGroups: [],
    ...event,
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, groupId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {event ? 'Edit Event' : 'Create New Event'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Title"
              value={formData.title}
              onChange={handleChange('title')}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.eventType}
                onChange={handleChange('eventType')}
                label="Event Type"
              >
                {Object.entries(EVENT_TYPES).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sub Type</InputLabel>
              <Select
                value={formData.subType}
                onChange={handleChange('subType')}
                label="Sub Type"
                disabled={!formData.eventType}
              >
                {formData.eventType &&
                  EVENT_TYPES[formData.eventType].types.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={handleDateChange('startTime')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="End Time"
                value={formData.endTime}
                onChange={handleDateChange('endTime')}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDateTime={formData.startTime}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Venue"
              value={formData.venue}
              onChange={handleChange('venue')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Agenda"
              value={formData.agenda}
              onChange={handleChange('agenda')}
              placeholder="Add agenda items separated by new lines"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Participants"
              value={formData.maxParticipants}
              onChange={handleChange('maxParticipants')}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Attachments
            </Typography>
            <FileUpload
              onUpload={(files) => setFormData({ ...formData, attachments: files })}
              maxFiles={5}
              existingFiles={formData.attachments}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.startTime || !formData.venue}
        >
          {event ? 'Update' : 'Create'} Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventCard = ({ event, onEdit, onDelete, onRespond }) => {
  const { user } = useSelector(state => state.auth);
  const userResponse = event.responses.find(r => r.user._id === user.id)?.response || 'none';

  const getResponseColor = (response) => {
    switch (response) {
      case 'going':
        return 'success';
      case 'maybe':
        return 'warning';
      case 'not_going':
        return 'error';
      default:
        return 'default';
    }
  };

  const getResponseIcon = (response) => {
    switch (response) {
      case 'going':
        return <CheckIcon />;
      case 'maybe':
        return <MaybeIcon />;
      case 'not_going':
        return <ClearIcon />;
      default:
        return null;
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{event.title}</Typography>
          <Box>
            <IconButton size="small" onClick={() => onEdit(event)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(event._id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon sx={{ mr: 1 }} />
              <Typography>
                {format(new Date(event.startTime), 'MMM d, yyyy h:mm a')} -
                {format(new Date(event.endTime), 'h:mm a')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ mr: 1 }} />
              <Typography>{event.venue}</Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {event.description}
            </Typography>

            {event.agenda && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Agenda
                </Typography>
                <List dense>
                  {event.agenda.split('\n').map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {event.attachments?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments
                </Typography>
                <List dense>
                  {event.attachments.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.originalname}
                        secondary={file.size}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your Response
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {['going', 'maybe', 'not_going'].map((response) => (
                  <Chip
                    key={response}
                    label={response.replace('_', ' ')}
                    icon={getResponseIcon(response)}
                    color={userResponse === response ? getResponseColor(response) : 'default'}
                    onClick={() => onRespond(event._id, response)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Responses
              </Typography>
              <List dense>
                {['going', 'maybe', 'not_going'].map((response) => {
                  const responseUsers = event.responses.filter(r => r.response === response);
                  return (
                    <ListItem key={response}>
                      <ListItemIcon>
                        {getResponseIcon(response)}
                      </ListItemIcon>
                      <ListItemText
                        primary={response.replace('_', ' ')}
                        secondary={`${responseUsers.length} people`}
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <AvatarGroup max={3} sx={{ ml: 2 }}>
                        {responseUsers.map(r => (
                          <Avatar
                            key={r.user._id}
                            src={r.user.profilePicture}
                            sx={{ width: 24, height: 24 }}
                          >
                            {r.user.username[0]}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const GroupEvents = ({ groupId }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  const dispatch = useDispatch();
  const { events, loading } = useSelector(state => state.events);
  const groupEvents = events[groupId] || [];

  useEffect(() => {
    dispatch(fetchGroupEvents(groupId));
  }, [dispatch, groupId]);

  const handleCreateEvent = async (eventData) => {
    try {
      await dispatch(createEvent(eventData));
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (eventData) => {
    try {
      await dispatch(updateEvent({
        groupId,
        eventId: eventData._id,
        updates: eventData,
      }));
      setEditingEvent(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await dispatch(deleteEvent({ groupId, eventId }));
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleRespond = async (eventId, response) => {
    try {
      await dispatch(respondToEvent({ groupId, eventId, response }));
    } catch (error) {
      console.error('Error responding to event:', error);
    }
  };

  const filterEvents = (events, type) => {
    const now = new Date();
    switch (type) {
      case 'upcoming':
        return events.filter(e => isAfter(new Date(e.startTime), now));
      case 'past':
        return events.filter(e => isBefore(new Date(e.endTime), now));
      default:
        return events;
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Upcoming Events" value="upcoming" />
          <Tab label="Past Events" value="past" />
        </Tabs>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Event
        </Button>
      </Box>

      {filterEvents(groupEvents, activeTab).map((event) => (
        <EventCard
          key={event._id}
          event={event}
          onEdit={setEditingEvent}
          onDelete={handleDeleteEvent}
          onRespond={handleRespond}
        />
      ))}

      {/* Create Event Dialog */}
      <EventForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        groupId={groupId}
        onSubmit={handleCreateEvent}
      />

      {/* Edit Event Dialog */}
      {editingEvent && (
        <EventForm
          open={true}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
          groupId={groupId}
          onSubmit={handleUpdateEvent}
        />
      )}
    </Box>
  );
};

export default GroupEvents;
