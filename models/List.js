const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  quantity: Number,
  deadline: Date,
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  subItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ListItem'
  }]
}, {
  timestamps: true
});

const ListItem = mongoose.model('ListItem', listItemSchema);

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['project', 'shopping', 'todo', 'custom'],
    required: true
  },
  description: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ListItem'
  }],
  parentList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
  subLists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    }
  }],
  tags: [String],
  dueDate: Date,
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const List = mongoose.model('List', listSchema);

module.exports = { List, ListItem };
