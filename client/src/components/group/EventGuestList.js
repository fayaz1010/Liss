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
  Badge,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Menu,
  Divider,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckedInIcon,
  Cancel as NotCheckedInIcon,
  Message as MessageIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  Notes as NotesIcon,
  MoreVert as MoreIcon,
  Download as ExportIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Label as TagIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const GUEST_STATUS = {
  CONFIRMED: 'confirmed',
  WAITLISTED: 'waitlisted',
  CANCELLED: 'cancelled',
};

const STATUS_COLORS = {
  [GUEST_STATUS.CONFIRMED]: 'success',
  [GUEST_STATUS.WAITLISTED]: 'warning',
  [GUEST_STATUS.CANCELLED]: 'error',
};

const GuestForm = ({ guest, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: GUEST_STATUS.CONFIRMED,
    tags: [],
    notes: '',
    dietaryRestrictions: '',
    guestCount: 1,
    ...guest,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {guest ? 'Edit Guest' : 'Add Guest'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                {Object.entries(GUEST_STATUS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tags"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean),
              })}
              placeholder="Enter tags separated by commas"
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
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Additional Guests"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
              InputProps={{
                inputProps: { min: 1 },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.name}
        >
          Save Guest
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GuestFilters = ({ filters, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        startIcon={<FilterIcon />}
        onClick={handleClick}
        variant="outlined"
        size="small"
      >
        Filters
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          {Object.entries(GUEST_STATUS).map(([key, value]) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={filters.status.includes(value)}
                  onChange={(e) => {
                    const newStatus = e.target.checked
                      ? [...filters.status, value]
                      : filters.status.filter(s => s !== value);
                    onFilterChange({ ...filters, status: newStatus });
                  }}
                />
              }
              label={value.charAt(0).toUpperCase() + value.slice(1)}
            />
          ))}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Check-in Status
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.checkedIn}
                onChange={(e) => onFilterChange({ ...filters, checkedIn: e.target.checked })}
              />
            }
            label="Checked In"
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Tags
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Filter by tags"
            value={filters.tags.join(', ')}
            onChange={(e) => onFilterChange({
              ...filters,
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean),
            })}
          />
        </Box>
      </Menu>
    </>
  );
};

const EventGuestList = ({ event }) => {
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [filters, setFilters] = useState({
    status: [],
    checkedIn: false,
    tags: [],
    search: '',
  });
  const [sortBy, setSortBy] = useState('name');
  const [selectedGuests, setSelectedGuests] = useState([]);
  const dispatch = useDispatch();
  
  const { guests, loading } = useSelector(state => state.eventGuests);
  const eventGuests = guests[event._id] || [];

  useEffect(() => {
    dispatch(fetchEventGuests(event._id));
  }, [dispatch, event._id]);

  const handleSubmitGuest = async (guestData) => {
    try {
      if (selectedGuest) {
        await dispatch(updateGuest({
          eventId: event._id,
          guestId: selectedGuest._id,
          updates: guestData,
        }));
      } else {
        await dispatch(createGuest({
          eventId: event._id,
          ...guestData,
        }));
      }
      setShowGuestForm(false);
      setSelectedGuest(null);
    } catch (error) {
      console.error('Error submitting guest:', error);
    }
  };

  const handleDeleteGuest = async (guestId) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await dispatch(deleteGuest({
          eventId: event._id,
          guestId,
        }));
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  const handleExport = () => {
    const csvContent = generateGuestListCSV(
      selectedGuests.length > 0 ? selectedGuests : eventGuests
    );
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-list-${event.title}.csv`;
    a.click();
  };

  const filteredGuests = eventGuests
    .filter(guest => {
      if (filters.status.length > 0 && !filters.status.includes(guest.status)) {
        return false;
      }
      if (filters.checkedIn && !guest.checkedIn) {
        return false;
      }
      if (filters.tags.length > 0 && !filters.tags.some(tag => guest.tags.includes(tag))) {
        return false;
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          guest.name.toLowerCase().includes(searchTerm) ||
          guest.email.toLowerCase().includes(searchTerm) ||
          guest.phone.includes(searchTerm)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'checkIn':
          return (b.checkedIn ? 1 : 0) - (a.checkedIn ? 1 : 0);
        default:
          return 0;
      }
    });

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
          <Typography variant="h6">Guest List</Typography>
          <Box>
            <Button
              startIcon={<ExportIcon />}
              onClick={handleExport}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button
              startIcon={<PersonAddIcon />}
              variant="contained"
              onClick={() => setShowGuestForm(true)}
            >
              Add Guest
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search guests..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <GuestFilters
            filters={filters}
            onFilterChange={setFilters}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              startAdornment={<SortIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="name">Sort by Name</MenuItem>
              <MenuItem value="status">Sort by Status</MenuItem>
              <MenuItem value="checkIn">Sort by Check-in</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <List>
          {filteredGuests.map((guest) => (
            <ListItem
              key={guest._id}
              selected={selectedGuests.includes(guest._id)}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    guest.checkedIn ? (
                      <CheckedInIcon fontSize="small" color="success" />
                    ) : (
                      <NotCheckedInIcon fontSize="small" color="error" />
                    )
                  }
                >
                  <Avatar>{guest.name[0]}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {guest.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={guest.status}
                      color={STATUS_COLORS[guest.status]}
                    />
                    {guest.guestCount > 1 && (
                      <Chip
                        size="small"
                        icon={<GroupIcon />}
                        label={`+${guest.guestCount - 1}`}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                      {guest.email && (
                        <Typography variant="body2" color="text.secondary">
                          <EmailIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {guest.email}
                        </Typography>
                      )}
                      {guest.phone && (
                        <Typography variant="body2" color="text.secondary">
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {guest.phone}
                        </Typography>
                      )}
                    </Box>
                    {guest.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {guest.tags.map((tag) => (
                          <Chip
                            key={tag}
                            size="small"
                            label={tag}
                            icon={<TagIcon />}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => {
                    setSelectedGuest(guest);
                    setShowGuestForm(true);
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteGuest(guest._id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      {showGuestForm && (
        <GuestForm
          guest={selectedGuest}
          onSubmit={handleSubmitGuest}
          onClose={() => {
            setShowGuestForm(false);
            setSelectedGuest(null);
          }}
        />
      )}
    </Paper>
  );
};

export default EventGuestList;
