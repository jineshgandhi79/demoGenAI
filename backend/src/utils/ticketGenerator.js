const Escalation = require('../models/Escalation');

const generateTicketId = async () => {
  const prefix = process.env.ESCALATION_PREFIX || 'TKT';
  const latestTicket = await Escalation.findOne().sort({ createdAt: -1 });
  if (!latestTicket) {
    return `${prefix}-000001`;
  }
  const lastId = latestTicket.ticketId;
  const parts = lastId.split('-');
  const num = parseInt(parts[1] || '0', 10);
  const nextNum = num + 1;
  const padded = String(nextNum).padStart(6, '0');
  return `${prefix}-${padded}`;
};

module.exports = { generateTicketId };
