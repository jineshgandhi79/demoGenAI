const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    confidenceScore: {
      type: Number,
      default: 0
    },
    userQuestion: {
      type: String,
      required: true
    },
    conversationSummary: {
      type: String,
      default: ''
    },
    retrievedChunks: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Escalation', escalationSchema);
