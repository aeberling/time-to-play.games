import React, { useState } from 'react';
import { HexBoard } from './components/HexBoard';
import { Card, CardData } from './components/Card';
import { TokenData } from './components/Token';
import { PlayerPanel, GameInfo, GameControls, GateControl, GamePhase } from './components/UI';
import { Faction, HexCoordinate, HexState } from './types/HexTypes';
import './GameLayout.css';

// Initialize hex states for the board
const initializeHexes = (): Record<string, HexState> => {
    const hexes: Record<string, HexState> = {};

    // Define gate hexes (A5, B5, C5, D5)
    const gateHexes = ['A5', 'B5', 'C5', 'D5'];

    // Define deploy hexes (A1, B1 for Angels; A9, B9 for Demons)
    const angelDeployHexes = ['A1', 'B1'];
    const demonDeployHexes = ['A9', 'B9'];

    // All hexes in the board
    const allHexes = [
        'A1', 'B1',
        'A2', 'B2', 'C2',
        'A3', 'B3', 'C3', 'D3',
        'A4', 'B4', 'C4', 'D4', 'E4',
        'A5', 'B5', 'C5', 'D5',
        'A6', 'B6', 'C6', 'D6', 'E6',
        'A7', 'B7', 'C7', 'D7',
        'A8', 'B8', 'C8',
        'A9', 'B9',
    ];

    allHexes.forEach(coordinate => {
        let type: 'standard' | 'deploy' | 'gate' = 'standard';

        if (gateHexes.includes(coordinate)) {
            type = 'gate';
        } else if (angelDeployHexes.includes(coordinate) || demonDeployHexes.includes(coordinate)) {
            type = 'deploy';
        }

        hexes[coordinate] = {
            coordinate,
            type,
            occupiedBy: null,
        };
    });

    return hexes;
};

// Helper to create sample tokens
const createSampleTokens = (card: Omit<CardData, 'tokens'>, count: number): TokenData[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `${card.id}_token_${i}`,
        name: card.name,
        faction: card.faction,
        subtype: card.subtype,
        attack: card.attack,
        defense: card.defense,
        icon: card.iconUrl,
        isActive: true,
    }));
};

