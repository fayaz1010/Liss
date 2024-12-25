import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Grid,
  Button,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { fetchGroupEvents } from '../../store/slices/eventSlice';

const EventPreview = ({ event, onClose }) => {
  const theme = useTheme();

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{event.title}</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemIcon>
              <ScheduleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Time"
              secondary={`${format(parseISO(event.startTime), 'MMM d, yyyy h:mm a')} - ${format(
                parseISO(event.endTime),
                'h:mm a'
              )}`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <LocationIcon />
            </ListItemIcon>
            <ListItemText primary="Venue" secondary={event.venue} />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText
              primary="Participants"
              secondary={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {['going', 'maybe', 'not_going'].map((response) => {
                    const count = event.responses.filter(r => r.response === response).length;
                    return (
                      <Chip
                        key={response}
                        label={`${count} ${response.replace('_', ' ')}`}
                        size="small"
                        color={response === 'going' ? 'success' : response === 'maybe' ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              }
            />
          </ListItem>

          {event.description && (
            <ListItem>
              <ListItemText
                primary="Description"
                secondary={event.description}
              />
            </ListItem>
          )}

          {event.agenda && (
            <ListItem>
              <ListItemText
                primary="Agenda"
                secondary={
                  <List dense>
                    {event.agenda.split('\n').map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                }
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EventCalendar = ({ groupId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const theme = useTheme();
  const dispatch = useDispatch();
  
  const { events } = useSelector(state => state.events);
  const groupEvents = events[groupId] || [];

  useEffect(() => {
    dispatch(fetchGroupEvents(groupId));
  }, [dispatch, groupId]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventColor = (event) => {
    const types = {
      SOCIAL: theme.palette.primary.main,
      SPORTS: theme.palette.success.main,
      BUSINESS: theme.palette.info.main,
      OTHER: theme.palette.warning.main,
    };
    return types[event.eventType] || theme.palette.grey[500];
  };

  const renderWeekDays = () => {
    const weekStart = startOfWeek(currentDate);
    const days = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart),
    });

    return (
      <Grid container>
        {days.map((day) => (
          <Grid
            item
            xs
            key={day.toISOString()}
            sx={{
              textAlign: 'center',
              py: 1,
              borderBottom: 1,
              borderColor: 'divider',
              fontWeight: 'bold',
            }}
          >
            {format(day, 'EEE')}
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCalendarDays = () => {
    const monthStart = startOfWeek(currentDate);
    const days = eachDayOfInterval({
      start: monthStart,
      end: endOfWeek(endOfWeek(endOfWeek(monthStart))),
    });

    const weeks = [];
    let week = [];

    days.forEach((day) => {
      const dayEvents = groupEvents.filter((event) =>
        isWithinInterval(parseISO(event.startTime), {
          start: startOfDay(day),
          end: endOfDay(day),
        })
      );

      week.push(
        <Grid
          item
          xs
          key={day.toISOString()}
          sx={{
            height: 120,
            p: 1,
            border: 1,
            borderColor: 'divider',
            bgcolor: isSameDay(day, new Date())
              ? alpha(theme.palette.primary.main, 0.1)
              : 'background.paper',
            opacity: isSameMonth(day, currentDate) ? 1 : 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
              color: isSameDay(day, new Date())
                ? 'primary.main'
                : 'text.primary',
            }}
          >
            {format(day, 'd')}
          </Typography>
          <Box sx={{ mt: 1 }}>
            {dayEvents.map((event) => (
              <Tooltip
                key={event._id}
                title={`${event.title} (${format(
                  parseISO(event.startTime),
                  'h:mm a'
                )})`}
              >
                <Button
                  size="small"
                  sx={{
                    width: '100%',
                    mb: 0.5,
                    justifyContent: 'flex-start',
                    bgcolor: alpha(getEventColor(event), 0.1),
                    color: getEventColor(event),
                    '&:hover': {
                      bgcolor: alpha(getEventColor(event), 0.2),
                    },
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      maxWidth: '100%',
                      display: 'block',
                    }}
                  >
                    {format(parseISO(event.startTime), 'h:mm')} {event.title}
                  </Typography>
                </Button>
              </Tooltip>
            ))}
          </Box>
        </Grid>
      );

      if (week.length === 7) {
        weeks.push(
          <Grid container key={day.toISOString()}>
            {week}
          </Grid>
        );
        week = [];
      }
    });

    return weeks;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePreviousMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2 }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Button
            startIcon={<TodayIcon />}
            onClick={handleToday}
            variant="outlined"
          >
            Today
          </Button>
        </Box>

        {renderWeekDays()}
        {renderCalendarDays()}
      </Paper>

      {selectedEvent && (
        <EventPreview
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </Box>
  );
};

export default EventCalendar;
