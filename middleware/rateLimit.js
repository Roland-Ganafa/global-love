const rateLimit = require('express-rate-limit');

// Memory store for development
const MemoryStore = new Map();

// Create a custom store
const customStore = {
    incr: function(key, cb) {
        const current = MemoryStore.get(key) || 0;
        MemoryStore.set(key, current + 1);
        cb(null, current + 1);
    },
    decrement: function(key) {
        const current = MemoryStore.get(key) || 0;
        MemoryStore.set(key, Math.max(0, current - 1));
    },
    resetKey: function(key) {
        MemoryStore.delete(key);
    }
};

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per minute
    store: customStore,
    message: {
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip + '_' + (req.user ? req.user.id : 'anonymous'),
    skip: (req) => req.method === 'GET' // Skip rate limiting for GET requests
});

// Auth rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 login attempts per 15 minutes
    store: customStore,
    message: {
        error: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Profile update rate limiter
const profileLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 profile updates per minute
    store: customStore,
    message: {
        error: 'Too many profile updates, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Media upload rate limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 uploads per hour
    store: customStore,
    message: {
        error: 'Upload limit exceeded, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    profileLimiter,
    uploadLimiter
};
