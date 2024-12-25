import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  LinearProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Slider,
  Tooltip,
  Avatar,
  AvatarGroup,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { updateItemProgress } from '../../store/slices/listSlice';
import websocketService from '../../services/websocket';

const ProgressHistory = ({ history }) => {
  return (
    <List dense>
      {history.map((entry, index) => (
        <ListItem key={index}>
          <ListItemText
            primary={`${entry.progress}% - by ${entry.user.username}`}
            secondary={format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
          />
        </ListItem>
      ))}
    </List>
  );
};

const ProgressItem = ({ item, listId, onProgressChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingProgress, setEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(item.progress);
  
  const handleProgressChange = (event, newValue) => {
    setTempProgress(newValue);
  };

  const handleProgressSubmit = () => {
    onProgressChange(item._id, tempProgress);
    setEditingProgress(false);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 40) return 'warning';
    return 'error';
  };

  return (
    <>
      <ListItem>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {item.title}
              {item.assignees.length > 0 && (
                <AvatarGroup max={3} sx={{ ml: 2 }}>
                  {item.assignees.map((assignee) => (
                    <Tooltip key={assignee._id} title={assignee.username}>
                      <Avatar
                        src={assignee.profilePicture}
                        sx={{ width: 24, height: 24 }}
                      >
                        {assignee.username[0].toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}
            </Box>
          }
          secondary={
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  color={getProgressColor(item.progress)}
                  sx={{ flexGrow: 1, mr: 2 }}
                />
                <Typography variant="body2">
                  {item.progress}%
                </Typography>
              </Box>
              {item.deadline && (
                <Typography variant="caption" color="text.secondary">
                  Due: {format(new Date(item.deadline), 'MMM d, yyyy')}
                </Typography>
              )}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            size="small"
            onClick={() => setShowHistory(true)}
          >
            <HistoryIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setEditingProgress(true)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={expanded}>
        <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        </Box>
      </Collapse>

      {/* Progress Edit Dialog */}
      <Dialog open={editingProgress} onClose={() => setEditingProgress(false)}>
        <DialogTitle>Update Progress</DialogTitle>
        <DialogContent>
          <Box sx={{ width: 300, mt: 2 }}>
            <Slider
              value={tempProgress}
              onChange={handleProgressChange}
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingProgress(false)}>Cancel</Button>
          <Button onClick={handleProgressSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)}>
        <DialogTitle>Progress History</DialogTitle>
        <DialogContent>
          <ProgressHistory history={item.progressHistory || []} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ProgressTracker = ({ listId }) => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.lists);
  const listItems = items[listId] || [];

  const handleProgressChange = (itemId, progress) => {
    dispatch(updateItemProgress({ listId, itemId, progress }));
    websocketService.updateItemProgress(listId, itemId, progress);
  };

  const calculateOverallProgress = () => {
    if (listItems.length === 0) return 0;
    const totalProgress = listItems.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / listItems.length);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Progress Tracker"
        subheader={`Overall Progress: ${calculateOverallProgress()}%`}
      />
      <CardContent>
        <LinearProgress
          variant="determinate"
          value={calculateOverallProgress()}
          sx={{ mb: 3 }}
        />
        <List>
          {listItems.map((item) => (
            <ProgressItem
              key={item._id}
              item={item}
              listId={listId}
              onProgressChange={handleProgressChange}
            />
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
