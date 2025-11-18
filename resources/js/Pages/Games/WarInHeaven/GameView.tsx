import React, { useState } from 'react';
import { HexBoard } from './components/HexBoard';
import { CardData } from './components/Card';
import { TokenData } from './components/Token';
import { Faction, HexCoordinate, HexState } from './types/HexTypes';
import './GameView.css';

// Initialize hex states for the board
const initializeHexes = (): Record<string, HexState> => {
    const hexes: Record<string, HexState> = {};
    const gateHexes = ['A5', 'B5', 'C5', 'D5'];
    const angelDeployHexes = ['A1', 'B1'];
    const demonDeployHexes = ['A9', 'B9'];
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

// Helper to create tokens
const createTokensForCard = (card: Omit<CardData, 'tokens'>, count: number): TokenData[] => {
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

// Create Angel cards
const createAngelCards = (): CardData[] => {
    const angelCardsBase: Omit<CardData, 'tokens'>[] = [
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
            specialText: "Once per game, may move one of your Allies or Troops on the Battle Field to a space adjacent to Michael.",
            flavorText: "Defender of faith, protector of souls and symbol of divine justice.",
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
            specialText: "Start the game with 4 Troops on the Battle Field.",
            flavorText: "Symbols of justice and might, deliverers of God's Wrath, and the bane of wickedness.",
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
            specialText: "Moves 2 spaces in any direction. May move through occupied spaces.",
            flavorText: "At least wars can end, diseases can be cured, and evil can be vanquished. But stupidity? That thing is about as ever-lasting as His glory.",
        },
        {
            id: 'angel_camiel',
            name: 'Camiel',
            cost: 1,
            attack: 6,
            defense: 2,
            subtype: 'ally',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Camiel[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconcamiel.png',
            specialText: "Can move any number of spaces in a straight line. Cannot move onto or past Pearly Gate spaces.",
            flavorText: "Strength, courage and war.",
        },
        {
            id: 'angel_jophiel',
            name: 'Jophiel',
            cost: 2,
            attack: 2,
            defense: 4,
            subtype: 'ally',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Jophiel[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconjophiel.png',
            specialText: "At the end of her move, each opponent's Troops in a straight line to her moves one space closer to her.",
            flavorText: "Beauty of God.",
        },
        {
            id: 'angel_zadkiel',
            name: 'Zadkiel',
            cost: 2,
            attack: 1,
            defense: 3,
            subtype: 'ally',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Zadkiel[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconzadkiel.png',
            specialText: "WIN if you control the Pearly Gates by occupying all 4 spaces.",
            flavorText: "The righteousness of God.",
        },
        {
            id: 'angel_raphael',
            name: 'Raphael',
            cost: 3,
            attack: 0,
            defense: 4,
            subtype: 'ally',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Raphael[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconraphael.png',
            specialText: "At the start of each Round, may Deploy 1 of your ready or depleted Troops to the Battle Field for free.",
            flavorText: "Heal the earth which the fallen angels have defiled.",
        },
        {
            id: 'angel_gabriel',
            name: 'Gabriel',
            cost: 3,
            attack: 3,
            defense: 3,
            subtype: 'ally',
            faction: 'angels',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Gabriel[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/icongabriel.png',
            specialText: "Bolster your Troops by +2 Attack and +2 Defense.",
            flavorText: "Messenger of God.",
        },
    ];

    return angelCardsBase.map(cardBase => ({
        ...cardBase,
        tokens: createTokensForCard(cardBase, cardBase.subtype === 'troop' ? 4 : 1),
    })).sort((a, b) => a.cost - b.cost);
};

// Create Demon cards (similar structure)
const createDemonCards = (): CardData[] => {
    const demonCardsBase: Omit<CardData, 'tokens'>[] = [
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
            specialText: "Once per game, may move one of your Allies or Troops on the Battle Field to a space adjacent to Lucifer.",
            flavorText: "Lucifer was extremely prideful and rebelled against his Father.",
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
            specialText: "Start the game with 4 Troops on the Battle Field.",
            flavorText: "How art thou fallen from heaven.",
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
            specialText: "Moves 2 spaces in any direction. May move through occupied spaces.",
            flavorText: "Demon of the deadly sin envy.",
        },
        {
            id: 'demon_asmodeus',
            name: 'Asmodeus',
            cost: 1,
            attack: 6,
            defense: 2,
            subtype: 'ally',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Asmodeus[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconasmodeus.png',
            specialText: "Can move any number of spaces in a straight line. Cannot move onto or past Pearly Gate spaces.",
            flavorText: "Demon of the deadly sin lust.",
        },
        {
            id: 'demon_belphegor',
            name: 'Belphegor',
            cost: 2,
            attack: 2,
            defense: 4,
            subtype: 'ally',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Belphegor[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconbelphegor.png',
            specialText: "At the end of his move, each opponent's Troops in a straight line to him moves one space way from him.",
            flavorText: "Demon of the deadly sin sloth.",
        },
        {
            id: 'demon_beelzebub',
            name: 'Beelzebub',
            cost: 2,
            attack: 1,
            defense: 3,
            subtype: 'ally',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Beelzebub[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconbeelzebub.png',
            specialText: "WIN if all of your Allies are on the Battle Field.",
            flavorText: "Demon of the deadly sin gluttony.",
        },
        {
            id: 'demon_mammon',
            name: 'Mammon',
            cost: 3,
            attack: 0,
            defense: 4,
            subtype: 'ally',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Mammon[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconmammon.png',
            specialText: "At the start of each Round, may recharge up to one token. This is in addition to normal Recharge game rule.",
            flavorText: "Demon of the deadly sin greed.",
        },
        {
            id: 'demon_baal',
            name: 'Baal',
            cost: 3,
            attack: 3,
            defense: 3,
            subtype: 'ally',
            faction: 'demons',
            cardImageUrl: '/assets/games/war-in-heaven/card-images/Baal[face,1].png',
            iconUrl: '/assets/games/war-in-heaven/icons/iconbaal.png',
            specialText: "Bolster Lucifer by +2 Attack and +2 Defense.",
            flavorText: "Demon of the deadly sin fear.",
        },
    ];

    return demonCardsBase.map(cardBase => ({
        ...cardBase,
        tokens: createTokensForCard(cardBase, cardBase.subtype === 'troop' ? 4 : 1),
    })).sort((a, b) => a.cost - b.cost);
};

export default function GameView() {
    const [hexes, setHexes] = useState<Record<string, HexState>>(() => {
        const initialHexes = initializeHexes();
        // Place some initial tokens on the board
        initialHexes['A2'].occupiedBy = {
            id: 'angel_militia_token_0',
            name: "Heaven's Militia",
            faction: 'angels',
            subtype: 'troop',
            attack: 1,
            defense: 1,
            icon: '/assets/games/war-in-heaven/icons/iconmilitia.png',
            isActive: true,
        };
        initialHexes['B3'].occupiedBy = {
            id: 'angel_michael_token_0',
            name: 'Michael',
            faction: 'angels',
            subtype: 'commander',
            attack: 5,
            defense: 6,
            icon: '/assets/games/war-in-heaven/icons/iconmichael.png',
            isActive: true,
        };
        initialHexes['C4'].occupiedBy = {
            id: 'angel_uriel_token_0',
            name: 'Uriel',
            faction: 'angels',
            subtype: 'ally',
            attack: 3,
            defense: 2,
            icon: '/assets/games/war-in-heaven/icons/iconuriel.png',
            isActive: true,
        };
        initialHexes['C6'].occupiedBy = {
            id: 'demon_fallen_token_0',
            name: 'Fallen Angels',
            faction: 'demons',
            subtype: 'troop',
            attack: 1,
            defense: 1,
            icon: '/assets/games/war-in-heaven/icons/iconfallenangels.png',
            isActive: true,
        };
        initialHexes['B7'].occupiedBy = {
            id: 'demon_lucifer_token_0',
            name: 'Lucifer',
            faction: 'demons',
            subtype: 'commander',
            attack: 5,
            defense: 6,
            icon: '/assets/games/war-in-heaven/icons/iconlucifer.png',
            isActive: true,
        };
        return initialHexes;
    });
    const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null);
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'player' | 'opponent'>('player');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [round, setRound] = useState(1);
    const [actionsRemaining, setActionsRemaining] = useState(3);
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [draggedToken, setDraggedToken] = useState<{cardId: string, tokenIndex: number} | null>(null);

    const [angelCards, setAngelCards] = useState<CardData[]>(createAngelCards());
    const [demonCards, setDemonCards] = useState<CardData[]>(createDemonCards());
    const displayCards = activeTab === 'player' ? angelCards : demonCards;

    const handleHexClick = (coordinate: HexCoordinate) => {
        const hex = hexes[coordinate];

        // If we have a token on the hex, select it
        if (hex.occupiedBy) {
            // Click on token: select it (or deselect if already selected)
            if (selectedToken === hex.occupiedBy.id) {
                setSelectedToken(null);
                setSelectedHex(null);
            } else {
                setSelectedToken(hex.occupiedBy.id);
                setSelectedHex(coordinate);
            }
        } else {
            // Empty hex clicked
            if (selectedToken && selectedHex) {
                // Move token from selectedHex to this hex
                const fromHex = hexes[selectedHex];
                if (fromHex.occupiedBy) {
                    setHexes({
                        ...hexes,
                        [selectedHex]: {
                            ...fromHex,
                            occupiedBy: null,
                        },
                        [coordinate]: {
                            ...hex,
                            occupiedBy: fromHex.occupiedBy,
                        },
                    });
                    setSelectedToken(null);
                    setSelectedHex(null);
                }
            } else {
                setSelectedHex(coordinate);
            }
        }
    };

    const handleHexHover = (coordinate: HexCoordinate | null) => {
        // Optional hover handling
    };

    const handleTokenDragStart = (cardId: string, tokenIndex: number) => {
        const cards = activeTab === 'player' ? angelCards : demonCards;
        const card = cards.find(c => c.id === cardId);
        if (card && card.tokens[tokenIndex]) {
            setDraggedToken({ cardId, tokenIndex });
        }
    };

    const handleTokenDrop = (coordinate: HexCoordinate) => {
        if (!draggedToken) return;

        const cards = activeTab === 'player' ? angelCards : demonCards;
        const setCards = activeTab === 'player' ? setAngelCards : setDemonCards;
        const card = cards.find(c => c.id === draggedToken.cardId);

        if (!card) return;

        const token = card.tokens[draggedToken.tokenIndex];
        const hex = hexes[coordinate];

        // Check if hex is a valid deploy zone for this faction
        const isValidDeploy = (hex.type === 'deploy' &&
            ((token.faction === 'angels' && ['A1', 'B1'].includes(coordinate)) ||
             (token.faction === 'demons' && ['A9', 'B9'].includes(coordinate))));

        if (hex.occupiedBy || !isValidDeploy) return;

        // Place token on board
        setHexes({
            ...hexes,
            [coordinate]: {
                ...hex,
                occupiedBy: token,
            },
        });

        // Remove token from card
        const updatedCards = cards.map(c => {
            if (c.id === draggedToken.cardId) {
                return {
                    ...c,
                    tokens: c.tokens.filter((_, i) => i !== draggedToken.tokenIndex),
                };
            }
            return c;
        });
        setCards(updatedCards);
        setDraggedToken(null);
    };

    const handleCardTokenClick = (cardId: string, tokenIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const cards = activeTab === 'player' ? angelCards : demonCards;
        const setCards = activeTab === 'player' ? setAngelCards : setDemonCards;
        const card = cards.find(c => c.id === cardId);

        if (!card || !card.tokens[tokenIndex]) return;

        // Flip the token (for payment)
        const updatedCards = cards.map(c => {
            if (c.id === cardId) {
                return {
                    ...c,
                    tokens: c.tokens.map((token, i) =>
                        i === tokenIndex ? { ...token, isActive: !token.isActive } : token
                    ),
                };
            }
            return c;
        });
        setCards(updatedCards);
    };

    return (
        <div className="game-view">
            {/* Main Board Area */}
            <div className="game-view-board">
                <HexBoard
                    hexes={hexes}
                    selectedHex={selectedHex}
                    onHexClick={handleHexClick}
                    onHexHover={handleHexHover}
                    onDrop={handleTokenDrop}
                    validMoves={[]}
                />
            </div>

            {/* Summary Panel */}
            <div className="summary-panel">
                <div className="summary-section">
                    <div className="summary-label">Round</div>
                    <div className="summary-value">{round} / 12</div>
                </div>

                <div className="summary-divider" />

                <div className="summary-section">
                    <div className="summary-label">Actions</div>
                    <div className="summary-value">{actionsRemaining} / 3</div>
                    <div className="action-dots">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`action-dot ${i < actionsRemaining ? 'action-dot-active' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="summary-divider" />

                <button
                    className="end-turn-btn"
                    onClick={() => {
                        setActionsRemaining(3);
                        setRound(r => Math.min(12, r + 1));
                    }}
                >
                    End Turn
                </button>
            </div>

            {/* Collapsible Card Panel */}
            <div className={`card-panel ${isPanelExpanded ? 'card-panel-expanded' : 'card-panel-collapsed'}`}>
                {/* Expand/Collapse Button */}
                <button
                    className="panel-toggle-btn"
                    onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                >
                    {isPanelExpanded ? '▼' : '▲'}
                </button>

                {/* Tabs */}
                <div className="panel-tabs">
                    <button
                        className={`panel-tab ${activeTab === 'player' ? 'panel-tab-active' : ''}`}
                        onClick={() => setActiveTab('player')}
                    >
                        Your Hand (Angels)
                    </button>
                    <button
                        className={`panel-tab ${activeTab === 'opponent' ? 'panel-tab-active' : ''}`}
                        onClick={() => setActiveTab('opponent')}
                    >
                        Opponent Hand (Demons)
                    </button>
                </div>

                {/* Cards Display */}
                <div className="panel-cards">
                    {displayCards.map((card) => (
                        <div
                            key={card.id}
                            className="panel-card-wrapper"
                            onMouseEnter={() => setHoveredCard(card.id)}
                            onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Show all tokens for this card */}
                            {card.tokens.map((token, tokenIndex) => (
                                <div
                                    key={token.id}
                                    className="panel-card-token"
                                    style={{
                                        left: `${tokenIndex * 8}px`,
                                        cursor: 'pointer',
                                    }}
                                    draggable
                                    onDragStart={() => handleTokenDragStart(card.id, tokenIndex)}
                                    onClick={(e) => handleCardTokenClick(card.id, tokenIndex, e)}
                                    title="Drag to deploy or click to flip"
                                >
                                    <svg width="50" height="50" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="32" cy="32" r="31" fill="#000" />
                                        {/* Top section - always shows faction color and character icon */}
                                        <circle cx="32" cy="32" r="29" fill={token.isActive ? (card.faction === 'angels' ? '#FFB200' : '#7F0212') : '#D2D2D2'}
                                                clipPath={`url(#clip-top-mini-${token.id})`} />
                                        <clipPath id={`clip-top-mini-${token.id}`}>
                                            <rect x="0" y="0" width="64" height="38.4" />
                                        </clipPath>
                                        {/* Bottom section - always grey-blue */}
                                        <circle cx="32" cy="32" r="29" fill="#5A6C7D"
                                                clipPath={`url(#clip-bottom-mini-${token.id})`} />
                                        <clipPath id={`clip-bottom-mini-${token.id}`}>
                                            <rect x="0" y="38.4" width="64" height="25.6" />
                                        </clipPath>
                                        {/* Character icon - always on top */}
                                        <image
                                            href={card.iconUrl}
                                            x="17.6"
                                            y="6.4"
                                            width="28.8"
                                            height="28.8"
                                            clipPath={`url(#clip-top-mini-${token.id})`}
                                            preserveAspectRatio="xMidYMid meet"
                                        />
                                        {/* Bottom section content - changes based on active state */}
                                        {token.isActive ? (
                                            <>
                                                <text x="16" y="52" textAnchor="middle" fontSize="14" fill="#FFF" fontWeight="bold"
                                                      filter={`url(#shadow-mini-${token.id})`}>
                                                    {card.attack}
                                                </text>
                                                <text x="48" y="52" textAnchor="middle" fontSize="14" fill="#FFF" fontWeight="bold"
                                                      filter={`url(#shadow-mini-${token.id})`}>
                                                    {card.defense}
                                                </text>
                                            </>
                                        ) : (
                                            <image
                                                href="/assets/games/war-in-heaven/icons/refresh.png"
                                                x="22.4"
                                                y="42.4"
                                                width="19.2"
                                                height="19.2"
                                                clipPath={`url(#clip-bottom-mini-${token.id})`}
                                            />
                                        )}
                                        <defs>
                                            <filter id={`shadow-mini-${token.id}`}>
                                                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.8" floodColor="#000"/>
                                            </filter>
                                        </defs>
                                    </svg>
                                </div>
                            ))}

                            {/* Card Image */}
                            <img
                                src={card.cardImageUrl}
                                alt={card.name}
                                className="panel-card-image"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Tooltip */}
            {hoveredCard && (
                <div className="card-tooltip" style={{
                    left: `${mousePosition.x + 12}px`,
                    top: `${mousePosition.y + 12}px`,
                }}>
                    {displayCards.find(c => c.id === hoveredCard)?.specialText}
                </div>
            )}
        </div>
    );
}
