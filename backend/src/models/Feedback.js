const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
      index: true
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    feedbackType: {
      type: String,
      enum: ['POSITIVE', 'NEGATIVE'],
      required: true,
      index: true
    },
    comment: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
