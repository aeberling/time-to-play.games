import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { prisma } from '@/lib/db';
import { GameFactory } from '@/lib/games/core/Game.interface';
import { registerGames } from '@/lib/games/registry';
import { GameStateManager } from '@/lib/game/state';

// Ensure games are registered
registerGames();

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

    // Initialize game state using game engine
    const gameInstance = GameFactory.create(gameType);
    if (!gameInstance) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create game instance',
        },
        { status: 500 }
      );
    }

    const initialGameData = gameInstance.initialize({
      gameType,
      players: [
        {
          userId: user.id,
          displayName: user.displayName,
          playerNumber: 1,
        },
      ],
      timerConfig,
    });

    // Create game in database
    const game = await prisma.game.create({
      data: {
        gameType,
        status: 'WAITING',
        timerConfig: timerConfig || null,
        isPrivate: isPrivate || false,
        stateSnapshot: initialGameData,
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

    // Initialize game state in Redis
    await GameStateManager.setState(game.id, {
      gameId: game.id,
      gameType,
      status: 'WAITING',
      players: [
        {
          userId: user.id,
          displayName: user.displayName,
          playerNumber: 1,
          isReady: true,
          isConnected: false,
        },
      ],
      gameData: initialGameData,
      timerConfig,
      createdAt: game.createdAt.getTime(),
      updatedAt: game.updatedAt.getTime(),
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
