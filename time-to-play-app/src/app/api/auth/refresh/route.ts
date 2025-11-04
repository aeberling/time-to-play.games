import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyRefreshToken, generateGuestToken, generateUserToken } from '@/lib/auth/jwt';
import { getRefreshToken, setAuthCookies } from '@/lib/auth/cookies';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST() {
  try {
    // Get refresh token from cookies
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No refresh token provided',
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid refresh token',
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Generate new tokens
    const tokens = user.isGuest
      ? generateGuestToken(user.id, user.displayName)
      : generateUserToken(user.id, user.displayName);

    // Set new cookies
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json(
      {
        success: true,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh token',
      },
      { status: 500 }
    );
  }
}
