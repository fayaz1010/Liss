import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  ListAlt as ListIcon,
  Event as EventIcon,
  Person as PersonIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from '../../store/slices/notificationSlice';

const NotificationItem = ({ notification, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = () => {
    dispatch(markAsRead(notification._id));
    onClose();

    // Navigate based on notification type
    switch (notification.type) {
      case 'group_invite':
        navigate(`/groups/${notification.group._id}`);
        break;
      case 'list_assignment':
        navigate(`/lists/${notification.list._id}`);
        break;
      case 'event_reminder':
        navigate('/calendar');
        break;
      case 'mention':
        navigate(`/groups/${notification.group._id}`);
        break;
      default:
        break;
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'group_invite':
        return <GroupIcon />;
      case 'list_assignment':
        return <ListIcon />;
      case 'event_reminder':
        return <EventIcon />;
      case 'mention':
        return <PersonIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <MenuItem
      onClick={handleClick}
      sx={{
        backgroundColor: notification.read ? 'inherit' : 'action.hover',
        '&:hover': {
          backgroundColor: 'action.selected',
        },
      }}
    >
      <ListItemIcon>{getIcon()}</ListItemIcon>
      <ListItemText
        primary={notification.title}
        secondary={
          <React.Fragment>
            <Typography variant="body2" component="span">
              {notification.message}
            </Typography>
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
            >
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </Typography>
          </React.Fragment>
        }
      />
    </MenuItem>
  );
};

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClose={handleClose}
              />
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
