const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { BadRequestError, UnauthorizedError } = require('../../utils/errors');
const { logEvent } = require('../../services/analyticsService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Incorrect email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Incorrect email or password');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logEvent('LOGIN', { email: user.email }, user._id);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
