import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { EVENT_TYPES } from '../group/GroupEvents';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../../store/slices/eventTemplateSlice';
import { createEvent } from '../../store/slices/eventSlice';

const TemplateForm = ({ open, onClose, template, groupId, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    subType: '',
    duration: 60,
    maxParticipants: '',
    agenda: '',
    venue: '',
    reminders: [],
    recurrence: {
      type: 'none',
      interval: 1,
      unit: 'weeks',
      daysOfWeek: [],
    },
    ...template,
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, groupId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Template' : 'Create Event Template'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.title}
              onChange={handleChange('title')}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.eventType}
                onChange={handleChange('eventType')}
                label="Event Type"
              >
                {Object.entries(EVENT_TYPES).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sub Type</InputLabel>
              <Select
                value={formData.subType}
                onChange={handleChange('subType')}
                label="Sub Type"
                disabled={!formData.eventType}
              >
                {formData.eventType &&
                  EVENT_TYPES[formData.eventType].types.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Duration (minutes)"
              value={formData.duration}
              onChange={handleChange('duration')}
              InputProps={{ inputProps: { min: 15 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Participants"
              value={formData.maxParticipants}
              onChange={handleChange('maxParticipants')}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Venue"
              value={formData.venue}
              onChange={handleChange('venue')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Agenda Template"
              value={formData.agenda}
              onChange={handleChange('agenda')}
              placeholder="Add agenda items separated by new lines"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Default Reminders
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.reminders.map((reminder, index) => (
                <Chip
                  key={index}
                  label={`${reminder.amount} ${reminder.type} before`}
                  onDelete={() => {
                    const newReminders = [...formData.reminders];
                    newReminders.splice(index, 1);
                    setFormData({ ...formData, reminders: newReminders });
                  }}
                />
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData({
                    ...formData,
                    reminders: [
                      ...formData.reminders,
                      { type: 'minutes', amount: 30 },
                    ],
                  });
                }}
              >
                Add Reminder
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Default Recurrence
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Recurrence Type</InputLabel>
              <Select
                value={formData.recurrence.type}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    recurrence: {
                      ...formData.recurrence,
                      type: e.target.value,
                    },
                  });
                }}
                label="Recurrence Type"
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.eventType}
        >
          {template ? 'Update' : 'Create'} Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventTemplates = ({ groupId }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const dispatch = useDispatch();
  const { templates, loading } = useSelector(state => state.eventTemplates);
  const groupTemplates = templates[groupId] || [];

  useEffect(() => {
    dispatch(fetchTemplates(groupId));
  }, [dispatch, groupId]);

  const handleCreateTemplate = async (templateData) => {
    try {
      await dispatch(createTemplate({ groupId, template: templateData }));
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (templateData) => {
    try {
      await dispatch(updateTemplate({
        groupId,
        templateId: templateData._id,
        updates: templateData,
      }));
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await dispatch(deleteTemplate({ groupId, templateId }));
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleCreateEventFromTemplate = async (template) => {
    try {
      const eventData = {
        ...template,
        startTime: new Date().toISOString(),
        groupId,
      };
      await dispatch(createEvent(eventData));
    } catch (error) {
      console.error('Error creating event from template:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Event Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={2}>
        {groupTemplates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {template.description}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${EVENT_TYPES[template.eventType].label} - ${template.subType}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${template.duration} minutes`}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Tooltip title="Create Event">
                  <IconButton
                    onClick={() => handleCreateEventFromTemplate(template)}
                  >
                    <EventIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Template">
                  <IconButton onClick={() => setEditingTemplate(template)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Template">
                  <IconButton
                    onClick={() => handleDeleteTemplate(template._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Template Dialog */}
      <TemplateForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        groupId={groupId}
        onSubmit={handleCreateTemplate}
      />

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <TemplateForm
          open={true}
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate}
          groupId={groupId}
          onSubmit={handleUpdateTemplate}
        />
      )}
    </Box>
  );
};

export default EventTemplates;
