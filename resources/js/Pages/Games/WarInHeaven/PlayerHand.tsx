import React, { useState } from 'react';
import { Card, CardData } from './components/Card';
import { TokenData } from './components/Token';
import { Faction } from './types/HexTypes';

// Helper to create tokens for a card
const createTokensForCard = (card: Omit<CardData, 'tokens'>, startingCount: number): TokenData[] => {
    const tokens: TokenData[] = [];

    for (let i = 0; i < startingCount; i++) {
        tokens.push({
            id: `${card.id}_token_${i}`,
            name: card.name,
            faction: card.faction,
            subtype: card.subtype,
            attack: card.attack,
            defense: card.defense,
            icon: card.iconUrl,
            isActive: true, // All tokens start active
        });
    }

    return tokens;
};

// Define all angel cards
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

    // Create cards with tokens
    const angelCards: CardData[] = angelCardsBase.map(cardBase => {
        const tokenCount = cardBase.subtype === 'troop' ? 4 : 1;
        return {
            ...cardBase,
            tokens: createTokensForCard(cardBase, tokenCount),
        };
    });

    // Sort by cost (lowest to highest)
    return angelCards.sort((a, b) => a.cost - b.cost);
};

export default function PlayerHand() {
    const [cards, setCards] = useState<CardData[]>(createAngelCards());
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [selectedToken, setSelectedToken] = useState<string | null>(null);

    const handleCardClick = (cardId: string) => {
        setSelectedCard(selectedCard === cardId ? null : cardId);
    };

    const handleTokenClick = (tokenId: string) => {
        setSelectedToken(selectedToken === tokenId ? null : tokenId);
    };

    const toggleTokenState = (cardId: string, tokenId: string) => {
        setCards(cards.map(card => {
            if (card.id === cardId) {
                return {
                    ...card,
                    tokens: card.tokens.map(token =>
                        token.id === tokenId ? { ...token, isActive: !token.isActive } : token
                    ),
                };
            }
            return card;
        }));
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#1a1a1a',
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 2rem',
                background: '#2a2a2a',
                color: '#fff',
                borderBottom: '2px solid #FFB200',
            }}>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>War in Heaven - Player Hand</h1>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#999' }}>
                    Cards sorted by cost (lowest to highest) | All tokens start in active state
                </p>
            </div>

            {/* Player Hand Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                overflow: 'auto',
            }}>
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    maxWidth: '100%',
                }}>
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onDoubleClick={() => {
                                // Double-click on card flips first token
                                if (card.tokens.length > 0) {
                                    toggleTokenState(card.id, card.tokens[0].id);
                                }
                            }}
                        >
                            <Card
                                card={card}
                                isSelected={selectedCard === card.id}
                                onClick={() => handleCardClick(card.id)}
                                onTokenClick={(tokenId) => handleTokenClick(tokenId)}
                                selectedTokenId={selectedToken}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Footer */}
            <div style={{
                padding: '1rem 2rem',
                background: '#2a2a2a',
                color: '#999',
                borderTop: '1px solid #444',
                fontSize: '0.875rem',
                textAlign: 'center',
            }}>
                Click cards to select • Click tokens to select • Double-click cards to flip first token
            </div>
        </div>
    );
}
