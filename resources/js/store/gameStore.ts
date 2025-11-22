import { create } from 'zustand';
import type { Game, GameState, GamePlayer, GameType } from '@/types';

/**
 * Game Store - Central state management for the Time to Play gaming platform
 *
 * Manages:
 * - Current game state
 * - WebSocket connections
 * - Game lifecycle (create, join, leave, ready, move)
 * - Real-time updates via Laravel Echo
 */

interface GameStore {
    // State
    currentGame: Game | null;
    gameState: GameState | null;
    playerIndex: number | null;
    currentUserId: number | null;
    isConnected: boolean;
    isReady: boolean;
    error: string | null;
    loading: boolean;
    gameCancelled: { by: string; reason: string } | null;

    // Actions
    setCurrentGame: (game: Game | null) => void;
    setGameState: (state: GameState | null) => void;
    setPlayerIndex: (index: number | null) => void;
    setConnected: (connected: boolean) => void;
    setReady: (ready: boolean) => void;
    setError: (error: string | null) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;

    // Game Actions
    createGame: (gameType: GameType, maxPlayers: number, gameOptions?: Record<string, any>) => Promise<void>;
    joinGame: (gameId: number) => Promise<void>;
    leaveGame: (gameId: number) => Promise<void>;
    cancelGame: (gameId: number) => Promise<void>;
    toggleReady: (gameId: number) => Promise<void>;
    makeMove: (gameId: number, move: Record<string, any>) => Promise<void>;
    fetchGameState: (gameId: number, currentUserId?: number) => Promise<void>;

    // WebSocket
    subscribeToGame: (gameId: number) => void;
    unsubscribeFromGame: (gameId: number) => void;
}

