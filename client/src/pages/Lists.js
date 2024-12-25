import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  LinearProgress,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchLists, createList } from '../store/slices/listSlice';
import { fetchGroups } from '../store/slices/groupSlice';

const listTypes = [
  { value: 'project', label: 'Project Tasks' },
  { value: 'shopping', label: 'Shopping List' },
  { value: 'todo', label: 'Todo List' },
  { value: 'custom', label: 'Custom List' },
];

const Lists = () => {
  const [open, setOpen] = useState(false);
  const [listData, setListData] = useState({
    title: '',
    description: '',
    type: 'todo',
    groupId: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { lists, loading, error } = useSelector((state) => state.lists);
  const { groups } = useSelector((state) => state.groups);

  useEffect(() => {
    dispatch(fetchLists());
    if (!groups.length) {
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setListData({
      title: '',
      description: '',
      type: 'todo',
      groupId: '',
    });
  };

  const handleChange = (e) => {
    setListData({ ...listData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await dispatch(createList(listData));
    handleClose();
  };

  const handleListClick = (listId) => {
    navigate(`/lists/${listId}`);
  };

  const calculateProgress = (list) => {
    if (!list.items?.length) return 0;
    const completedItems = list.items.filter(item => item.progress === 100).length;
    return (completedItems / list.items.length) * 100;
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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {lists.map((list) => (
          <Grid item xs={12} sm={6} md={4} key={list._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {list.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {list.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={list.type}
                    color="primary"
                    size="small"
                  />
                  {list.group && (
                    <Chip
                      label={list.group.name}
                      color="secondary"
                      size="small"
                    />
                  )}
                </Box>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(list)} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {list.items?.length || 0} items
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => handleListClick(list._id)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleClickOpen}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="List Title"
            type="text"
            fullWidth
            variant="outlined"
            value={listData.title}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={listData.description}
            onChange={handleChange}
          />
          <TextField
            select
            margin="dense"
            name="type"
            label="List Type"
            fullWidth
            variant="outlined"
            value={listData.type}
            onChange={handleChange}
          >
            {listTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            name="groupId"
            label="Group (Optional)"
            fullWidth
            variant="outlined"
            value={listData.groupId}
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {groups.map((group) => (
              <MenuItem key={group._id} value={group._id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Lists;
