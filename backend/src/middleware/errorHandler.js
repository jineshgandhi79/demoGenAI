const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate key error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authorization token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authorization token has expired';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