const initialState = {
    currentGame: null,
    gameState: null,
    playerIndex: null,
    currentUserId: null,
    isConnected: false,
    isReady: false,
    error: null,
    loading: false,
    gameCancelled: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,

    // ==================== Setters ====================

    setCurrentGame: (game) => set({ currentGame: game }),
    setGameState: (state) => set({ gameState: state }),
    setPlayerIndex: (index) => set({ playerIndex: index }),
    setConnected: (connected) => set({ isConnected: connected }),
    setReady: (ready) => set({ isReady: ready }),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ loading }),
    reset: () => set(initialState),

    // ==================== Game Actions ====================

    /**
     * Create a new game
     */
    createGame: async (gameType, maxPlayers, gameOptions) => {
        set({ loading: true, error: null });
        try {
            const response = await window.axios.post('/api/games', {
                game_type: gameType,
                max_players: maxPlayers,
                game_options: gameOptions,
            });

            const game: Game = response.data.game;
            set({ currentGame: game, loading: false });

            // Find the current user's player index
            const currentUserId = (window as any).auth?.user?.id;
            const playerIndex = game.game_players.findIndex(
                (p) => p.user_id === currentUserId
            );
            set({ playerIndex: playerIndex >= 0 ? playerIndex : null });

            // Subscribe to WebSocket updates
            get().subscribeToGame(game.id);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to create game';
            set({ error: message, loading: false });
            throw error;
        }
    },

    /**
     * Join an existing game
     */
    joinGame: async (gameId) => {
        set({ loading: true, error: null });
        try {
            const response = await window.axios.post(`/api/games/${gameId}/join`);
            const gamePlayer: GamePlayer = response.data.game_player;

            set({
                playerIndex: gamePlayer.player_index,
                loading: false
            });

            // Fetch full game details
            await get().fetchGameState(gameId);

            // Subscribe to WebSocket updates
            get().subscribeToGame(gameId);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to join game';
            set({ error: message, loading: false });
            throw error;
        }
    },

    /**
     * Leave the current game
     */
    leaveGame: async (gameId) => {
        set({ loading: true, error: null });
        try {
            await window.axios.post(`/api/games/${gameId}/leave`);

            // Unsubscribe from WebSocket
            get().unsubscribeFromGame(gameId);

            // Reset state
            set({
                ...initialState,
                loading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to leave game';
            set({ error: message, loading: false });
            throw error;
        }
    },

    /**
     * Cancel a game (creator only)
     */
    cancelGame: async (gameId) => {
        set({ loading: true, error: null });
        try {
            await window.axios.delete(`/api/games/${gameId}`);

            // Unsubscribe from WebSocket
            get().unsubscribeFromGame(gameId);

            // Reset state
            set({
                ...initialState,
                loading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to cancel game';
            set({ error: message, loading: false });
            throw error;
        }
    },

    /**
     * Toggle ready status
     */
    toggleReady: async (gameId) => {
        const currentReady = get().isReady;
        set({ loading: true, error: null });
        try {
            await window.axios.post(`/api/games/${gameId}/ready`, {
                ready: !currentReady,
            });

            set({ isReady: !currentReady, loading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update ready status';
            set({ error: message, loading: false });
            throw error;
        }
    },

    /**
     * Make a move in the game
     */
    makeMove: async (gameId, move) => {
        set({ loading: true, error: null });
        try {
            const response = await window.axios.post(`/api/games/${gameId}/move`, {
                move,
            });

            const newState: GameState = response.data.state;
            set({ gameState: newState, loading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid move';
            set({ error: message, loading: false });
            throw error;
        }
    },

    /**
     * Fetch current game state
     */
    fetchGameState: async (gameId, currentUserId) => {
        set({ loading: true, error: null });
        try {
            const [gameResponse, stateResponse] = await Promise.all([
                window.axios.get(`/api/games/${gameId}`),
                window.axios.get(`/api/games/${gameId}/state`),
            ]);

            const game: Game = gameResponse.data.game;
            const state: GameState = stateResponse.data.state;

            // Use provided currentUserId or fall back to stored value
            const userId = currentUserId ?? get().currentUserId;

            console.log('[GameStore] fetchGameState:', {
                gameId,
                userId,
                playerCount: game.game_players.length,
                players: game.game_players.map(p => ({ id: p.user_id, name: p.user.name, ready: p.is_ready }))
            });

            // Calculate player index based on current user
            let playerIndex = -1;
            let isReady = false;

            if (userId) {
                // Find the current player's game_player record
                const currentPlayer = game.game_players.find(
                    (p) => p.user_id === userId
                );

                if (currentPlayer) {
                    // Use the player_index from the database, not array position
                    playerIndex = currentPlayer.player_index;
                    isReady = currentPlayer.is_ready || false;
                    console.log('[GameStore] Current player found:', { userId, playerIndex, isReady });
                } else {
                    console.warn('[GameStore] Current player NOT found for userId:', userId);
                }
            } else {
                console.warn('[GameStore] No userId available to identify current player');
            }

            set({
                currentGame: game,
                gameState: state,
                playerIndex: playerIndex >= 0 ? playerIndex : null,
                currentUserId: userId ?? null,
                isReady,
                loading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch game state';
            set({ error: message, loading: false });
            throw error;
        }
    },

    // ==================== WebSocket ====================

    /**
     * Subscribe to game updates via Laravel Echo
     */
    subscribeToGame: (gameId) => {
        console.log('[WebSocket] Subscribing to game channels:', gameId);

        if (!window.Echo) {
            console.error('[WebSocket] Laravel Echo not initialized!');
            return;
        }

        console.log('[WebSocket] Echo is available, joining channels...');

        // Join presence channel for player tracking
        const presenceChannel = window.Echo.join(`game.${gameId}`);

        console.log('[WebSocket] Joined presence channel:', `game.${gameId}`);

        presenceChannel
            .here((users: any[]) => {
                console.log('[WebSocket] Currently in game:', users);
                set({ isConnected: true });
            })
            .joining((user: any) => {
                console.log('[WebSocket] Player joining:', user.name);
            })
            .leaving((user: any) => {
                console.log('[WebSocket] Player leaving:', user.name);
            })
            .listen('.player.joined', (e: any) => {
                console.log('[WebSocket] PlayerJoinedGame event:', e);
                // Refresh game data
                const userId = get().currentUserId;
                get().fetchGameState(gameId, userId ?? undefined);
            })
            .listen('.player.left', (e: any) => {
                console.log('[WebSocket] PlayerLeftGame event:', e);
                // Refresh game data
                const userId = get().currentUserId;
                get().fetchGameState(gameId, userId ?? undefined);
            })
            .error((error: any) => {
                console.error('[WebSocket] Presence channel error:', error);
            });

        // Subscribe to private channel for game state updates
        const privateChannel = window.Echo.private(`game.${gameId}.private`);

        console.log('[WebSocket] Subscribed to private channel:', `game.${gameId}.private`);

        privateChannel
            .listen('.game.state.updated', (e: any) => {
                console.log('[WebSocket] GameStateUpdated event received:', e);
                // Refresh full game data to get updated status
                // Pass the current userId to ensure we can identify the current player
                const userId = get().currentUserId;
                console.log('[WebSocket] Calling fetchGameState with userId:', userId);
                get().fetchGameState(gameId, userId ?? undefined);
            })
            .listen('.game.move.made', (e: any) => {
                console.log('[WebSocket] MoveMade event:', e);
                // Refetch game state instead of using broadcasted state
                // (to avoid Pusher payload size limits)
                const userId = get().currentUserId;
                get().fetchGameState(gameId, userId ?? undefined);
            })
            .listen('.game.cancelled', (e: any) => {
                console.log('[WebSocket] GameCancelled event:', e);
                // Set cancelled state so UI can show appropriate message
                set({
                    gameCancelled: {
                        by: e.cancelledBy,
                        reason: e.reason || 'Game cancelled by host'
                    }
                });
            })
            .error((error: any) => {
                console.error('[WebSocket] Private channel error:', error);
            });

        console.log('[WebSocket] All channel subscriptions complete');

        // Update connection status
        window.axios.post(`/api/games/${gameId}/connect`, {
            connected: true,
        }).catch((error) => {
            console.error('[WebSocket] Failed to update connection status:', error);
        });
    },

    /**
     * Unsubscribe from game channels
     */
    unsubscribeFromGame: (gameId) => {
        if (!window.Echo) return;

        // Update connection status
        window.axios.post(`/api/games/${gameId}/connect`, {
            connected: false,
        }).catch(console.error);

        // Leave channels
        window.Echo.leave(`game.${gameId}`);
        window.Echo.leave(`game.${gameId}.private`);

        set({ isConnected: false });
    },
}));