// Sample cards for layout demo
const createSampleCards = (): CardData[] => {
    const angelCards: CardData[] = [
        {
            id: 'angel_michael',
            name: 'Michael',
            cost: 0,
            attack: 5,
            defense: 6,
            subtype: 'commander',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Michael[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconmichael.png',
            specialText: "Once per game, may move one of your Allies or Troops.",
            flavorText: "Defender of faith, protector of souls.",
            tokens: createSampleTokens({
                id: 'angel_michael',
                name: 'Michael',
                cost: 0,
                attack: 5,
                defense: 6,
                subtype: 'commander',
                faction: 'angels',
                cardImageUrl: '',
                iconUrl: '/assets/games/war-in-heaven/icons/iconmichael.png',
                specialText: '',
                flavorText: '',
            }, 1),
        },
        {
            id: 'angel_militia',
            name: "Heaven's Militia",
            cost: 0,
            attack: 1,
            defense: 1,
            subtype: 'troop',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Heaven_s_Militia[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconmilitia.png',
            specialText: "Start the game with 4 Troops.",
            flavorText: "Symbols of justice and might.",
            tokens: createSampleTokens({
                id: 'angel_militia',
                name: "Heaven's Militia",
                cost: 0,
                attack: 1,
                defense: 1,
                subtype: 'troop',
                faction: 'angels',
                cardImageUrl: '',
                iconUrl: '/assets/games/war-in-heaven/icons/iconmilitia.png',
                specialText: '',
                flavorText: '',
            }, 4),
        },
        {
            id: 'angel_uriel',
            name: 'Uriel',
            cost: 1,
            attack: 3,
            defense: 2,
            subtype: 'ally',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Uriel[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconuriel.png',
            specialText: "Moves 2 spaces in any direction.",
            flavorText: "At least wars can end...",
            tokens: createSampleTokens({
                id: 'angel_uriel',
                name: 'Uriel',
                cost: 1,
                attack: 3,
                defense: 2,
                subtype: 'ally',
                faction: 'angels',
                cardImageUrl: '',
                iconUrl: '/assets/games/war-in-heaven/icons/iconuriel.png',
                specialText: '',
                flavorText: '',
            }, 1),
        },
    ];

    const demonCards: CardData[] = [
        {
            id: 'demon_lucifer',
            name: 'Lucifer',
            cost: 0,
            attack: 5,
            defense: 6,
            subtype: 'commander',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Lucifer[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconlucifer.png',
            specialText: "Once per game, may move one of your Allies or Troops.",
            flavorText: "Lucifer was extremely prideful.",
            tokens: createSampleTokens({
                id: 'demon_lucifer',
                name: 'Lucifer',
                cost: 0,
                attack: 5,
                defense: 6,
                subtype: 'commander',
                faction: 'demons',
                cardImageUrl: '',
                iconUrl: '/assets/games/war-in-heaven/icons/iconlucifer.png',
                specialText: '',
                flavorText: '',
            }, 1),
        },
        {
            id: 'demon_fallen',
            name: 'Fallen Angels',
            cost: 0,
            attack: 1,
            defense: 1,
            subtype: 'troop',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Fallen_Angels[face,4].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconfallenangels.png',
            specialText: "Start the game with 4 Troops.",
            flavorText: "How art thou fallen from heaven.",
            tokens: createSampleTokens({
                id: 'demon_fallen',
                name: 'Fallen Angels',
                cost: 0,
                attack: 1,
                defense: 1,
                subtype: 'troop',
                faction: 'demons',
                cardImageUrl: '',
                iconUrl: '/assets/games/war-in-heaven/icons/iconfallenangels.png',
                specialText: '',
                flavorText: '',
            }, 4),
        },
        {
            id: 'demon_leviathen',
            name: 'Leviathen',
            cost: 1,
            attack: 3,
            defense: 2,
            subtype: 'ally',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Leviathen[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconleviathen.png',
            specialText: "Moves 2 spaces in any direction.",
            flavorText: "Demon of the deadly sin envy.",
            tokens: createSampleTokens({
                id: 'demon_leviathen',
                name: 'Leviathen',
                cost: 1,
                attack: 3,
                defense: 2,
                subtype: 'ally',
                faction: 'demons',
                cardImageUrl: '',
                iconUrl: '/assets/games/war-in-heaven/icons/iconleviathen.png',
                specialText: '',
                flavorText: '',
            }, 1),
        },
    ];

    return [...angelCards, ...demonCards];
};

export default function GameLayout() {
    const [hexes] = useState<Record<string, HexState>>(initializeHexes());
    const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [currentPhase, setCurrentPhase] = useState<GamePhase>('action');
    const [round, setRound] = useState(1);
    const [actionsRemaining, setActionsRemaining] = useState(3);

    const cards = createSampleCards();
    const angelCards = cards.filter(c => c.faction === 'angels');
    const demonCards = cards.filter(c => c.faction === 'demons');

    const handleHexClick = (coordinate: HexCoordinate) => {
        setSelectedHex(coordinate);
    };

    const handleHexHover = (coordinate: HexCoordinate | null) => {
        // Optional: Add hover state handling if needed
    };

    const handleCardClick = (cardId: string) => {
        setSelectedCard(selectedCard === cardId ? null : cardId);
    };

    const handleTokenClick = (tokenId: string) => {
        setSelectedToken(selectedToken === tokenId ? null : tokenId);
    };

    const handleEndTurn = () => {
        setActionsRemaining(3);
        setRound(r => r + 1);
        alert('Turn ended!');
    };

    return (
        <div className="game-layout">
            {/* Top Player Area - Angels */}
            <div className="game-layout-top">
                <div className="player-cards-area">
                    {angelCards.map(card => (
                        <div key={card.id} className="player-card-slot">
                            <Card
                                card={card}
                                isSelected={selectedCard === card.id}
                                onClick={() => handleCardClick(card.id)}
                                onTokenClick={handleTokenClick}
                                selectedTokenId={selectedToken}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Game Area */}
            <div className="game-layout-main">
                {/* Left Panel - Player 1 Info */}
                <div className="game-layout-left">
                    <PlayerPanel
                        playerName="Player 1"
                        faction="angels"
                        tokensOnBoard={8}
                        tokensActive={5}
                        tokensInactive={3}
                        isCurrentPlayer={true}
                    />
                </div>

                {/* Center - Game Board */}
                <div className="game-layout-center">
                    <div className="board-container">
                        <HexBoard
                            hexes={hexes}
                            selectedHex={selectedHex}
                            onHexClick={handleHexClick}
                            onHexHover={handleHexHover}
                            validMoves={[]}
                        />
                    </div>
                </div>

                {/* Right Panel - Game Info */}
                <div className="game-layout-right">
                    <div className="right-panel-content">
                        <GameInfo
                            round={round}
                            maxRounds={12}
                            actionsRemaining={actionsRemaining}
                            maxActions={3}
                            currentPhase={currentPhase}
                        />

                        <GateControl
                            angelsControl={2}
                            demonsControl={1}
                            totalGates={4}
                        />

                        <PlayerPanel
                            playerName="Player 2"
                            faction="demons"
                            tokensOnBoard={7}
                            tokensActive={4}
                            tokensInactive={3}
                            isCurrentPlayer={false}
                        />

                        <GameControls
                            onEndTurn={handleEndTurn}
                            onDeclareAttack={() => alert('Attack!')}
                            canEndTurn={true}
                            canDeclareAttack={true}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Player Area - Demons */}
            <div className="game-layout-bottom">
                <div className="player-cards-area">
                    {demonCards.map(card => (
                        <div key={card.id} className="player-card-slot">
                            <Card
                                card={card}
                                isSelected={selectedCard === card.id}
                                onClick={() => handleCardClick(card.id)}
                                onTokenClick={handleTokenClick}
                                selectedTokenId={selectedToken}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
