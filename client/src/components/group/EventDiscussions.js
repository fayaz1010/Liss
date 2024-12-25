import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  ThumbUpOutlined as LikeOutlinedIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import FileUpload from '../common/FileUpload';
import FilePreview from '../common/FilePreview';

const Comment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  currentUser,
  depth = 0,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showReplies, setShowReplies] = useState(true);
  const [previewFiles, setPreviewFiles] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleReply = () => {
    onReply(comment);
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(comment);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(comment._id);
    handleMenuClose();
  };

  const isAuthor = currentUser.id === comment.author._id;

  return (
    <>
      <ListItem
        alignItems="flex-start"
        sx={{
          pl: depth * 4,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar src={comment.author.profilePicture}>
            {comment.author.username[0]}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2">
                {comment.author.username}
              </Typography>
              {comment.edited && (
                <Typography variant="caption" color="text.secondary">
                  (edited)
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ whiteSpace: 'pre-wrap', mb: 1 }}
              >
                {comment.content}
              </Typography>

              {comment.attachments?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  {comment.attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.originalname}
                      size="small"
                      onClick={() => setPreviewFiles(comment.attachments)}
                      icon={<AttachFileIcon />}
                    />
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => onLike(comment._id)}
                  color={comment.likes.includes(currentUser.id) ? 'primary' : 'default'}
                >
                  {comment.likes.includes(currentUser.id) ? (
                    <LikeIcon fontSize="small" />
                  ) : (
                    <LikeOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
                {comment.likes.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {comment.likes.length}
                  </Typography>
                )}
                <IconButton size="small" onClick={handleReply}>
                  <ReplyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          }
        />
        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleReply}>
            <ReplyIcon sx={{ mr: 1 }} fontSize="small" />
            Reply
          </MenuItem>
          {isAuthor && (
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1 }} fontSize="small" />
              Edit
            </MenuItem>
          )}
          {isAuthor && (
            <MenuItem onClick={handleDelete}>
              <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
              Delete
            </MenuItem>
          )}
        </Menu>
      </ListItem>

      {comment.replies?.length > 0 && (
        <>
          <ListItem
            sx={{ pl: depth * 4 + 4, py: 0 }}
            button
            onClick={() => setShowReplies(!showReplies)}
          >
            <Typography variant="caption" color="primary">
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
            </Typography>
          </ListItem>
          {showReplies && (
            <List disablePadding>
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLike={onLike}
                  currentUser={currentUser}
                  depth={depth + 1}
                />
              ))}
            </List>
          )}
        </>
      )}

      {previewFiles && (
        <FilePreview
          files={previewFiles}
          onClose={() => setPreviewFiles(null)}
        />
      )}
    </>
  );
};

const CommentForm = ({
  onSubmit,
  initialValue = '',
  replyTo = null,
  editingComment = null,
  onCancel,
}) => {
  const [content, setContent] = useState(initialValue);
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        content: content.trim(),
        attachments,
        replyTo: replyTo?._id,
      });
      setContent('');
      setAttachments([]);
      onCancel?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
    setSubmitting(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      {replyTo && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Replying to {replyTo.author.username}
          </Typography>
          <IconButton size="small" onClick={onCancel}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )}

      <TextField
        fullWidth
        multiline
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
        inputRef={inputRef}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <FileUpload
                onUpload={setAttachments}
                maxFiles={3}
                existingFiles={attachments}
                buttonProps={{
                  size: 'small',
                  color: 'inherit',
                }}
              >
                <AttachFileIcon />
              </FileUpload>
            </InputAdornment>
          ),
        }}
      />

      {attachments.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {attachments.map((file, index) => (
            <Chip
              key={index}
              label={file.originalname}
              size="small"
              onDelete={() => {
                const newAttachments = [...attachments];
                newAttachments.splice(index, 1);
                setAttachments(newAttachments);
              }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
        {(replyTo || editingComment) && (
          <Button onClick={onCancel}>Cancel</Button>
        )}
        <Button
          variant="contained"
          type="submit"
          disabled={!content.trim() && attachments.length === 0}
          endIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {editingComment ? 'Update' : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

const EventDiscussions = ({ eventId }) => {
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { comments, loading } = useSelector(state => state.eventComments);
  const eventComments = comments[eventId] || [];

  useEffect(() => {
    dispatch(fetchEventComments(eventId));
  }, [dispatch, eventId]);

  const handleSubmitComment = async (data) => {
    try {
      if (editingComment) {
        await dispatch(updateComment({
          eventId,
          commentId: editingComment._id,
          updates: data,
        }));
        setEditingComment(null);
      } else {
        await dispatch(createComment({ eventId, ...data }));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment({ eventId, commentId }));
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await dispatch(likeComment({ eventId, commentId }));
    } catch (error) {
      console.error('Error liking comment:', error);
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
      <CommentForm
        onSubmit={handleSubmitComment}
        initialValue={editingComment?.content || ''}
        replyTo={replyTo}
        editingComment={editingComment}
        onCancel={() => {
          setReplyTo(null);
          setEditingComment(null);
        }}
      />
      <Divider />
      <List>
        {eventComments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            onReply={setReplyTo}
            onEdit={setEditingComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
            currentUser={user}
          />
        ))}
      </List>
    </Paper>
  );
};

export default EventDiscussions;
