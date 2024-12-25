const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    }
  }],
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  wallPosts: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    attachments: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  events: [{
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
