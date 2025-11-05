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
    isConnected: boolean;
    isReady: boolean;
    error: string | null;
    loading: boolean;

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
    createGame: (gameType: GameType, maxPlayers: number) => Promise<void>;
    joinGame: (gameId: number) => Promise<void>;
    leaveGame: (gameId: number) => Promise<void>;
    toggleReady: (gameId: number) => Promise<void>;
    makeMove: (gameId: number, move: Record<string, any>) => Promise<void>;
    fetchGameState: (gameId: number) => Promise<void>;

    // WebSocket
    subscribeToGame: (gameId: number) => void;
    unsubscribeFromGame: (gameId: number) => void;
}

const initialState = {
    currentGame: null,
    gameState: null,
    playerIndex: null,
    isConnected: false,
    isReady: false,
    error: null,
    loading: false,
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
    createGame: async (gameType, maxPlayers) => {
        set({ loading: true, error: null });
        try {
            const response = await window.axios.post('/api/games', {
                game_type: gameType,
                max_players: maxPlayers,
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
    fetchGameState: async (gameId) => {
        set({ loading: true, error: null });
        try {
            const [gameResponse, stateResponse] = await Promise.all([
                window.axios.get(`/api/games/${gameId}`),
                window.axios.get(`/api/games/${gameId}/state`),
            ]);

            const game: Game = gameResponse.data.game;
            const state: GameState = stateResponse.data.state;

            set({
                currentGame: game,
                gameState: state,
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
        if (!window.Echo) {
            console.error('Laravel Echo not initialized');
            return;
        }

        // Join presence channel for player tracking
        window.Echo.join(`game.${gameId}`)
            .here((users: any[]) => {
                console.log('Currently in game:', users);
                set({ isConnected: true });
            })
            .joining((user: any) => {
                console.log('Player joined:', user.name);
            })
            .leaving((user: any) => {
                console.log('Player left:', user.name);
            })
            .listen('.player.joined', (e: any) => {
                console.log('PlayerJoinedGame event:', e);
                // Refresh game data
                get().fetchGameState(gameId);
            })
            .listen('.player.left', (e: any) => {
                console.log('PlayerLeftGame event:', e);
                // Refresh game data
                get().fetchGameState(gameId);
            });

        // Subscribe to private channel for game state updates
        window.Echo.private(`game.${gameId}.private`)
            .listen('.game.state.updated', (e: any) => {
                console.log('GameStateUpdated event:', e);
                set({ gameState: e.gameState });
            })
            .listen('.game.move.made', (e: any) => {
                console.log('MoveMade event:', e);
                set({ gameState: e.newGameState });
            });

        // Update connection status
        window.axios.post(`/api/games/${gameId}/connect`, {
            connected: true,
        }).catch(console.error);
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
