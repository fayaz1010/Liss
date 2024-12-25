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
  Chip,
  CircularProgress,
  Tooltip,
  Tab,
  Tabs,
  Autocomplete,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Mail as MailIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  MailOutline as ReminderIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { format, parseISO, addDays } from 'date-fns';

const INVITE_CHANNELS = {
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  FACEBOOK: 'facebook',
  LINK: 'link',
};

const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  MAYBE: 'maybe',
};

const STATUS_COLORS = {
  [INVITE_STATUS.PENDING]: 'warning',
  [INVITE_STATUS.ACCEPTED]: 'success',
  [INVITE_STATUS.DECLINED]: 'error',
  [INVITE_STATUS.MAYBE]: 'info',
};

const InviteForm = ({ onSubmit, onClose, contacts = [], groups = [] }) => {
  const [formData, setFormData] = useState({
    recipients: [],
    groups: [],
    message: '',
    channels: [INVITE_CHANNELS.EMAIL],
    sendReminder: true,
    reminderDays: 1,
  });

  const [selectedTab, setSelectedTab] = useState(0);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Send Event Invitations</DialogTitle>
      <DialogContent>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Individual Invites" />
          <Tab label="Group Invites" />
        </Tabs>

        {selectedTab === 0 && (
          <Autocomplete
            multiple
            options={contacts}
            getOptionLabel={(option) => option.name}
            value={formData.recipients}
            onChange={(e, newValue) => setFormData({ ...formData, recipients: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Recipients"
                placeholder="Select contacts"
                fullWidth
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  avatar={<Avatar src={option.profilePicture}>{option.name[0]}</Avatar>}
                  label={option.name}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        )}

        {selectedTab === 1 && (
          <Autocomplete
            multiple
            options={groups}
            getOptionLabel={(option) => option.name}
            value={formData.groups}
            onChange={(e, newValue) => setFormData({ ...formData, groups: newValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Groups"
                placeholder="Select groups"
                fullWidth
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  icon={<GroupIcon />}
                  label={`${option.name} (${option.memberCount} members)`}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Personal Message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Add a personal message to your invitation..."
          sx={{ mt: 2 }}
        />

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Send via
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.entries(INVITE_CHANNELS).map(([key, value]) => (
            <Chip
              key={key}
              label={value}
              icon={
                value === INVITE_CHANNELS.EMAIL ? <MailIcon /> :
                value === INVITE_CHANNELS.WHATSAPP ? <WhatsAppIcon /> :
                value === INVITE_CHANNELS.FACEBOOK ? <FacebookIcon /> :
                <LinkIcon />
              }
              onClick={() => {
                const channels = formData.channels.includes(value)
                  ? formData.channels.filter(c => c !== value)
                  : [...formData.channels, value];
                setFormData({ ...formData, channels });
              }}
              color={formData.channels.includes(value) ? 'primary' : 'default'}
              variant={formData.channels.includes(value) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.sendReminder}
                onChange={(e) => setFormData({ ...formData, sendReminder: e.target.checked })}
              />
            }
            label="Send reminder before event"
          />
          {formData.sendReminder && (
            <TextField
              type="number"
              size="small"
              value={formData.reminderDays}
              onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
              InputProps={{
                endAdornment: <Typography variant="body2">days before</Typography>,
              }}
              sx={{ ml: 2, width: 100 }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            (selectedTab === 0 && formData.recipients.length === 0) ||
            (selectedTab === 1 && formData.groups.length === 0) ||
            formData.channels.length === 0
          }
          startIcon={<SendIcon />}
        >
          Send Invites
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ShareOptions = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);
  const eventLink = `${window.location.origin}/events/${event._id}`;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (channel) => {
    const text = `Join me at ${event.title}! ${eventLink}`;
    
    switch (channel) {
      case INVITE_CHANNELS.WHATSAPP:
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case INVITE_CHANNELS.FACEBOOK:
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventLink)}`);
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Event</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <QRCode value={eventLink} size={200} level="H" />
        </Box>

        <TextField
          fullWidth
          value={eventLink}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={() => handleCopy(eventLink)}>
                <CopyIcon />
              </IconButton>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<WhatsAppIcon />}
              onClick={() => handleShare(INVITE_CHANNELS.WHATSAPP)}
            >
              Share on WhatsApp
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon />}
              onClick={() => handleShare(INVITE_CHANNELS.FACEBOOK)}
            >
              Share on Facebook
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => {
                // Generate and download ICS file
                const icsContent = generateICSFile(event);
                const blob = new Blob([icsContent], { type: 'text/calendar' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${event.title}.ics`;
                a.click();
              }}
            >
              Add to Calendar
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard"
      />
    </Dialog>
  );
};

const EventInvites = ({ event }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const dispatch = useDispatch();
  
  const { invites, loading } = useSelector(state => state.eventInvites);
  const eventInvites = invites[event._id] || [];
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchEventInvites(event._id));
  }, [dispatch, event._id]);

  const handleSendInvites = async (inviteData) => {
    try {
      await dispatch(sendInvites({
        eventId: event._id,
        ...inviteData,
      }));
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error sending invites:', error);
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      await dispatch(resendInvite({
        eventId: event._id,
        inviteId,
      }));
    } catch (error) {
      console.error('Error resending invite:', error);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      try {
        await dispatch(cancelInvite({
          eventId: event._id,
          inviteId,
        }));
      } catch (error) {
        console.error('Error canceling invite:', error);
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
          <Typography variant="h6">Event Invitations</Typography>
          <Box>
            <Button
              startIcon={<LinkIcon />}
              onClick={() => setShowShareOptions(true)}
              sx={{ mr: 1 }}
            >
              Share
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setShowInviteForm(true)}
            >
              Send Invites
            </Button>
          </Box>
        </Box>

        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="All Invites" />
          <Tab label="Pending" />
          <Tab label="Accepted" />
          <Tab label="Declined" />
        </Tabs>

        <List>
          {eventInvites
            .filter(invite => 
              selectedTab === 0 ||
              (selectedTab === 1 && invite.status === INVITE_STATUS.PENDING) ||
              (selectedTab === 2 && invite.status === INVITE_STATUS.ACCEPTED) ||
              (selectedTab === 3 && invite.status === INVITE_STATUS.DECLINED)
            )
            .map((invite) => (
              <ListItem key={invite._id}>
                <ListItemAvatar>
                  <Avatar src={invite.recipient.profilePicture}>
                    {invite.recipient.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {invite.recipient.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={invite.status}
                        color={STATUS_COLORS[invite.status]}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sent via {invite.channel} • {formatDistanceToNow(parseISO(invite.sentAt))} ago
                      </Typography>
                      {invite.respondedAt && (
                        <Typography variant="body2" color="text.secondary">
                          Responded {formatDistanceToNow(parseISO(invite.respondedAt))} ago
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {invite.status === INVITE_STATUS.PENDING && (
                    <>
                      <IconButton
                        onClick={() => handleResendInvite(invite._id)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <RefreshIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleCancelInvite(invite._id)}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </Box>

      {showInviteForm && (
        <InviteForm
          onSubmit={handleSendInvites}
          onClose={() => setShowInviteForm(false)}
          contacts={[]} // Pass user's contacts
          groups={[]} // Pass user's groups
        />
      )}

      {showShareOptions && (
        <ShareOptions
          event={event}
          onClose={() => setShowShareOptions(false)}
        />
      )}
    </Paper>
  );
};

export default EventInvites;
