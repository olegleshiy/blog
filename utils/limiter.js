const rateLimit = require('express-rate-limit');

/**
 * @param  {number} numRequest
 * @param  {number} resetIn
 */
const limiter = (numRequest, resetIn) => rateLimit({
    windowMs: resetIn,
    max: numRequest,
    headers: false,
});

module.exports = limiter;
