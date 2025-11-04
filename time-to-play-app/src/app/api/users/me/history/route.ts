import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/me/history
 * Get current user's game history
 */
export async function GET(request: Request) {
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

    // Get URL search params for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user's games
    const games = await prisma.game.findMany({
      where: {
        players: {
          some: {
            userId: user.id,
          },
        },
        status: {
          in: ['COMPLETED', 'ABANDONED'],
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count
    const totalCount = await prisma.game.count({
      where: {
        players: {
          some: {
            userId: user.id,
          },
        },
        status: {
          in: ['COMPLETED', 'ABANDONED'],
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        games,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get game history error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get game history',
      },
      { status: 500 }
    );
  }
}
