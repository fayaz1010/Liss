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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Security as SecurityIcon,
  SupervisorAccount as OrganizerIcon,
  Person as ParticipantIcon,
} from '@mui/icons-material';

const ROLE_TYPES = {
  ORGANIZER: {
    id: 'organizer',
    label: 'Organizer',
    icon: OrganizerIcon,
    color: 'primary',
    permissions: [
      'manage_event',
      'manage_roles',
      'manage_participants',
      'manage_discussions',
      'manage_checkins',
    ],
  },
  MODERATOR: {
    id: 'moderator',
    label: 'Moderator',
    icon: SecurityIcon,
    color: 'secondary',
    permissions: ['manage_discussions', 'manage_checkins'],
  },
  PARTICIPANT: {
    id: 'participant',
    label: 'Participant',
    icon: ParticipantIcon,
    color: 'default',
    permissions: ['view_event', 'participate_discussions'],
  },
};

const RoleDialog = ({ open, onClose, role, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'participant',
    description: '',
    maxUsers: '',
    permissions: [],
    ...role,
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {role ? 'Edit Role' : 'Create Role'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Role Name"
            value={formData.name}
            onChange={handleChange('name')}
          />

          <FormControl fullWidth>
            <InputLabel>Role Type</InputLabel>
            <Select
              value={formData.type}
              onChange={handleChange('type')}
              label="Role Type"
            >
              {Object.entries(ROLE_TYPES).map(([key, { label }]) => (
                <MenuItem key={key} value={key.toLowerCase()}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
          />

          <TextField
            fullWidth
            type="number"
            label="Max Users (optional)"
            value={formData.maxUsers}
            onChange={handleChange('maxUsers')}
            InputProps={{ inputProps: { min: 1 } }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Permissions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {ROLE_TYPES[formData.type.toUpperCase()].permissions.map((permission) => (
              <Chip
                key={permission}
                label={permission.replace('_', ' ')}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.name || !formData.type}
        >
          {role ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AssignRoleDialog = ({ open, onClose, roles, users, onSubmit }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const handleSubmit = () => {
    onSubmit({ roleId: selectedRole, userId: selectedUser });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Role</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              label="User"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedRole || !selectedUser}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventRoles = ({ eventId }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  const dispatch = useDispatch();
  const { roles, loading } = useSelector(state => state.eventRoles);
  const eventRoles = roles[eventId] || [];
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchEventRoles(eventId));
  }, [dispatch, eventId]);

  const handleCreateRole = async (roleData) => {
    try {
      await dispatch(createRole({ eventId, ...roleData }));
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async (roleData) => {
    try {
      await dispatch(updateRole({
        eventId,
        roleId: roleData._id,
        updates: roleData,
      }));
      setEditingRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await dispatch(deleteRole({ eventId, roleId }));
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleAssignRole = async (data) => {
    try {
      await dispatch(assignRole({
        eventId,
        ...data,
      }));
      setAssignDialogOpen(false);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (roleId, userId) => {
    if (window.confirm('Are you sure you want to remove this role assignment?')) {
      try {
        await dispatch(removeRole({ eventId, roleId, userId }));
      } catch (error) {
        console.error('Error removing role:', error);
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
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Event Roles</Typography>
        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Create Role
          </Button>
          <Button
            startIcon={<PersonAddIcon />}
            onClick={() => setAssignDialogOpen(true)}
          >
            Assign Role
          </Button>
        </Box>
      </Box>

      <List>
        {eventRoles.map((role) => (
          <ListItem key={role._id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: ROLE_TYPES[role.type.toUpperCase()].color }}>
                {React.createElement(ROLE_TYPES[role.type.toUpperCase()].icon)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {role.name}
                  {role.maxUsers && (
                    <Chip
                      size="small"
                      label={`${role.users.length}/${role.maxUsers}`}
                      color={role.users.length >= role.maxUsers ? 'error' : 'default'}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {role.users.map((user) => (
                      <Chip
                        key={user._id}
                        size="small"
                        label={user.username}
                        onDelete={() => handleRemoveRole(role._id, user._id)}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => setEditingRole(role)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteRole(role._id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <RoleDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateRole}
      />

      <RoleDialog
        open={Boolean(editingRole)}
        onClose={() => setEditingRole(null)}
        role={editingRole}
        onSubmit={handleUpdateRole}
      />

      <AssignRoleDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        roles={eventRoles}
        users={[]} // Pass list of users who can be assigned roles
        onSubmit={handleAssignRole}
      />
    </Paper>
  );
};

export default EventRoles;
