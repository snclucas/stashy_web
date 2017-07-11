/**
 * A rate-limiting Throttle record, by IP address
 * models/throttle.js
 */
var Throttle,
    mongoose = require('mongoose'),
    config = require('../config'),
    Schema = mongoose.Schema;

Throttle = new Schema({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: config.rateLimit.ttl // (60 * 10), ten minutes
    },
    ip: {
        type: String,
        required: true,
        trim: true,
        match: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    },
    hits: {
        type: Number,
        default: 1,
        required: true,
        max: config.rateLimit.max, // 600
        min: 0
    }
});

Throttle.index({ createdAt: 1  }, { expireAfterSeconds: config.rateLimit.ttl });
module.exports = mongoose.model('Throttle', Throttle);