import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Slider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  fetchLists, 
  createItem, 
  updateItemProgress, 
  updateList 
} from '../store/slices/listSlice';

const ListDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openNewItem, setOpenNewItem] = useState(false);
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    quantity: 1,
    deadline: '',
    price: { amount: 0, currency: 'USD' },
    weight: { value: 0, unit: 'kg' },
  });

  const { lists, loading, error } = useSelector((state) => state.lists);
  const list = lists.find(l => l._id === id);

  useEffect(() => {
    if (!lists.length) {
      dispatch(fetchLists());
    }
  }, [dispatch, lists.length]);

  const handleOpenNewItem = () => {
    setOpenNewItem(true);
  };

  const handleCloseNewItem = () => {
    setOpenNewItem(false);
    setItemData({
      title: '',
      description: '',
      quantity: 1,
      deadline: '',
      price: { amount: 0, currency: 'USD' },
      weight: { value: 0, unit: 'kg' },
    });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setItemData({
        ...itemData,
        [parent]: { ...itemData[parent], [child]: value },
      });
    } else {
      setItemData({ ...itemData, [name]: value });
    }
  };

  const handleCreateItem = async () => {
    await dispatch(createItem({ listId: id, itemData }));
    handleCloseNewItem();
  };

  const handleProgressChange = async (itemId, newValue) => {
    await dispatch(updateItemProgress({ listId: id, itemId, progress: newValue }));
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(list.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    await dispatch(updateList({
      listId: id,
      listData: { items: items.map(item => item._id) },
    }));
  };

  if (loading || !list) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h4" component="h1">
              {list.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {list.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label={list.type} color="primary" sx={{ mr: 1 }} />
              {list.group && (
                <Chip label={`Group: ${list.group.name}`} color="secondary" />
              )}
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenNewItem}
            >
              Add Item
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="list-items">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {list.items?.map((item, index) => (
                <Draggable key={item._id} draggableId={item._id} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{ mb: 2 }}
                    >
                      <ListItem>
                        <ListItemText
                          primary={item.title}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {item.description}
                              </Typography>
                              {item.deadline && (
                                <Typography variant="caption" display="block">
                                  Due: {new Date(item.deadline).toLocaleDateString()}
                                </Typography>
                              )}
                              {item.price?.amount > 0 && (
                                <Typography variant="caption" display="block">
                                  Price: {item.price.amount} {item.price.currency}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction sx={{ width: '200px' }}>
                          <Box sx={{ mr: 6 }}>
                            <Slider
                              value={item.progress}
                              onChange={(_, value) => 
                                handleProgressChange(item._id, value)
                              }
                              aria-labelledby="progress-slider"
                              valueLabelDisplay="auto"
                              step={10}
                              marks
                              min={0}
                              max={100}
                            />
                          </Box>
                          <IconButton edge="end" aria-label="edit">
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={openNewItem} onClose={handleCloseNewItem} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={itemData.title}
            onChange={handleItemChange}
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
            value={itemData.description}
            onChange={handleItemChange}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                variant="outlined"
                value={itemData.quantity}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="deadline"
                label="Deadline"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={itemData.deadline}
                onChange={handleItemChange}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="price.amount"
                label="Price"
                type="number"
                fullWidth
                variant="outlined"
                value={itemData.price.amount}
                onChange={handleItemChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                name="price.currency"
                label="Currency"
                select
                fullWidth
                variant="outlined"
                value={itemData.price.currency}
                onChange={handleItemChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewItem}>Cancel</Button>
          <Button onClick={handleCreateItem} variant="contained">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListDetail;
