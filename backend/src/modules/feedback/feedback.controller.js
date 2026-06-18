const Feedback = require('../../models/Feedback');
const Message = require('../../models/Message');
const { logEvent } = require('../../services/analyticsService');
const { NotFoundError, BadRequestError } = require('../../utils/errors');

const submitFeedback = async (req, res, next) => {
  try {
    const { messageId, feedbackType, comment } = req.body;

    if (!messageId || !feedbackType) {
      throw new BadRequestError('messageId and feedbackType are required');
    }

    if (!['POSITIVE', 'NEGATIVE'].includes(feedbackType)) {
      throw new BadRequestError('Invalid feedbackType');
    }

    const message = await Message.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const feedback = new Feedback({
      messageId,
      conversationId: message.conversationId,
      userId: req.user.id,
      feedbackType,
      comment: comment || ''
    });
    await feedback.save();

    const analyticsType = feedbackType === 'POSITIVE' ? 'FEEDBACK_POSITIVE' : 'FEEDBACK_NEGATIVE';
    await logEvent(analyticsType, { messageId, conversationId: message.conversationId }, req.user.id);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .populate('messageId', 'content senderType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

const getNegativeFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ feedbackType: 'NEGATIVE' })
      .populate('userId', 'name email')
      .populate('messageId', 'content senderType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getFeedback,
  getNegativeFeedback
};
