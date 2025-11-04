import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/games/[gameId]/join
 * Join an existing game
 */
export async function POST(
  request: Request,
  { params }: { params: { gameId: string } }
) {
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

    const { gameId } = params;

    // Get the game
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
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

    // Check if game is waiting for players
    if (game.status !== 'WAITING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Game is not accepting players',
        },
        { status: 400 }
      );
    }

    // Check if user is already in the game
    const alreadyJoined = game.players.some(p => p.userId === user.id);
    if (alreadyJoined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already joined this game',
        },
        { status: 400 }
      );
    }

    // Check if game is full (War is 2 players)
    if (game.players.length >= 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Game is full',
        },
        { status: 400 }
      );
    }

    // Add player to game
    await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: user.id,
        playerNumber: game.players.length + 1,
        isReady: true,
      },
    });

    // If game now has 2 players, mark as IN_PROGRESS
    if (game.players.length + 1 >= 2) {
      await prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    // Get updated game
    const updatedGame = await prisma.game.findUnique({
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        game: updatedGame,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Join game error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join game',
      },
      { status: 500 }
    );
  }
}
