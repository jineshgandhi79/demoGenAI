const AnalyticsEvent = require('../../models/AnalyticsEvent');
const Escalation = require('../../models/Escalation');

const getOverview = async (req, res, next) => {
  try {
    const receivedCount = await AnalyticsEvent.countDocuments({ eventType: 'QUERY_RECEIVED' });
    const resolvedCount = await AnalyticsEvent.countDocuments({ eventType: 'QUERY_RESOLVED' });
    const escalatedCount = await AnalyticsEvent.countDocuments({ eventType: 'ESCALATED' });
    const positiveFeedback = await AnalyticsEvent.countDocuments({ eventType: 'FEEDBACK_POSITIVE' });
    const negativeFeedback = await AnalyticsEvent.countDocuments({ eventType: 'FEEDBACK_NEGATIVE' });

    let resolutionRate = 0;
    if (receivedCount > 0) {
      resolutionRate = Math.round((resolvedCount / receivedCount) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        queryVolume: receivedCount,
        resolutionRate,
        escalationCount: escalatedCount,
        positiveFeedback,
        negativeFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTopUnanswered = async (req, res, next) => {
  try {
    const topUnanswered = await Escalation.aggregate([
      {
        $group: {
          _id: { $trim: { input: { $toLower: '$userQuestion' } } },
          question: { $first: '$userQuestion' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          question: 1,
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topUnanswered
    });
  } catch (error) {
    next(error);
  }
};

const getEscalationTopics = async (req, res, next) => {
  try {
    const topics = await Escalation.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getTopUnanswered,
  getEscalationTopics
};
