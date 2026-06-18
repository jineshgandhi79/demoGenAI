const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');

const createConversation = async (req, res, next) => {
  try {
    const { title } = req.body;
    const conversation = new Conversation({
      title: title || 'New Conversation',
      userId: req.user.id,
      status: 'ACTIVE'
    });
    await conversation.save();
    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const filter = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const conversations = await Conversation.find(filter).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (req.user.role !== 'ADMIN' && conversation.userId.toString() !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (req.user.role !== 'ADMIN' && conversation.userId.toString() !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    await Conversation.findByIdAndDelete(req.params.conversationId);
    await Message.deleteMany({ conversationId: req.params.conversationId });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation
};
