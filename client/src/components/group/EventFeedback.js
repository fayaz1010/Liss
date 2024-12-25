import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
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
  Chip,
  Grid,
  CircularProgress,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  BarChart as StatsIcon,
  EmojiEmotions as EmotionIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const FEEDBACK_CATEGORIES = {
  ORGANIZATION: 'Organization',
  CONTENT: 'Content',
  VENUE: 'Venue',
  TIMING: 'Timing',
  INTERACTION: 'Interaction',
};

const SENTIMENT_EMOJIS = {
  VERY_POSITIVE: '😍',
  POSITIVE: '😊',
  NEUTRAL: '😐',
  NEGATIVE: '😕',
  VERY_NEGATIVE: '😢',
};

const FeedbackForm = ({ onSubmit, initialFeedback = null, onClose }) => {
  const [formData, setFormData] = useState({
    overall: 0,
    categories: Object.keys(FEEDBACK_CATEGORIES).reduce((acc, key) => ({
      ...acc,
      [key.toLowerCase()]: 0,
    }), {}),
    comment: '',
    anonymous: false,
    ...initialFeedback,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialFeedback ? 'Edit Feedback' : 'Event Feedback'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Typography component="legend" gutterBottom>
            Overall Rating
          </Typography>
          <Rating
            name="overall"
            value={formData.overall}
            onChange={(e, value) => setFormData({ ...formData, overall: value })}
            size="large"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Category Ratings
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {Object.entries(FEEDBACK_CATEGORIES).map(([key, label]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ minWidth: 100 }}>
                    {label}
                  </Typography>
                  <Rating
                    name={key.toLowerCase()}
                    value={formData.categories[key.toLowerCase()]}
                    onChange={(e, value) => {
                      setFormData({
                        ...formData,
                        categories: {
                          ...formData.categories,
                          [key.toLowerCase()]: value,
                        },
                      });
                    }}
                    size="small"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.anonymous}
                onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              />
            }
            label="Submit anonymously"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.overall}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FeedbackStats = ({ feedback }) => {
  const theme = useTheme();

  const calculateStats = () => {
    const totalFeedback = feedback.length;
    if (totalFeedback === 0) return null;

    const averageOverall = feedback.reduce((sum, item) => sum + item.overall, 0) / totalFeedback;
    
    const categoryAverages = Object.keys(FEEDBACK_CATEGORIES).reduce((acc, key) => {
      const sum = feedback.reduce((s, item) => s + item.categories[key.toLowerCase()], 0);
      return {
        ...acc,
        [key.toLowerCase()]: sum / totalFeedback,
      };
    }, {});

    const ratingDistribution = feedback.reduce((acc, item) => {
      acc[Math.floor(item.overall)] = (acc[Math.floor(item.overall)] || 0) + 1;
      return acc;
    }, {});

    return {
      averageOverall,
      categoryAverages,
      ratingDistribution,
      totalFeedback,
    };
  };

  const stats = calculateStats();
  if (!stats) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Feedback Overview
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Overall Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ mr: 2 }}>
                {stats.averageOverall.toFixed(1)}
              </Typography>
              <Rating
                value={stats.averageOverall}
                precision={0.1}
                readOnly
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Based on {stats.totalFeedback} reviews
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rating Distribution
            </Typography>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>
                  {rating}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stats.ratingDistribution[rating] || 0) / stats.totalFeedback * 100}
                  sx={{
                    mx: 1,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.primary.main,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ minWidth: 30 }}>
                  {((stats.ratingDistribution[rating] || 0) / stats.totalFeedback * 100).toFixed(0)}%
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Category Ratings
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(FEEDBACK_CATEGORIES).map(([key, label]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ minWidth: 100 }}>
                      {label}
                    </Typography>
                    <Rating
                      value={stats.categoryAverages[key.toLowerCase()]}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {stats.categoryAverages[key.toLowerCase()].toFixed(1)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const EventFeedback = ({ event }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const dispatch = useDispatch();
  
  const { feedback, loading } = useSelector(state => state.eventFeedback);
  const eventFeedback = feedback[event._id] || [];
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchEventFeedback(event._id));
  }, [dispatch, event._id]);

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      if (editingFeedback) {
        await dispatch(updateFeedback({
          eventId: event._id,
          feedbackId: editingFeedback._id,
          updates: feedbackData,
        }));
        setEditingFeedback(null);
      } else {
        await dispatch(createFeedback({
          eventId: event._id,
          ...feedbackData,
        }));
      }
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await dispatch(deleteFeedback({
          eventId: event._id,
          feedbackId,
        }));
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const handleLikeFeedback = async (feedbackId) => {
    try {
      await dispatch(likeFeedback({
        eventId: event._id,
        feedbackId,
      }));
    } catch (error) {
      console.error('Error liking feedback:', error);
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
          <Typography variant="h6">Event Feedback</Typography>
          <Button
            variant="contained"
            onClick={() => setShowFeedbackForm(true)}
          >
            Give Feedback
          </Button>
        </Box>

        <FeedbackStats feedback={eventFeedback} />

        <List>
          {eventFeedback.map((item) => (
            <ListItem key={item._id}>
              <ListItemAvatar>
                {item.anonymous ? (
                  <Avatar>A</Avatar>
                ) : (
                  <Avatar src={item.author.profilePicture}>
                    {item.author.username[0]}
                  </Avatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {item.anonymous ? 'Anonymous' : item.author.username}
                    </Typography>
                    <Rating value={item.overall} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      • {format(parseISO(item.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mb: 1 }}
                    >
                      {item.comment}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(item.categories).map(([key, value]) => (
                        <Chip
                          key={key}
                          size="small"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ mr: 0.5 }}>
                                {FEEDBACK_CATEGORIES[key.toUpperCase()]}:
                              </Typography>
                              <Rating value={value} readOnly size="small" />
                            </Box>
                          }
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => handleLikeFeedback(item._id)}
                  color={item.likes.includes(user.id) ? 'primary' : 'default'}
                >
                  {item.likes.includes(user.id) ? (
                    <ThumbUpIcon />
                  ) : (
                    <ThumbUpOutlinedIcon />
                  )}
                </IconButton>
                {item.author._id === user.id && (
                  <>
                    <IconButton
                      onClick={() => setEditingFeedback(item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteFeedback(item._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      {(showFeedbackForm || editingFeedback) && (
        <FeedbackForm
          onSubmit={handleSubmitFeedback}
          initialFeedback={editingFeedback}
          onClose={() => {
            setShowFeedbackForm(false);
            setEditingFeedback(null);
          }}
        />
      )}
    </Paper>
  );
};

export default EventFeedback;
