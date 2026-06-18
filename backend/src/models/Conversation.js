const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Conversation', conversationSchema);
