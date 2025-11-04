import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/me
 * Get current user's profile with stats
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    // Get user with stats
    const userWithStats = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        stats: true,
      },
    });

    if (!userWithStats) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userWithStats.id,
          email: userWithStats.email,
          displayName: userWithStats.displayName,
          isGuest: userWithStats.isGuest,
          themeId: userWithStats.themeId,
          avatarUrl: userWithStats.avatarUrl,
          createdAt: userWithStats.createdAt,
          lastSeenAt: userWithStats.lastSeenAt,
          stats: userWithStats.stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user profile',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 * Update current user's profile
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, themeId, avatarUrl } = body;

    // Validate displayName if provided
    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.length < 3 || displayName.length > 20) {
        return NextResponse.json(
          {
            success: false,
            error: 'Display name must be between 3 and 20 characters',
          },
          { status: 400 }
        );
      }
    }

    // Validate themeId if provided
    if (themeId !== undefined) {
      const validThemes = ['ocean-breeze', 'sunset-glow', 'forest-calm', 'purple-dream', 'neon-nights'];
      if (!validThemes.includes(themeId)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid theme ID',
          },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(themeId !== undefined && { themeId }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      include: {
        stats: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          isGuest: updatedUser.isGuest,
          themeId: updatedUser.themeId,
          avatarUrl: updatedUser.avatarUrl,
          createdAt: updatedUser.createdAt,
          lastSeenAt: updatedUser.lastSeenAt,
          stats: updatedUser.stats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile',
      },
      { status: 500 }
    );
  }
}
