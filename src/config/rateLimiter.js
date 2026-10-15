const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch((err) => console.error('Redis connection error:', err.message));

const rateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again after a minute.' },
    store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
});

module.exports = rateLimiter;
