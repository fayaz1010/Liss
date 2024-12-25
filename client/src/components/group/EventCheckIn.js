import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
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
  Tooltip,
  Badge,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  QrCodeScanner as QrScannerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import QrReader from 'react-qr-reader';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

const CheckInQRCode = ({ checkInCode, onClose }) => (
  <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Check-In QR Code</DialogTitle>
    <DialogContent>
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <QRCode
          value={checkInCode}
          size={200}
          level="H"
          includeMargin
        />
        <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
          Scan to check in to the event
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'background.default',
            borderRadius: 1,
            fontFamily: 'monospace',
          }}
        >
          {checkInCode}
        </Typography>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      onScan(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Failed to access camera. Please try again.');
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan QR Code</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

const CheckInStats = ({ stats }) => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6} md={3}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">Total Check-ins</Typography>
        </Box>
        <Typography variant="h4">{stats.totalCheckIns}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <GroupIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">Expected</Typography>
        </Box>
        <Typography variant="h4">{stats.expectedAttendees}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TimerIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">Avg. Check-in Time</Typography>
        </Box>
        <Typography variant="h4">{stats.averageCheckInTime} min</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StatsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">Check-in Rate</Typography>
        </Box>
        <Typography variant="h4">
          {((stats.totalCheckIns / stats.expectedAttendees) * 100).toFixed(1)}%
        </Typography>
      </Paper>
    </Grid>
  </Grid>
);

const EventCheckIn = ({ event }) => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [checkInCode, setCheckInCode] = useState(null);
  const dispatch = useDispatch();
  
  const { checkIns, loading } = useSelector(state => state.eventCheckIns);
  const eventCheckIns = checkIns[event._id] || [];
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchEventCheckIns(event._id));
  }, [dispatch, event._id]);

  useEffect(() => {
    // Generate or fetch check-in code
    const code = generateCheckInCode(event._id);
    setCheckInCode(code);
  }, [event._id]);

  const handleManualCheckIn = async (userId) => {
    try {
      await dispatch(checkInUser({
        eventId: event._id,
        userId,
        method: 'manual',
      }));
    } catch (error) {
      console.error('Error checking in user:', error);
    }
  };

  const handleQRCheckIn = async (code) => {
    try {
      await dispatch(checkInUser({
        eventId: event._id,
        code,
        method: 'qr',
      }));
      setShowScanner(false);
    } catch (error) {
      console.error('Error checking in with QR code:', error);
    }
  };

  const handleUndoCheckIn = async (checkInId) => {
    if (window.confirm('Are you sure you want to undo this check-in?')) {
      try {
        await dispatch(undoCheckIn({
          eventId: event._id,
          checkInId,
        }));
      } catch (error) {
        console.error('Error undoing check-in:', error);
      }
    }
  };

  const stats = {
    totalCheckIns: eventCheckIns.length,
    expectedAttendees: event.responses.filter(r => r.response === 'going').length,
    averageCheckInTime: calculateAverageCheckInTime(eventCheckIns),
  };

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Event Check-In</Typography>
          <Box>
            <Button
              startIcon={<QrCodeIcon />}
              onClick={() => setShowQRCode(true)}
              sx={{ mr: 1 }}
            >
              Show QR Code
            </Button>
            <Button
              startIcon={<QrScannerIcon />}
              onClick={() => setShowScanner(true)}
            >
              Scan QR Code
            </Button>
          </Box>
        </Box>

        <CheckInStats stats={stats} />

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
          Check-in History
        </Typography>
        <List>
          {eventCheckIns.map((checkIn) => (
            <ListItem key={checkIn._id}>
              <ListItemAvatar>
                <Avatar src={checkIn.user.profilePicture}>
                  {checkIn.user.username[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={checkIn.user.username}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Checked in {format(parseISO(checkIn.timestamp), 'MMM d, yyyy h:mm a')}
                    </Typography>
                    <Chip
                      size="small"
                      label={`Via ${checkIn.method}`}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleUndoCheckIn(checkIn._id)}
                >
                  <CancelIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      {showQRCode && (
        <CheckInQRCode
          checkInCode={checkInCode}
          onClose={() => setShowQRCode(false)}
        />
      )}

      {showScanner && (
        <QRScanner
          onScan={handleQRCheckIn}
          onClose={() => setShowScanner(false)}
        />
      )}
    </Paper>
  );
};

export default EventCheckIn;
