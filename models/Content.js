const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  thumbnail: {
    url: String,
    publicId: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['processing', 'active', 'removed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
contentSchema.index({ creator: 1, createdAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ status: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
