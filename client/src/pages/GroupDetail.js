import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchGroups, updateGroup, addGroupMember } from '../store/slices/groupSlice';
import { fetchLists } from '../store/slices/listSlice';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GroupDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [openInvite, setOpenInvite] = useState(false);
  
  const { groups, loading, error } = useSelector((state) => state.groups);
  const { lists } = useSelector((state) => state.lists);
  const group = groups.find(g => g._id === id);

  useEffect(() => {
    if (!groups.length) {
      dispatch(fetchGroups());
    }
    dispatch(fetchLists({ groupId: id }));
  }, [dispatch, id, groups.length]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInviteOpen = () => {
    setOpenInvite(true);
  };

  const handleInviteClose = () => {
    setOpenInvite(false);
    setInviteEmail('');
  };

  const handleInviteMember = async () => {
    try {
      await dispatch(addGroupMember({ groupId: id, email: inviteEmail }));
      handleInviteClose();
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  if (loading || !group) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs>
            <Typography variant="h4" component="h1">
              {group.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {group.description}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleInviteOpen}
            >
              Invite Member
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Members" />
          <Tab label="Lists" />
          <Tab label="Wall" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <List>
          {group.members.map((member) => (
            <ListItem key={member.user._id}>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.user.username}
                secondary={`Role: ${member.role}`}
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {lists.map((list) => (
            <Grid item xs={12} sm={6} md={4} key={list._id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{list.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {list.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Items: {list.items?.length || 0}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 2 }}>
          {group.wallPosts.map((post) => (
            <Box key={post._id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                {post.author.username}
              </Typography>
              <Typography variant="body1">
                {post.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Paper>
      </TabPanel>

      <Dialog open={openInvite} onClose={handleInviteClose}>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInviteClose}>Cancel</Button>
          <Button onClick={handleInviteMember} variant="contained">
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupDetail;
