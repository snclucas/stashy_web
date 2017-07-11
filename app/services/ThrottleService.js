// Module dependencies
var Throttle = require('../models/throttle');

/**
   * Check for request limit on the requesting IP
   *  
   * @access public
   * @param {object} request Express-style request
   * @param {object} response Express-style response
   * @param {function} next Express-style next callback
   */ 
module.exports = function(request, response, next) {
    'use strict';
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

    // this check is necessary for some clients that set an array of IP addresses
    ip = (ip || '').split(',')[0]; 

    Throttle
        .findOneAndUpdate({ip: ip},
            { $inc: { hits: 1 } },
            { upsert: false })
        .exec(function(error, throttle) {
            if (error) {
                response.statusCode = 500;
                return next(error);
            } else if (!throttle) {
                throttle = new Throttle({
                    createdAt: new Date(),
                    ip: ip
                });
                throttle.save(function(error, throttle) {
                    if (error) {
                        response.statusCode = 500;
                        return next(error);
                    } else if (!throttle) {
                        response.statusCode = 500;
                        return response.json({
                            errors: [
                                {message: 'Error checking rate limit'}
                            ]
                        });
                    }

                    respondWithThrottle(request, response, next, throttle);
                });
            } else {
                respondWithThrottle(request, response, next, throttle);
            }
        });

    function respondWithThrottle(request, response, next, throttle) {
        var timeUntilReset = (config.rateLimit.ttl * 1000) -
                    (new Date().getTime() - throttle.createdAt.getTime()),
            remaining =  Math.max(0, (config.rateLimit.max - throttle.hits));

        response.set('X-Rate-Limit-Limit', config.rateLimit.max);
        response.set('X-Rate-Limit-Remaining', remaining);
        response.set('X-Rate-Limit-Reset', timeUntilReset);
        request.throttle = throttle;
        if (throttle.hits < config.rateLimit.max) {
            return next();
        } else {
            response.statusCode = 429;
            return response.json({
                errors: [
                    {message: 'Rate Limit reached. Please wait and try again.'}
                ]
            });
        }
    }
};