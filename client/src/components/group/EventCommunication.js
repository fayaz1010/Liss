import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  Mail as EmailIcon,
  Sms as SmsIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  AttachFile as AttachIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Template as TemplateIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Editor } from '@tinymce/tinymce-react';

const MESSAGE_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
};

const RECIPIENT_TYPES = {
  ALL_GUESTS: 'all_guests',
  CONFIRMED_GUESTS: 'confirmed_guests',
  PENDING_GUESTS: 'pending_guests',
  SPECIFIC_GUESTS: 'specific_guests',
};

const MessageComposer = ({ onSend, guests = [], templates = [], onSaveTemplate }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: MESSAGE_TYPES.EMAIL,
    recipientType: RECIPIENT_TYPES.ALL_GUESTS,
    specificRecipients: [],
    scheduledTime: null,
    template: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleSend = () => {
    onSend({
      ...formData,
      attachments,
    });
  };

  const handleSaveAsTemplate = () => {
    onSaveTemplate({
      name: formData.subject || 'Untitled Template',
      subject: formData.subject,
      message: formData.message,
      type: formData.type,
    });
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        message: template.message,
        type: template.type,
        template: templateId,
      });
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments([...attachments, ...files]);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Message Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              label="Message Type"
            >
              {Object.entries(MESSAGE_TYPES).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Recipients</InputLabel>
            <Select
              value={formData.recipientType}
              onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
              label="Recipients"
            >
              {Object.entries(RECIPIENT_TYPES).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {value.replace('_', ' ').charAt(0).toUpperCase() + value.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {formData.recipientType === RECIPIENT_TYPES.SPECIFIC_GUESTS && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Guests</InputLabel>
              <Select
                multiple
                value={formData.specificRecipients}
                onChange={(e) => setFormData({ ...formData, specificRecipients: e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={guests.find(g => g._id === value)?.name || value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {guests.map((guest) => (
                  <MenuItem key={guest._id} value={guest._id}>
                    {guest.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {formData.type === MESSAGE_TYPES.EMAIL && (
          <>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select
                  value={formData.template}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  label="Template"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template._id} value={template._id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          {formData.type === MESSAGE_TYPES.EMAIL ? (
            <Editor
              value={formData.message}
              onEditorChange={(content) => setFormData({ ...formData, message: content })}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
              }}
            />
          ) : (
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          )}
        </Grid>

        {formData.type === MESSAGE_TYPES.EMAIL && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                component="label"
                startIcon={<AttachIcon />}
                variant="outlined"
              >
                Attach Files
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
              {attachments.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {attachments.length} file(s) attached
                </Typography>
              )}
            </Box>
            {attachments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => {
                      const newAttachments = [...attachments];
                      newAttachments.splice(index, 1);
                      setAttachments(newAttachments);
                    }}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            type="datetime-local"
            label="Schedule Send"
            value={formData.scheduledTime || ''}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {formData.type === MESSAGE_TYPES.EMAIL && (
              <>
                <Button
                  startIcon={<PreviewIcon />}
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </Button>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAsTemplate}
                >
                  Save as Template
                </Button>
              </>
            )}
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSend}
              disabled={!formData.message || (formData.type === MESSAGE_TYPES.EMAIL && !formData.subject)}
            >
              {formData.scheduledTime ? 'Schedule' : 'Send'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Preview Email</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Subject: {formData.subject}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <div dangerouslySetInnerHTML={{ __html: formData.message }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const MessageHistory = ({ messages = [] }) => {
  return (
    <List>
      {messages.map((message) => (
        <ListItem key={message._id}>
          <ListItemAvatar>
            <Avatar>
              {message.type === MESSAGE_TYPES.EMAIL ? (
                <EmailIcon />
              ) : message.type === MESSAGE_TYPES.SMS ? (
                <SmsIcon />
              ) : (
                <SendIcon />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">
                  {message.subject || 'No Subject'}
                </Typography>
                <Chip
                  size="small"
                  label={message.recipientType.replace('_', ' ')}
                  icon={<GroupIcon />}
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {message.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sent: {format(new Date(message.sentAt), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton size="small">
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

const EventCommunication = ({ event }) => {
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  
  const { messages, templates, loading } = useSelector(state => state.eventCommunication);
  const eventMessages = messages[event._id] || [];
  const eventTemplates = templates[event._id] || [];
  const { guests } = useSelector(state => state.eventGuests);
  const eventGuests = guests[event._id] || [];

  useEffect(() => {
    dispatch(fetchEventMessages(event._id));
    dispatch(fetchMessageTemplates(event._id));
  }, [dispatch, event._id]);

  const handleSendMessage = async (messageData) => {
    try {
      await dispatch(sendMessage({
        eventId: event._id,
        ...messageData,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      await dispatch(saveMessageTemplate({
        eventId: event._id,
        ...templateData,
      }));
    } catch (error) {
      console.error('Error saving template:', error);
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
        <Typography variant="h6" gutterBottom>
          Event Communication
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab
            icon={<SendIcon />}
            label="Compose"
            iconPosition="start"
          />
          <Tab
            icon={<HistoryIcon />}
            label="History"
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 0 ? (
          <MessageComposer
            onSend={handleSendMessage}
            guests={eventGuests}
            templates={eventTemplates}
            onSaveTemplate={handleSaveTemplate}
          />
        ) : (
          <MessageHistory messages={eventMessages} />
        )}
      </Box>
    </Paper>
  );
};

export default EventCommunication;
