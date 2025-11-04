import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateGuestToken } from '@/lib/auth/jwt';
import { generateGuestDisplayName } from '@/lib/auth/password';
import { setAuthCookies } from '@/lib/auth/cookies';

/**
 * POST /api/auth/guest
 * Create a guest user and return authentication tokens
 */

export async function POST(request: Request) {
  try {
    // Optional: Allow custom display name from request
    const body = await request.json().catch(() => ({}));
    const customDisplayName = body.displayName;

    // Generate or use provided display name
    const displayName = customDisplayName || generateGuestDisplayName();

    // Create guest user in database
    const user = await prisma.user.create({
      data: {
        isGuest: true,
        displayName,
        username: null, // Guests don't have username
        passwordHash: null, // Guests don't have password
        themeId: 'ocean-breeze', // Default theme
        stats: {
          create: {
            // Initialize with default values (all stats default to 0 in schema)
          },
        },
      },
      include: {
        stats: true,
      },
    });

    // Generate JWT tokens
    const tokens = generateGuestToken(user.id, user.displayName);

    // Set HTTP-only cookies
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    // Return user data and tokens
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          displayName: user.displayName,
          isGuest: user.isGuest,
          themeId: user.themeId,
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Guest authentication error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create guest user',
      },
      { status: 500 }
    );
  }
}
