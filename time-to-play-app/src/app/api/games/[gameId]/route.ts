import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/games/[gameId]
 * Get game details by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { gameId: string } }
) {
  try {
    const user = await getCurrentUser();
    const { gameId } = params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
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
        moves: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 100, // Last 100 moves
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        {
          success: false,
          error: 'Game not found',
        },
        { status: 404 }
      );
    }

    // Check if user is a player in this game
    const isPlayer = user && game.players.some(p => p.userId === user.id);

    // For private games, only players can view
    if (game.isPrivate && !isPlayer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        game,
        isPlayer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get game error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get game',
      },
      { status: 500 }
    );
  }
}
