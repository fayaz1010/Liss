import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Share as ShareIcon,
  Link as LinkIcon,
  Mail as MailIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode.react';

const SHARE_CHANNELS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    color: '#25D366',
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
    color: '#1877F2',
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: TwitterIcon,
    color: '#1DA1F2',
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: MailIcon,
    color: '#EA4335',
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(
        title
      )}&body=${encodeURIComponent(`${title}\n${url}`)}`,
  },
];

const ShareSettings = ({ settings, onUpdate }) => {
  const handleToggle = (field) => () => {
    onUpdate({
      ...settings,
      [field]: !settings[field],
    });
  };

  return (
    <List>
      <ListItem>
        <ListItemIcon>
          <LinkIcon />
        </ListItemIcon>
        <ListItemText
          primary="Public Link"
          secondary="Anyone with the link can view the event"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            checked={settings.publicLink}
            onChange={handleToggle('publicLink')}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <GroupIcon />
        </ListItemIcon>
        <ListItemText
          primary="Allow Guest RSVP"
          secondary="Non-members can respond to the event"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            checked={settings.allowGuestRsvp}
            onChange={handleToggle('allowGuestRsvp')}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <CalendarIcon />
        </ListItemIcon>
        <ListItemText
          primary="Calendar Export"
          secondary="Allow exporting to calendar apps"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            checked={settings.allowCalendarExport}
            onChange={handleToggle('allowCalendarExport')}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem>
        <ListItemIcon>
          <NotificationsIcon />
        </ListItemIcon>
        <ListItemText
          primary="Guest Notifications"
          secondary="Send updates to non-members"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            checked={settings.guestNotifications}
            onChange={handleToggle('guestNotifications')}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

const EventSharing = ({ event, onClose }) => {
  const [showQR, setShowQR] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    publicLink: true,
    allowGuestRsvp: true,
    allowCalendarExport: true,
    guestNotifications: false,
  });

  const eventUrl = `${window.location.origin}/events/${event._id}`;
  const eventTitle = event.title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async (channel) => {
    const shareUrl = channel.getUrl(eventUrl, eventTitle);
    window.open(shareUrl, '_blank');
  };

  const generateCalendarLink = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const details = `${event.description}\n\nVenue: ${event.venue}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${end
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0]}Z&details=${encodeURIComponent(
      details
    )}&location=${encodeURIComponent(event.venue)}`;
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Event</DialogTitle>
      <DialogContent>
        {!showSettings && !showQR && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Event Link
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={eventUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title="Copy Link">
                  <IconButton onClick={handleCopyLink}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Show QR Code">
                  <IconButton onClick={() => setShowQR(true)}>
                    <QrCodeIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Share via
            </Typography>
            <List>
              {SHARE_CHANNELS.map((channel) => (
                <ListItem
                  button
                  key={channel.id}
                  onClick={() => handleShare(channel)}
                >
                  <ListItemIcon>
                    <channel.icon sx={{ color: channel.color }} />
                  </ListItemIcon>
                  <ListItemText primary={channel.name} />
                </ListItem>
              ))}
            </List>

            {shareSettings.allowCalendarExport && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Calendar
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  fullWidth
                  href={generateCalendarLink()}
                  target="_blank"
                >
                  Add to Google Calendar
                </Button>
              </Box>
            )}
          </>
        )}

        {showQR && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <QRCode value={eventUrl} size={200} level="H" />
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              Scan to view event details
            </Typography>
          </Box>
        )}

        {showSettings && (
          <ShareSettings
            settings={shareSettings}
            onUpdate={setShareSettings}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<SettingsIcon />}
          onClick={() => {
            setShowSettings(!showSettings);
            setShowQR(false);
          }}
        >
          {showSettings ? 'Back' : 'Settings'}
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EventSharing;
