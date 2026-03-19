const Redis = require('ioredis');

const isProd = process.env.NODE_ENV === 'production';

let redisClient;

if (isProd) {
  // Ensure Upstash URLs use "rediss://" (with the 's' for TLS) because Upstash requires SSL.
  let redisUrl = process.env.REDIS_URL;
  
  if (redisUrl && redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  }

  const redisOptions = {
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };

  if (redisUrl && redisUrl.startsWith('rediss://')) {
    redisOptions.tls = { rejectUnauthorized: false };
  }

  redisClient = new Redis(redisUrl, redisOptions);

  redisClient.on('error', (err) => {
    console.warn('⚠️  Redis connection error (Caching/Rate-limiting will safely fallback/degrade):', err.message);
  });

  redisClient.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
  });
} else {
  // Mock client for development to avoid hitting Upstash limits or connection noise
  console.log('ℹ️  Redis disabled in development (using mock client)');
  redisClient = {
    status: 'disabled',
    on: () => {},
    call: () => Promise.resolve(),
    get: () => Promise.resolve(null),
    set: () => Promise.resolve(),
    setex: () => Promise.resolve(),
    del: () => Promise.resolve(),
    mget: () => Promise.resolve([]),
    // Add other methods as needed, returning resolved promises
  };
}

module.exports = redisClient;
