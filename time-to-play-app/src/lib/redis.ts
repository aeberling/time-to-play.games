// Redis Client for Upstash
// Used for active game state and caching

import { Redis } from '@upstash/redis';

// For development, you can use a local Redis instance
// For production, use Upstash Redis

export const redis = process.env.REDIS_URL?.startsWith('http')
  ? // Upstash Redis (production)
    new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_TOKEN!,
    })
  : // Local Redis (development) - Note: Upstash client doesn't support redis:// protocol
    // For local development, you'll need to use ioredis instead
    // This is a placeholder that will work with Upstash
    new Redis({
      url: process.env.REDIS_URL || 'http://localhost:8079',
      token: 'local-dev-token',
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
