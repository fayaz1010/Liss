import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';

const TEMPLATE_VARIABLES = {
  EVENT: {
    TITLE: '{{event.title}}',
    DATE: '{{event.date}}',
    TIME: '{{event.time}}',
    LOCATION: '{{event.location}}',
    DESCRIPTION: '{{event.description}}',
    ORGANIZER: '{{event.organizer}}',
  },
  RECIPIENT: {
    NAME: '{{recipient.name}}',
    EMAIL: '{{recipient.email}}',
  },
  RSVP: {
    ACCEPT_LINK: '{{rsvp.acceptLink}}',
    DECLINE_LINK: '{{rsvp.declineLink}}',
    MAYBE_LINK: '{{rsvp.maybeLink}}',
  },
};

const TEMPLATE_TYPES = {
  INVITATION: 'invitation',
  REMINDER: 'reminder',
  CONFIRMATION: 'confirmation',
  CANCELLATION: 'cancellation',
  UPDATES: 'updates',
};

const TemplateEditor = ({ template, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: TEMPLATE_TYPES.INVITATION,
    subject: '',
    content: '',
    isDefault: false,
    ...template,
  });

  const handleEditorChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const insertVariable = (variable) => {
    setFormData({
      ...formData,
      content: formData.content + ' ' + variable,
    });
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Email Template' : 'Create Email Template'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Template Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Template Type"
              >
                {Object.entries(TEMPLATE_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Available Variables
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {Object.entries(TEMPLATE_VARIABLES).map(([category, variables]) => (
                Object.entries(variables).map(([key, value]) => (
                  <Chip
                    key={value}
                    label={`${category}.${key}`}
                    onClick={() => insertVariable(value)}
                    size="small"
                  />
                ))
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Editor
              value={formData.content}
              onEditorChange={handleEditorChange}
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                  'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
                  'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | bold italic | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help'
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Set as default template for this type"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.name || !formData.subject || !formData.content}
        >
          Save Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TemplatePreview = ({ template, event, recipient, onClose }) => {
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    const generatePreview = () => {
      let content = template.content;
      
      // Replace event variables
      Object.entries(TEMPLATE_VARIABLES.EVENT).forEach(([key, variable]) => {
        const value = event[key.toLowerCase()];
        content = content.replace(new RegExp(variable, 'g'), value || '');
      });

      // Replace recipient variables
      Object.entries(TEMPLATE_VARIABLES.RECIPIENT).forEach(([key, variable]) => {
        const value = recipient[key.toLowerCase()];
        content = content.replace(new RegExp(variable, 'g'), value || '');
      });

      // Replace RSVP variables
      Object.entries(TEMPLATE_VARIABLES.RSVP).forEach(([key, variable]) => {
        const value = `http://example.com/rsvp/${key.toLowerCase()}/${event.id}`;
        content = content.replace(new RegExp(variable, 'g'), value);
      });

      setPreviewHtml(content);
    };

    generatePreview();
  }, [template, event, recipient]);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Template Preview</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Subject</Typography>
          <Typography>{template.subject}</Typography>
        </Box>
        <Box
          dangerouslySetInnerHTML={{ __html: previewHtml }}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EventEmailTemplates = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const dispatch = useDispatch();
  
  const { templates, loading } = useSelector(state => state.emailTemplates);

  useEffect(() => {
    dispatch(fetchEmailTemplates());
  }, [dispatch]);

  const handleCreateTemplate = async (templateData) => {
    try {
      await dispatch(createEmailTemplate(templateData));
      setShowEditor(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (templateData) => {
    try {
      await dispatch(updateEmailTemplate({
        templateId: selectedTemplate._id,
        updates: templateData,
      }));
      setShowEditor(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await dispatch(deleteEmailTemplate(templateId));
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      await dispatch(createEmailTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
      }));
    } catch (error) {
      console.error('Error duplicating template:', error);
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
          <Typography variant="h6">Email Templates</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setShowEditor(true)}
          >
            Create Template
          </Button>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            label="Filter by Type"
          >
            <MenuItem value="all">All Templates</MenuItem>
            {Object.entries(TEMPLATE_TYPES).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <List>
          {templates
            .filter(template => selectedType === 'all' || template.type === selectedType)
            .map((template) => (
              <ListItem key={template._id}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {template.name}
                      </Typography>
                      {template.isDefault && (
                        <Chip size="small" label="Default" color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Type: {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subject: {template.subject}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreview(true);
                    }}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <PreviewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDuplicateTemplate(template)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <DuplicateIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowEditor(true);
                    }}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteTemplate(template._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </Box>

      {showEditor && (
        <TemplateEditor
          template={selectedTemplate}
          onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
          onClose={() => {
            setShowEditor(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={selectedTemplate}
          event={{}} // Pass current event data
          recipient={{}} // Pass recipient data
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </Paper>
  );
};

export default EventEmailTemplates;
