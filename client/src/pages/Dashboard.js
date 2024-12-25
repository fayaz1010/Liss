import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Group as GroupIcon,
  ListAlt as ListIcon,
  Event as EventIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fetchLists } from '../store/slices/listSlice';
import { fetchGroups } from '../store/slices/groupSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { lists, loading: listsLoading } = useSelector((state) => state.lists);
  const { groups, loading: groupsLoading } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLists());
    dispatch(fetchGroups());
  }, [dispatch]);

  const calculateOverallProgress = () => {
    const allItems = lists.flatMap(list => list.items);
    if (allItems.length === 0) return 0;
    const totalProgress = allItems.reduce((sum, item) => sum + (item.progress || 0), 0);
    return Math.round(totalProgress / allItems.length);
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const deadlines = lists
      .flatMap(list => 
        list.items
          .filter(item => item.deadline && new Date(item.deadline) > now)
          .map(item => ({
            ...item,
            listTitle: list.title,
          }))
      )
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
    return deadlines;
  };

  const getRecentActivities = () => {
    const activities = [
      // Group activities
      ...groups.flatMap(group => 
        group.wallPosts.map(post => ({
          type: 'post',
          group: group.name,
          user: post.author.username,
          content: post.content,
          date: new Date(post.createdAt),
        }))
      ),
      // List activities
      ...lists.flatMap(list =>
        list.items
          .filter(item => item.progress > 0)
          .map(item => ({
            type: 'progress',
            list: list.title,
            item: item.title,
            progress: item.progress,
            date: new Date(item.updatedAt),
          }))
      ),
    ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

    return activities;
  };

  if (listsLoading || groupsLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome back, {user.username}!
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Groups
                    </Typography>
                    <Typography variant="h4">
                      {groups.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Active Lists
                    </Typography>
                    <Typography variant="h4">
                      {lists.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Overall Progress
                    </Typography>
                    <Typography variant="h4">
                      {calculateOverallProgress()}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateOverallProgress()} 
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Upcoming Deadlines
                    </Typography>
                    <Typography variant="h4">
                      {getUpcomingDeadlines().length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Timeline>
              {getRecentActivities().map((activity, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={activity.type === 'post' ? 'primary' : 'secondary'}>
                      {activity.type === 'post' ? <GroupIcon /> : <TaskIcon />}
                    </TimelineDot>
                    {index < getRecentActivities().length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" component="span">
                        {activity.type === 'post' 
                          ? `${activity.user} posted in ${activity.group}`
                          : `Progress update in ${activity.list}`}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {activity.type === 'post'
                          ? activity.content
                          : `${activity.item} - ${activity.progress}% complete`}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(activity.date, 'MMM d, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Deadlines
            </Typography>
            <List>
              {getUpcomingDeadlines().map((item) => (
                <ListItem key={item._id}>
                  <ListItemIcon>
                    <EventIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <>
                        <Typography variant="body2" color="textSecondary">
                          {item.listTitle}
                        </Typography>
                        <Typography variant="caption" color="error">
                          Due: {format(new Date(item.deadline), 'MMM d, yyyy')}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={`${item.progress}%`}
                    color={item.progress === 100 ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
