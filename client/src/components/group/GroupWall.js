import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Favorite as LikeIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import FileUpload from '../common/FileUpload';
import { createPost, deletePost, editPost, likePost } from '../../store/slices/groupSlice';

const PostItem = ({ post, groupId, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLike = () => {
    dispatch(likePost({ groupId, postId: post._id }));
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
    setComment('');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const isAuthor = post.author._id === user.id;

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={
          <Avatar src={post.author.profilePicture}>
            {post.author.username[0].toUpperCase()}
          </Avatar>
        }
        action={
          isAuthor && (
            <>
              <IconButton onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => {
                  handleMenuClose();
                  onEdit(post);
                }}>
                  <EditIcon sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={() => {
                  handleMenuClose();
                  onDelete(post._id);
                }}>
                  <DeleteIcon sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </>
          )
        }
        title={post.author.username}
        subheader={formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
      />
      <CardContent>
        <Typography variant="body1">{post.content}</Typography>
        {post.attachments && post.attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {post.attachments.map((file, index) => (
              <Box
                key={index}
                component="a"
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                📎 {file.originalname}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton onClick={handleLike} color={post.likes.includes(user.id) ? 'primary' : 'default'}>
          <LikeIcon />
        </IconButton>
        <Typography variant="caption" sx={{ mr: 2 }}>
          {post.likes.length}
        </Typography>
        <IconButton onClick={() => setShowComments(!showComments)}>
          <CommentIcon />
        </IconButton>
        <Typography variant="caption" sx={{ mr: 2 }}>
          {post.comments.length}
        </Typography>
        <IconButton onClick={handleShare}>
          <ShareIcon />
        </IconButton>
      </CardActions>
      {showComments && (
        <Box sx={{ p: 2 }}>
          <List>
            {post.comments.map((comment) => (
              <ListItem key={comment._id}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <Avatar
                    src={comment.author.profilePicture}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {comment.author.username[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                      {comment.author.username}
                    </Typography>
                    <Typography variant="body2">{comment.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleComment}
              disabled={!comment.trim()}
            >
              Post
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

const GroupWall = ({ groupId }) => {
  const [newPost, setNewPost] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const dispatch = useDispatch();
  const { posts, loading } = useSelector(state => state.groups);
  const groupPosts = posts[groupId] || [];

  const handleCreatePost = async () => {
    try {
      await dispatch(createPost({
        groupId,
        content: newPost,
        attachments,
      }));
      setNewPost('');
      setAttachments([]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      await dispatch(editPost({
        groupId,
        postId: editingPost._id,
        content: editingPost.content,
      }));
      setShowEditDialog(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error editing post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await dispatch(deletePost({ groupId, postId }));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleFileUpload = (files) => {
    setAttachments(prev => [...prev, ...files]);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Create Post */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <FileUpload
              onUpload={handleFileUpload}
              maxFiles={5}
              existingFiles={attachments}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleCreatePost}
            disabled={!newPost.trim() && attachments.length === 0}
          >
            Post
          </Button>
        </CardActions>
      </Card>

      {/* Posts List */}
      {groupPosts.map((post) => (
        <PostItem
          key={post._id}
          post={post}
          groupId={groupId}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      ))}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)}>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editingPost?.content || ''}
            onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupWall;
