const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 20,
  skip: (req) => req.method !== 'GET' && req.method !== 'POST',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Tooo  many many requests, please try again in 30 minutes' },
});

module.exports = rateLimiter;
