import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchLists } from '../store/slices/listSlice';
import { fetchGroups } from '../store/slices/groupSlice';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [openNewEvent, setOpenNewEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    groupId: '',
    description: '',
    type: 'event', // 'event' or 'deadline'
  });

  const dispatch = useDispatch();
  const { lists, loading: listsLoading } = useSelector((state) => state.lists);
  const { groups, loading: groupsLoading } = useSelector((state) => state.groups);

  useEffect(() => {
    dispatch(fetchLists());
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    // Combine list deadlines and group events into calendar events
    const listEvents = lists.flatMap(list =>
      list.items
        .filter(item => item.deadline)
        .map(item => ({
          id: item._id,
          title: `${list.title}: ${item.title}`,
          start: new Date(item.deadline),
          end: new Date(item.deadline),
          type: 'deadline',
          listId: list._id,
          itemId: item._id,
          progress: item.progress,
        }))
    );

    const groupEvents = groups.flatMap(group =>
      group.events.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        type: 'event',
        groupId: group._id,
        description: event.description,
      }))
    );

    setEvents([...listEvents, ...groupEvents]);
  }, [lists, groups]);

  const handleOpenNewEvent = () => {
    setOpenNewEvent(true);
  };

  const handleCloseNewEvent = () => {
    setOpenNewEvent(false);
    setEventData({
      title: '',
      start: new Date(),
      end: new Date(),
      groupId: '',
      description: '',
      type: 'event',
    });
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, value) => {
    setEventData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateEvent = async () => {
    // TODO: Implement event creation logic
    handleCloseNewEvent();
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.type === 'deadline' ? '#ff4081' : '#2196f3',
    };

    if (event.type === 'deadline' && event.progress === 100) {
      style.backgroundColor = '#4caf50';
    }

    return {
      style,
    };
  };

  if (listsLoading || groupsLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Calendar
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenNewEvent}
          >
            Add Event
          </Button>
        </Box>

        <Box sx={{ height: 600 }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventSelect}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
          />
        </Box>
      </Paper>

      {/* New Event Dialog */}
      <Dialog open={openNewEvent} onClose={handleCloseNewEvent} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Event Title"
            type="text"
            fullWidth
            variant="outlined"
            value={eventData.title}
            onChange={handleEventChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={eventData.description}
            onChange={handleEventChange}
          />
          <TextField
            select
            margin="dense"
            name="groupId"
            label="Group"
            fullWidth
            variant="outlined"
            value={eventData.groupId}
            onChange={handleEventChange}
          >
            {groups.map((group) => (
              <MenuItem key={group._id} value={group._id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="start"
            label="Start Date"
            type="datetime-local"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={format(eventData.start, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => handleDateChange('start', new Date(e.target.value))}
          />
          <TextField
            margin="dense"
            name="end"
            label="End Date"
            type="datetime-local"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={format(eventData.end, "yyyy-MM-dd'T'HH:mm")}
            onChange={(e) => handleDateChange('end', new Date(e.target.value))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewEvent}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog 
        open={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{selectedEvent?.title}</DialogTitle>
        <DialogContent>
          {selectedEvent?.type === 'deadline' ? (
            <>
              <Typography variant="body1" gutterBottom>
                Due Date: {selectedEvent?.start.toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Progress: {selectedEvent?.progress}%
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                {selectedEvent?.description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Start: {selectedEvent?.start.toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                End: {selectedEvent?.end.toLocaleString()}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Calendar;
