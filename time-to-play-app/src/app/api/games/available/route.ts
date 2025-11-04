import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/games/available
 * Get list of available games to join
 */
export async function GET() {
  try {
    // Get games that are waiting for players
    const games = await prisma.game.findMany({
      where: {
        status: 'WAITING',
        isPrivate: false,
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
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 games
    });

    return NextResponse.json(
      {
        success: true,
        games,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get available games error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get available games',
      },
      { status: 500 }
    );
  }
}
