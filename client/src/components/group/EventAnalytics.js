import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  isBefore,
  isAfter,
  subMonths,
} from 'date-fns';
import { EVENT_TYPES } from './GroupEvents';

const RESPONSE_COLORS = {
  going: '#4caf50',
  maybe: '#ff9800',
  not_going: '#f44336',
};

const StatCard = ({ title, value, subtitle, icon: Icon }) => {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              mr: 2,
            }}
          >
            <Icon color="primary" />
          </Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const EventAnalytics = ({ groupId }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsTab, setAnalyticsTab] = useState('overview');
  const theme = useTheme();
  
  const { events } = useSelector(state => state.events);
  const groupEvents = events[groupId] || [];

  const getTimeRangeEvents = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      default:
        startDate = startOfMonth(now);
    }

    return groupEvents.filter(
      event =>
        isAfter(parseISO(event.startTime), startDate) &&
        isBefore(parseISO(event.startTime), now)
    );
  };

  const calculateStats = () => {
    const timeRangeEvents = getTimeRangeEvents();
    const totalEvents = timeRangeEvents.length;
    const totalParticipants = timeRangeEvents.reduce(
      (sum, event) => sum + event.responses.filter(r => r.response === 'going').length,
      0
    );
    const averageParticipants = totalEvents ? (totalParticipants / totalEvents).toFixed(1) : 0;

    const typeDistribution = timeRangeEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});

    const responseRates = timeRangeEvents.reduce(
      (acc, event) => {
        event.responses.forEach(response => {
          acc[response.response] = (acc[response.response] || 0) + 1;
        });
        return acc;
      },
      { going: 0, maybe: 0, not_going: 0 }
    );

    const monthlyEvents = eachMonthOfInterval({
      start: subMonths(new Date(), 6),
      end: new Date(),
    }).map(date => ({
      month: format(date, 'MMM'),
      count: timeRangeEvents.filter(
        event =>
          format(parseISO(event.startTime), 'MMM yyyy') ===
          format(date, 'MMM yyyy')
      ).length,
    }));

    return {
      totalEvents,
      totalParticipants,
      averageParticipants,
      typeDistribution,
      responseRates,
      monthlyEvents,
    };
  };

  const stats = calculateStats();

  const renderOverview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle={`In the last ${timeRange}`}
          icon={EventIcon}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          subtitle="Confirmed attendees"
          icon={GroupIcon}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Avg. Participants"
          value={stats.averageParticipants}
          subtitle="Per event"
          icon={TrendingUpIcon}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Response Rate"
          value={`${((stats.responseRates.going + stats.responseRates.maybe) /
            Object.values(stats.responseRates).reduce((a, b) => a + b, 0) *
            100).toFixed(1)}%`}
          subtitle="Going or Maybe"
          icon={CheckCircleIcon}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Event Frequency
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyEvents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill={theme.palette.primary.main} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Event Types
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.typeDistribution).map(([key, value]) => ({
                  name: EVENT_TYPES[key].label,
                  value,
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {Object.keys(EVENT_TYPES).map((type, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={theme.palette[['primary', 'success', 'info', 'warning'][index]].main}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderParticipationAnalytics = () => {
    const timeRangeEvents = getTimeRangeEvents();
    const participationData = timeRangeEvents.map(event => ({
      title: event.title,
      date: format(parseISO(event.startTime), 'MMM d, yyyy'),
      going: event.responses.filter(r => r.response === 'going').length,
      maybe: event.responses.filter(r => r.response === 'maybe').length,
      notGoing: event.responses.filter(r => r.response === 'not_going').length,
      total: event.responses.length,
      responseRate: `${(event.responses.length / (event.maxParticipants || 1) * 100).toFixed(1)}%`,
    }));

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Going</TableCell>
              <TableCell align="right">Maybe</TableCell>
              <TableCell align="right">Not Going</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Response Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participationData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.going}
                    size="small"
                    color="success"
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.maybe}
                    size="small"
                    color="warning"
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.notGoing}
                    size="small"
                    color="error"
                  />
                </TableCell>
                <TableCell align="right">{row.total}</TableCell>
                <TableCell align="right">{row.responseRate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={timeRange}
          onChange={(e, newValue) => setTimeRange(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="This Month" value="month" />
          <Tab label="Last 3 Months" value="3months" />
          <Tab label="Last 6 Months" value="6months" />
        </Tabs>

        <Tabs
          value={analyticsTab}
          onChange={(e, newValue) => setAnalyticsTab(newValue)}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Participation" value="participation" />
        </Tabs>
      </Box>

      {analyticsTab === 'overview' ? renderOverview() : renderParticipationAnalytics()}
    </Box>
  );
};

export default EventAnalytics;
