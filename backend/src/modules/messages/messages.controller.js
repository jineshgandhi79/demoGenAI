const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const Escalation = require('../../models/Escalation');
const geminiService = require('../../services/geminiService');
const qdrantService = require('../../services/qdrantService');
const { logEvent } = require('../../services/analyticsService');
const { generateTicketId } = require('../../utils/ticketGenerator');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');

const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (req.user.role !== 'ADMIN' && conversation.userId.toString() !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      throw new BadRequestError('Message content is required');
    }

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (req.user.role !== 'ADMIN' && conversation.userId.toString() !== req.user.id) {
      throw new ForbiddenError('Access denied');
    }

    if (conversation.status === 'CLOSED') {
      throw new BadRequestError('Cannot send messages to a closed conversation');
    }

    const userMessage = new Message({
      conversationId: conversation._id,
      senderType: 'USER',
      content
    });
    await userMessage.save();

    await logEvent('QUERY_RECEIVED', { conversationId: conversation._id }, req.user.id);

    const history = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    const priorHistory = history.filter(m => m._id.toString() !== userMessage._id.toString());

    let scopeAnalysis = { category: 'BUSINESS', outOfScope: false, reason: '', confidence: 1.0 };
    try {
      scopeAnalysis = await geminiService.analyzeQueryScope(content);
    } catch (err) {
    }

    const isConversational = scopeAnalysis.category === 'CONVERSATIONAL';

    let queryEmbedding;
    let retrievedChunks = [];
    let topScore = 0;

    if (!isConversational) {
      try {
        queryEmbedding = await geminiService.getEmbedding(content);
        const topK = parseInt(process.env.RAG_TOP_K || '5', 10);
        retrievedChunks = await qdrantService.searchVectors(queryEmbedding, topK);
        if (retrievedChunks.length > 0) {
          topScore = retrievedChunks[0].score;
        }
      } catch (err) {
      }
    }

    const confidenceThreshold = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.6');
    const hardMinRetrievalScore = 0.4;

    const isConfidenceLow = !isConversational && (topScore < hardMinRetrievalScore);
    const isOutOfScope = scopeAnalysis.outOfScope;
    const isModelUnconfident = scopeAnalysis.confidence < confidenceThreshold;

    if (isConfidenceLow || isOutOfScope || isModelUnconfident) {
      let reason = 'Low retrieval confidence';
      if (isOutOfScope) {
        reason = `Out of scope request: ${scopeAnalysis.reason}`;
      } else if (isModelUnconfident) {
        reason = 'Low query categorization confidence';
      }

      const ticketId = await generateTicketId();

      const historyText = priorHistory.slice(-5).map(m => `${m.senderType}: ${m.content}`).join('\n');
      const conversationSummary = historyText ? `Last messages:\n${historyText}` : 'No previous history';

      const escalation = new Escalation({
        ticketId,
        userId: req.user.id,
        conversationId: conversation._id,
        reason,
        confidenceScore: topScore,
        userQuestion: content,
        conversationSummary,
        retrievedChunks,
        status: 'OPEN'
      });
      await escalation.save();

      // Close the conversation when a human ticket is generated
      conversation.status = 'CLOSED';
      await conversation.save();

      const aiResponseContent = `A human ticket is generated and human will follow up on this. Ticket ID: ${ticketId}`;
      const aiMessage = new Message({
        conversationId: conversation._id,
        senderType: 'AI',
        content: aiResponseContent,
        confidenceScore: topScore,
        retrievedChunks
      });
      await aiMessage.save();

      await logEvent('ESCALATED', { ticketId, reason, conversationId: conversation._id }, req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          content: 'A human ticket is generated and human will follow up on this.',
          ticketId,
          escalated: true,
          message: aiMessage
        }
      });
    }

    const aiResponseText = await geminiService.generateResponse(content, priorHistory, retrievedChunks, isConversational);

    // If Gemini determined the query is unanswerable from the context, escalate it!
    if (!isConversational && aiResponseText.trim().toUpperCase().includes('UNANSWERABLE')) {
      const reason = 'Query cannot be answered using the Knowledge Base';
      const ticketId = await generateTicketId();

      const historyText = priorHistory.slice(-5).map(m => `${m.senderType}: ${m.content}`).join('\n');
      const conversationSummary = historyText ? `Last messages:\n${historyText}` : 'No previous history';

      const escalation = new Escalation({
        ticketId,
        userId: req.user.id,
        conversationId: conversation._id,
        reason,
        confidenceScore: topScore,
        userQuestion: content,
        conversationSummary,
        retrievedChunks,
        status: 'OPEN'
      });
      await escalation.save();

      // Close the conversation when a human ticket is generated
      conversation.status = 'CLOSED';
      await conversation.save();

      const aiResponseContent = `A human ticket is generated and human will follow up on this. Ticket ID: ${ticketId}`;
      const aiMessage = new Message({
        conversationId: conversation._id,
        senderType: 'AI',
        content: aiResponseContent,
        confidenceScore: topScore,
        retrievedChunks
      });
      await aiMessage.save();

      await logEvent('ESCALATED', { ticketId, reason, conversationId: conversation._id }, req.user.id);

      return res.status(200).json({
        success: true,
        data: {
          content: 'A human ticket is generated and human will follow up on this.',
          ticketId,
          escalated: true,
          message: aiMessage
        }
      });
    }

    const aiMessage = new Message({
      conversationId: conversation._id,
      senderType: 'AI',
      content: aiResponseText,
      confidenceScore: topScore,
      retrievedChunks
    });
    await aiMessage.save();

    await logEvent('QUERY_RESOLVED', { conversationId: conversation._id, confidenceScore: topScore }, req.user.id);

    res.status(200).json({
      success: true,
      data: {
        content: aiResponseText,
        confidenceScore: topScore,
        escalated: false,
        message: aiMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  createMessage
};
