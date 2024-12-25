import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
  ListAlt as ListIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import FileUpload from '../components/common/FileUpload';

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { groups } = useSelector((state) => state.groups);
  const { lists } = useSelector((state) => state.lists);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setProfileData({
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      password: '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (profileData.newPassword !== profileData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      // TODO: Implement profile update logic
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      // TODO: Implement profile picture upload logic
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Avatar
                src={user.profilePicture}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
              {!editing && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleEdit}
                  startIcon={<EditIcon />}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
            
            {editing ? (
              <Box component="form" onSubmit={handleSubmit}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <FileUpload
                  onUpload={handleProfilePictureUpload}
                  maxFiles={1}
                  acceptedTypes="image/*"
                />

                <TextField
                  fullWidth
                  margin="normal"
                  name="username"
                  label="Username"
                  value={profileData.username}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  name="email"
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  name="bio"
                  label="Bio"
                  multiline
                  rows={3}
                  value={profileData.bio}
                  onChange={handleChange}
                />

                <Divider sx={{ my: 2 }}>Change Password</Divider>

                <TextField
                  fullWidth
                  margin="normal"
                  name="password"
                  label="Current Password"
                  type="password"
                  value={profileData.password}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={profileData.newPassword}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={handleChange}
                  error={profileData.newPassword !== profileData.confirmPassword}
                  helperText={
                    profileData.newPassword !== profileData.confirmPassword
                      ? 'Passwords do not match'
                      : ''
                  }
                />

                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6">{user.username}</Typography>
                <Typography color="textSecondary">{user.email}</Typography>
                {user.bio && (
                  <Typography sx={{ mt: 2 }}>{user.bio}</Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Activity and Stats */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Groups" />
              <Tab label="Lists" />
              <Tab label="Activity" />
            </Tabs>

            {/* Groups Tab */}
            {activeTab === 0 && (
              <List>
                {groups.map((group) => (
                  <ListItem key={group._id}>
                    <ListItemIcon>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={group.name}
                      secondary={`${group.members.length} members`}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {/* Lists Tab */}
            {activeTab === 1 && (
              <List>
                {lists.map((list) => (
                  <ListItem key={list._id}>
                    <ListItemIcon>
                      <ListIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={list.title}
                      secondary={`${list.items.length} items`}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {/* Activity Tab */}
            {activeTab === 2 && (
              <List>
                {/* TODO: Implement activity feed */}
                <Typography color="textSecondary" align="center">
                  No recent activity
                </Typography>
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
