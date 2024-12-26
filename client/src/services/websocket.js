import { io } from 'socket.io-client';
import store from '../store';
import { addMessage } from '../store/slices/chatSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { updateProgress } from '../store/slices/listSlice';
import { addPost, updatePost, removePost } from '../store/slices/groupSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket) return;

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('WebSocket disconnected');
    });

    // Chat events
    this.socket.on('new_message', (message) => {
      store.dispatch(addMessage({ groupId: message.groupId, message }));
    });

    // Notification events
    this.socket.on('notification', (notification) => {
      store.dispatch(addNotification(notification));
    });

    // List progress events
    this.socket.on('progress_update', ({ listId, itemId, progress }) => {
      store.dispatch(updateProgress({ listId, itemId, progress }));
    });

    // Group wall events
    this.socket.on('new_post', ({ groupId, post }) => {
      store.dispatch(addPost({ groupId, post }));
    });

    this.socket.on('update_post', ({ groupId, postId, updates }) => {
      store.dispatch(updatePost({ groupId, postId, updates }));
    });

    this.socket.on('delete_post', ({ groupId, postId }) => {
      store.dispatch(removePost({ groupId, postId }));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Chat methods
  joinGroupChat(groupId) {
    if (this.connected) {
      this.socket.emit('join_group', groupId);
    }
  }

  leaveGroupChat(groupId) {
    if (this.connected) {
      this.socket.emit('leave_group', groupId);
    }
  }

  sendMessage(groupId, message) {
    if (this.connected) {
      this.socket.emit('send_message', { groupId, message });
    }
  }

  // List progress methods
  updateItemProgress(listId, itemId, progress) {
    if (this.connected) {
      this.socket.emit('update_progress', { listId, itemId, progress });
    }
  }

  // Group wall methods
  createPost(groupId, post) {
    if (this.connected) {
      this.socket.emit('create_post', { groupId, post });
    }
  }

  updatePost(groupId, postId, updates) {
    if (this.connected) {
      this.socket.emit('update_post', { groupId, postId, updates });
    }
  }

  deletePost(groupId, postId) {
    if (this.connected) {
      this.socket.emit('delete_post', { groupId, postId });
    }
  }

  // User presence methods
  updatePresence(status) {
    if (this.connected) {
      this.socket.emit('presence', status);
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
