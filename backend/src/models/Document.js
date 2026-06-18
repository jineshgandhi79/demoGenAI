const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    sourceType: {
      type: String,
      enum: ['PDF', 'MARKDOWN', 'URL'],
      required: true
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    filePath: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING'
    },
    chunksCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Document', documentSchema);
