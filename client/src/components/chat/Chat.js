import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import {
  fetchGroupMessages,
  sendMessage,
  addMessage,
} from '../../store/slices/chatSlice';

const Chat = ({ groupId }) => {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  
  const groupMessages = messages[groupId] || [];

  useEffect(() => {
    dispatch(fetchGroupMessages(groupId));
  }, [dispatch, groupId]);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      query: { groupId },
    });

    newSocket.on('message', (message) => {
      dispatch(addMessage({ groupId, message }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [groupId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await dispatch(sendMessage({ groupId, content: message }));
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), 'HH:mm');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {groupMessages.map((msg, index) => {
            const isOwnMessage = msg.sender._id === user.id;
            return (
              <React.Fragment key={msg._id}>
                <ListItem
                  sx={{
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={msg.sender.profilePicture}>
                      {msg.sender.username[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <Box
                    sx={{
                      maxWidth: '70%',
                      backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                      color: isOwnMessage ? 'white' : 'text.primary',
                      borderRadius: 2,
                      p: 2,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {msg.sender.username}
                    </Typography>
                    <Typography variant="body1">{msg.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 8,
                        color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                      }}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </Typography>
                  </Box>
                </ListItem>
                {index < groupMessages.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          backgroundColor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ mr: 1 }}>
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            type="submit"
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default Chat;
