import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Note as NoteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  format,
  parseISO,
  differenceInMinutes,
  formatDistanceToNow,
} from 'date-fns';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  EXCUSED: 'excused',
};

const STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'success',
  [ATTENDANCE_STATUS.LATE]: 'warning',
  [ATTENDANCE_STATUS.ABSENT]: 'error',
  [ATTENDANCE_STATUS.EXCUSED]: 'info',
};

const AttendanceStats = ({ attendance, event }) => {
  const theme = useTheme();

  const calculateStats = () => {
    const total = attendance.length;
    const statusCount = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const averageArrivalTime = attendance
      .filter(record => record.checkInTime)
      .reduce((sum, record) => {
        return sum + differenceInMinutes(
          parseISO(record.checkInTime),
          parseISO(event.startTime)
        );
      }, 0) / (statusCount[ATTENDANCE_STATUS.PRESENT] || 1);

    return {
      total,
      statusCount,
      averageArrivalTime,
      attendanceRate: ((statusCount[ATTENDANCE_STATUS.PRESENT] || 0) / total) * 100,
    };
  };

  const stats = calculateStats();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Total Participants</Typography>
            </Box>
            <Typography variant="h4">{stats.total}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Attendance Rate</Typography>
            </Box>
            <Typography variant="h4">
              {stats.attendanceRate.toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Avg. Arrival Time</Typography>
            </Box>
            <Typography variant="h4">
              {Math.abs(stats.averageArrivalTime)} min
              {stats.averageArrivalTime > 0 ? ' late' : ' early'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Absences</Typography>
            </Box>
            <Typography variant="h4">
              {(stats.statusCount[ATTENDANCE_STATUS.ABSENT] || 0) +
                (stats.statusCount[ATTENDANCE_STATUS.EXCUSED] || 0)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const AttendanceNote = ({ note, onEdit, onClose }) => {
  const [editedNote, setEditedNote] = useState(note || '');

  const handleSubmit = () => {
    onEdit(editedNote);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Attendance Note</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={editedNote}
          onChange={(e) => setEditedNote(e.target.value)}
          placeholder="Add a note about this attendance record..."
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventAttendance = ({ event }) => {
  const [editingNote, setEditingNote] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  
  const { attendance, loading } = useSelector(state => state.eventAttendance);
  const eventAttendance = attendance[event._id] || [];

  useEffect(() => {
    dispatch(fetchEventAttendance(event._id));
  }, [dispatch, event._id]);

  const handleUpdateStatus = async (userId, status) => {
    try {
      await dispatch(updateAttendance({
        eventId: event._id,
        userId,
        status,
      }));
    } catch (error) {
      console.error('Error updating attendance status:', error);
    }
  };

  const handleUpdateNote = async (userId, note) => {
    try {
      await dispatch(updateAttendanceNote({
        eventId: event._id,
        userId,
        note,
      }));
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating attendance note:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ATTENDANCE_STATUS.PRESENT:
        return <CheckCircleIcon color="success" />;
      case ATTENDANCE_STATUS.LATE:
        return <TimeIcon color="warning" />;
      case ATTENDANCE_STATUS.ABSENT:
        return <CancelIcon color="error" />;
      case ATTENDANCE_STATUS.EXCUSED:
        return <WarningIcon color="info" />;
      default:
        return null;
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
        <Typography variant="h6" gutterBottom>
          Attendance Tracking
        </Typography>

        <AttendanceStats attendance={eventAttendance} event={event} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Attendance Records
          </Typography>
          <List>
            {eventAttendance.map((record) => (
              <ListItem key={record.user._id}>
                <ListItemAvatar>
                  <Avatar src={record.user.profilePicture}>
                    {record.user.username[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {record.user.username}
                      </Typography>
                      <Chip
                        size="small"
                        label={record.status}
                        color={STATUS_COLORS[record.status]}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {record.checkInTime && (
                        <Typography variant="body2" color="text.secondary">
                          Checked in: {format(parseISO(record.checkInTime), 'h:mm a')}
                          {record.status === ATTENDANCE_STATUS.LATE && (
                            ` (${differenceInMinutes(
                              parseISO(record.checkInTime),
                              parseISO(event.startTime)
                            )} minutes late)`
                          )}
                        </Typography>
                      )}
                      {record.note && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Note: {record.note}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                    <Select
                      value={record.status}
                      onChange={(e) => handleUpdateStatus(record.user._id, e.target.value)}
                    >
                      {Object.entries(ATTENDANCE_STATUS).map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    onClick={() => setEditingNote(record)}
                    size="small"
                  >
                    <NoteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {editingNote && (
        <AttendanceNote
          note={editingNote.note}
          onEdit={(note) => handleUpdateNote(editingNote.user._id, note)}
          onClose={() => setEditingNote(null)}
        />
      )}
    </Paper>
  );
};

export default EventAttendance;
