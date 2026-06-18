const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    senderType: {
      type: String,
      enum: ['USER', 'AI'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    confidenceScore: {
      type: Number,
      default: 0
    },
    retrievedChunks: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

module.exports = mongoose.model('Message', messageSchema);
