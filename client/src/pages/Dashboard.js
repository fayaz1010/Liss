import React from 'react';
import { useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const stats = [
    {
      title: 'My Groups',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      value: '5',
      action: () => navigate('/groups'),
      actionText: 'View Groups',
    },
    {
      title: 'Active Lists',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
      value: '12',
      action: () => navigate('/lists'),
      actionText: 'View Lists',
    },
    {
      title: 'Upcoming Events',
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      value: '3',
      action: () => navigate('/calendar'),
      actionText: 'View Calendar',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username || 'User'}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 200,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                {stat.icon}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                {stat.value}
              </Typography>
              <Button
                variant="contained"
                onClick={stat.action}
                sx={{ mt: 'auto' }}
              >
                {stat.actionText}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom>
        Recent Activity
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="body1">
                No recent activity to display.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/groups')}>
                Join a Group
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
