const redisClient = require('../config/redis');

/**
 * Cache middleware to check Redis before hitting DB.
 * @param {number} ttlSeconds - Time to live in seconds
 */
const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      if (redisClient.status !== 'ready') {
        return next(); // Skip cache if Redis is down
      }

      // Create a unique cache key based on the original URL
      const cacheKey = `cache:${req.originalUrl || req.url}`;
      
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(JSON.parse(cachedData));
      }

      res.setHeader('X-Cache', 'MISS');

      // If not cached, override res.json to cache the response before sending
      const originalJson = res.json;
      res.json = function (data) {
        try {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300 && redisClient.status === 'ready') {
            redisClient.setex(cacheKey, ttlSeconds, JSON.stringify(data));
          }
        } catch (e) {
          console.error('Redis caching error:', e.message);
        }
        
        // Call the original res.json
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Redis error in cache middleware:', error.message);
      next(); // Proceed without caching
    }
  };
};

module.exports = cacheMiddleware;
