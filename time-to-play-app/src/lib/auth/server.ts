import { cookies } from 'next/headers';
import { verifyAccessToken } from './jwt';
import { prisma } from '@/lib/db';
import type { User } from '@/contexts/AuthContext';

/**
 * Get current user from access token (server-side)
 * Returns null if not authenticated or token is invalid
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token');

    if (!accessToken) {
      return null;
    }

    // Verify token
    const payload = verifyAccessToken(accessToken.value);
    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        isGuest: true,
        themeId: true,
        avatarUrl: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Require authentication (server-side)
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require registered user (not guest)
 */
export async function requireRegisteredUser(): Promise<User> {
  const user = await requireAuth();

  if (user.isGuest) {
    throw new Error('Registered account required');
  }

  return user;
}
