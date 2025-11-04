// Redis Client for Upstash
// Used for active game state and caching

import { Redis } from '@upstash/redis';

// For development, you can use a local Redis instance
// For production, use Upstash Redis

// Check if we're in development mode without a proper Redis URL
const isDevelopment = !process.env.REDIS_URL || process.env.REDIS_URL.startsWith('redis://');

// Create a mock Redis client for local development
const createMockRedis = () => {
  const store = new Map<string, any>();
  return {
    setex: async (key: string, ttl: number, value: string) => {
      store.set(key, value);
      setTimeout(() => store.delete(key), ttl * 1000);
      return 'OK';
    },
    get: async (key: string) => store.get(key) || null,
    set: async (key: string, value: string, options?: any) => {
      store.set(key, value);
      if (options?.ex) {
        setTimeout(() => store.delete(key), options.ex * 1000);
      }
      return options?.nx && store.has(key) ? null : 'OK';
    },
    del: async (key: string) => {
      store.delete(key);
      return 1;
    },
    zadd: async (key: string, data: { score: number; member: string }) => {
      const set = store.get(key) || [];
      set.push(data);
      store.set(key, set);
      return 1;
    },
    zrem: async (key: string, member: string) => {
      const set = store.get(key) || [];
      store.set(key, set.filter((item: any) => item.member !== member));
      return 1;
    },
    zrange: async (key: string, start: number, end: number) => {
      const set = store.get(key) || [];
      return set.map((item: any) => item.member);
    },
  };
};

export const redis = isDevelopment
  ? createMockRedis()
  : new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_TOKEN!,
    });

// Helper functions for common Redis operations

/**
 * Store game state in Redis
 */
export async function setGameState(gameId: string, state: any, ttlSeconds: number = 1800) {
  const key = `game:${gameId}:state`;
  await redis.setex(key, ttlSeconds, JSON.stringify(state));
}

/**
 * Get game state from Redis
 */
export async function getGameState(gameId: string) {
  const key = `game:${gameId}:state`;
  const state = await redis.get(key);
  return state ? (typeof state === 'string' ? JSON.parse(state) : state) : null;
}

/**
 * Store player session
 */
export async function setPlayerSession(userId: string, session: any, ttlSeconds: number = 86400) {
  const key = `player:${userId}:session`;
  await redis.setex(key, ttlSeconds, JSON.stringify(session));
}

/**
 * Get player session
 */
export async function getPlayerSession(userId: string) {
  const key = `player:${userId}:session`;
  const session = await redis.get(key);
  return session ? (typeof session === 'string' ? JSON.parse(session) : session) : null;
}

/**
 * Add game to waiting list
 */
export async function addToWaitingGames(gameId: string) {
  await redis.zadd('games:waiting', { score: Date.now(), member: gameId });
}

/**
 * Remove game from waiting list
 */
export async function removeFromWaitingGames(gameId: string) {
  await redis.zrem('games:waiting', gameId);
}

/**
 * Get all waiting games
 */
export async function getWaitingGames() {
  return await redis.zrange('games:waiting', 0, -1);
}

/**
 * Acquire a lock for game operations
 */
export async function acquireLock(lockKey: string, ttlSeconds: number = 5): Promise<boolean> {
  const result = await redis.set(lockKey, 'locked', { ex: ttlSeconds, nx: true });
  return result === 'OK';
}

/**
 * Release a lock
 */
export async function releaseLock(lockKey: string) {
  await redis.del(lockKey);
}
