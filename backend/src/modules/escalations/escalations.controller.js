const Escalation = require('../../models/Escalation');
const { NotFoundError } = require('../../utils/errors');

const getEscalations = async (req, res, next) => {
  try {
    const escalations = await Escalation.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: escalations
    });
  } catch (error) {
    next(error);
  }
};

const getEscalationById = async (req, res, next) => {
  try {
    const escalation = await Escalation.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!escalation) {
      throw new NotFoundError('Escalation ticket not found');
    }

    res.status(200).json({
      success: true,
      data: escalation
    });
  } catch (error) {
    next(error);
  }
};

const resolveEscalation = async (req, res, next) => {
  try {
    const escalation = await Escalation.findByIdAndUpdate(
      req.params.id,
      { status: 'RESOLVED' },
      { new: true }
    ).populate('userId', 'name email role');

    if (!escalation) {
      throw new NotFoundError('Escalation ticket not found');
    }

    res.status(200).json({
      success: true,
      data: escalation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEscalations,
  getEscalationById,
  resolveEscalation
};
