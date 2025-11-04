import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/games
 * Create a new game
 */
export async function POST(request: Request) {
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
    const { gameType, timerConfig, isPrivate } = body;

    // Validate game type
    const validGameTypes = ['WAR'];
    if (!gameType || !validGameTypes.includes(gameType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid game type',
        },
        { status: 400 }
      );
    }

    // Create game
    const game = await prisma.game.create({
      data: {
        gameType,
        status: 'WAITING',
        timerConfig: timerConfig || null,
        isPrivate: isPrivate || false,
        players: {
          create: {
            userId: user.id,
            playerNumber: 1,
            isReady: true,
          },
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
    });

    return NextResponse.json(
      {
        success: true,
        game,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create game',
      },
      { status: 500 }
    );
  }
}
