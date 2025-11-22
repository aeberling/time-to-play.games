import React from 'react';
import { HexBoard } from './components/HexBoard';
import { PlayerPanel } from './components/UI/PlayerPanel';
import { GameControls } from './components/UI/GameControls';
import { GameInfo } from './components/UI/GameInfo';
import { GateControl } from './components/UI/GateControl';
import { useWarInHeaven } from './hooks/useWarInHeaven';
import type { WarInHeavenGameState } from '@/types';
import './GameView.css';

interface GameViewProps {
    gameId: number;
    userId: number;
}

/**
 * War in Heaven - Game View
 *
 * Main game UI component that renders the board and all game elements.
 * All game logic is handled by the backend; this component only displays
 * state and captures user input.
 */
export default function GameView({ gameId, userId }: GameViewProps) {
    const {
        gameState,
        playerIndex,
        isMyTurn,
        currentPhase,
        myFaction,
        selectedHex,
        validMoves,
        selectedAttackers,
        combatTarget,
        hoveredHex,
        setHoveredHex,
        handleHexClick,
        handleDeployToken,
        handleAttack,
        handleRecharge,
        handleEndPhase,
        handleEndTurn,
        toggleAttacker,
        clearSelection,
    } = useWarInHeaven(gameId, userId);

    // Show loading state while game state is loading
    if (!gameState) {
        return (
            <div className="game-view-loading">
                <div className="loading-spinner" />
                <p>Loading game...</p>
            </div>
        );
    }

    // Get player info
    const currentPlayer = gameState.players[gameState.currentTurn];
    const myPlayer = gameState.players[playerIndex];

    // Calculate gate control for display
    const gateHexes = ['A5', 'B5', 'C5', 'D5'];
    let angelGates = 0;
    let demonGates = 0;

    gateHexes.forEach(coord => {
        const hex = gameState.board[coord];
        if (hex?.occupiedBy) {
            if (hex.occupiedBy.faction === 'angels') angelGates++;
            else if (hex.occupiedBy.faction === 'demons') demonGates++;
        }
    });

    return (
        <div className="war-in-heaven-game-view">
            {/* Game Header */}
            <div className="game-header">
                <GameInfo
                    round={gameState.round}
                    phase={currentPhase}
                    currentPlayer={currentPlayer?.faction || 'angels'}
                    isMyTurn={isMyTurn}
                    actionsRemaining={gameState.actionsRemaining}
                    rechargesRemaining={gameState.rechargesRemaining}
                />

                <GateControl
                    angelGates={angelGates}
                    demonGates={demonGates}
                />
            </div>

            {/* Main Game Area */}
            <div className="game-main">
                {/* Left Panel - Opponent Info */}
                <div className="game-sidebar game-sidebar-left">
                    <PlayerPanel
                        faction={myFaction === 'angels' ? 'demons' : 'angels'}
                        cards={myFaction === 'angels' ? gameState.cards.demons : gameState.cards.angels}
                        isCurrentPlayer={!isMyTurn}
                        isMe={false}
                        phase={currentPhase}
                    />
                </div>

                {/* Center - Game Board */}
                <div className="game-board-container">
                    <HexBoard
                        hexes={gameState.board}
                        selectedHex={selectedHex}
                        validMoves={validMoves}
                        selectedAttackers={selectedAttackers}
                        combatTarget={combatTarget}
                        hoveredHex={hoveredHex}
                        onHexClick={handleHexClick}
                        onHexHover={setHoveredHex}
                        isMyTurn={isMyTurn}
                        myFaction={myFaction}
                    />

                    {/* Game Controls */}
                    <GameControls
                        phase={currentPhase}
                        isMyTurn={isMyTurn}
                        selectedAttackers={selectedAttackers}
                        combatTarget={combatTarget}
                        onClearSelection={clearSelection}
                        onAttack={handleAttack}
                        onEndPhase={handleEndPhase}
                        onEndTurn={handleEndTurn}
                    />
                </div>

                {/* Right Panel - My Cards */}
                <div className="game-sidebar game-sidebar-right">
                    <PlayerPanel
                        faction={myFaction}
                        cards={myFaction === 'angels' ? gameState.cards.angels : gameState.cards.demons}
                        isCurrentPlayer={isMyTurn}
                        isMe={true}
                        onDeployCard={handleDeployToken}
                        phase={currentPhase}
                    />
                </div>
            </div>

            {/* Victory Screen */}
            {gameState.winner !== null && (
                <div className="victory-overlay">
                    <div className="victory-card">
                        <h2>
                            {gameState.winner === playerIndex ? 'Victory!' : 'Defeat'}
                        </h2>
                        <p className="victory-condition">
                            {gameState.victoryCondition || 'Game Over'}
                        </p>
                        <button
                            onClick={() => window.location.href = '/games/lobby'}
                            className="btn-primary"
                        >
                            Return to Lobby
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
