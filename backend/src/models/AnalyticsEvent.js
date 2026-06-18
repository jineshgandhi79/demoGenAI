const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'LOGIN',
        'QUERY_RECEIVED',
        'QUERY_RESOLVED',
        'ESCALATED',
        'FEEDBACK_POSITIVE',
        'FEEDBACK_NEGATIVE',
        'DOCUMENT_UPLOADED'
      ],
      required: true,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
