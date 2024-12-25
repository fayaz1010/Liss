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
  Card,
  CardContent,
  Badge,
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as DeclineIcon,
  HelpOutline as MaybeIcon,
  Person as GuestIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Message as MessageIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const RSVP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  MAYBE: 'maybe',
};

const STATUS_COLORS = {
  [RSVP_STATUS.PENDING]: 'warning',
  [RSVP_STATUS.ACCEPTED]: 'success',
  [RSVP_STATUS.DECLINED]: 'error',
  [RSVP_STATUS.MAYBE]: 'info',
};

const RSVPStats = ({ rsvps }) => {
  const stats = {
    total: rsvps.length,
    accepted: rsvps.filter(r => r.status === RSVP_STATUS.ACCEPTED).length,
    declined: rsvps.filter(r => r.status === RSVP_STATUS.DECLINED).length,
    maybe: rsvps.filter(r => r.status === RSVP_STATUS.MAYBE).length,
    pending: rsvps.filter(r => r.status === RSVP_STATUS.PENDING).length,
    totalGuests: rsvps.reduce((sum, r) => sum + (r.guestCount || 0), 0),
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Total Invites</Typography>
            </Box>
            <Typography variant="h4">{stats.total}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AcceptIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Accepted</Typography>
            </Box>
            <Typography variant="h4">{stats.accepted}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DeclineIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Declined</Typography>
            </Box>
            <Typography variant="h4">{stats.declined}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MaybeIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Maybe</Typography>
            </Box>
            <Typography variant="h4">{stats.maybe}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GuestIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Total Guests</Typography>
            </Box>
            <Typography variant="h4">{stats.totalGuests}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle2">Pending</Typography>
            </Box>
            <Typography variant="h4">{stats.pending}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const RSVPForm = ({ rsvp, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    status: RSVP_STATUS.PENDING,
    guestCount: 0,
    dietaryRestrictions: '',
    notes: '',
    ...rsvp,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {rsvp ? 'Edit RSVP' : 'Add RSVP'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>RSVP Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="RSVP Status"
              >
                {Object.entries(RSVP_STATUS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Additional Guests"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dietary Restrictions"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Save RSVP
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventRSVP = ({ event }) => {
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [selectedRSVP, setSelectedRSVP] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const dispatch = useDispatch();
  
  const { rsvps, loading } = useSelector(state => state.eventRSVPs);
  const eventRSVPs = rsvps[event._id] || [];

  useEffect(() => {
    dispatch(fetchEventRSVPs(event._id));
  }, [dispatch, event._id]);

  const handleSubmitRSVP = async (rsvpData) => {
    try {
      if (selectedRSVP) {
        await dispatch(updateRSVP({
          eventId: event._id,
          rsvpId: selectedRSVP._id,
          updates: rsvpData,
        }));
      } else {
        await dispatch(createRSVP({
          eventId: event._id,
          ...rsvpData,
        }));
      }
      setShowRSVPForm(false);
      setSelectedRSVP(null);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
    }
  };

  const handleDeleteRSVP = async (rsvpId) => {
    if (window.confirm('Are you sure you want to delete this RSVP?')) {
      try {
        await dispatch(deleteRSVP({
          eventId: event._id,
          rsvpId,
        }));
      } catch (error) {
        console.error('Error deleting RSVP:', error);
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
          <Typography variant="h6">Event RSVPs</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setShowRSVPForm(true)}
          >
            Add RSVP
          </Button>
        </Box>

        <RSVPStats rsvps={eventRSVPs} />

        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={selectedTab}
              onChange={(e) => setSelectedTab(e.target.value)}
              label="Filter by Status"
            >
              <MenuItem value="all">All RSVPs</MenuItem>
              {Object.entries(RSVP_STATUS).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <List>
            {eventRSVPs
              .filter(rsvp => selectedTab === 'all' || rsvp.status === selectedTab)
              .map((rsvp) => (
                <ListItem key={rsvp._id}>
                  <ListItemAvatar>
                    <Badge
                      badgeContent={rsvp.guestCount}
                      color="primary"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                    >
                      <Avatar src={rsvp.user.profilePicture}>
                        {rsvp.user.name[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {rsvp.user.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={rsvp.status}
                          color={STATUS_COLORS[rsvp.status]}
                        />
                        {rsvp.guestCount > 0 && (
                          <Chip
                            size="small"
                            icon={<GroupIcon />}
                            label={`+${rsvp.guestCount} guests`}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {rsvp.dietaryRestrictions && (
                          <Typography variant="body2" color="text.secondary">
                            Dietary: {rsvp.dietaryRestrictions}
                          </Typography>
                        )}
                        {rsvp.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Notes: {rsvp.notes}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Last updated: {format(parseISO(rsvp.updatedAt), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={() => {
                        setSelectedRSVP(rsvp);
                        setShowRSVPForm(true);
                      }}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteRSVP(rsvp._id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </Box>
      </Box>

      {showRSVPForm && (
        <RSVPForm
          rsvp={selectedRSVP}
          onSubmit={handleSubmitRSVP}
          onClose={() => {
            setShowRSVPForm(false);
            setSelectedRSVP(null);
          }}
        />
      )}
    </Paper>
  );
};

export default EventRSVP;
