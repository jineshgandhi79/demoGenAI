const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRouter = require('./routes/api');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('AI Customer Support Backend is running!');
});

app.use('/api', apiLimiter, apiRouter);

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;
