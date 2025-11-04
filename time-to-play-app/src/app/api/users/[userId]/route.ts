import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/[userId]
 * Get public user profile by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get user with stats (excluding sensitive data)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        isGuest: true,
        themeId: true,
        avatarUrl: true,
        createdAt: true,
        stats: {
          select: {
            gamesPlayed: true,
            gamesWon: true,
            gamesLost: true,
            gamesTied: true,
          },
        },
      },
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

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user by ID error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user',
      },
      { status: 500 }
    );
  }
}
