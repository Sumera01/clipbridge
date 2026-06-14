import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL env var is not set");
    redis = new Redis(url, { maxRetriesPerRequest: 3 });
  }
  return redis;
}

export function getRedisSubscriber(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL env var is not set");
  // Always a fresh connection for subscribe (can't share with pub)
  return new Redis(url, { maxRetriesPerRequest: 3 });
}
