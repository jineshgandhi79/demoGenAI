const AnalyticsEvent = require('../models/AnalyticsEvent');

const logEvent = async (eventType, metadata = {}, userId = null) => {
  if (process.env.ANALYTICS_ENABLED !== 'true') {
    return;
  }
  try {
    const event = new AnalyticsEvent({
      eventType,
      metadata,
      userId
    });
    await event.save();
  } catch (error) {
  }
};

module.exports = { logEvent };
