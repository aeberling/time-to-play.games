import React, { useState } from 'react';
import { Card, CardData } from './components/Card';
import { TokenData } from './components/Token';
import { Faction } from './types/HexTypes';

// Helper function to create tokens for a card
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
            isActive: true,
        });
    }

    return tokens;
};

// Define all cards based on CSV data
const createCards = (): CardData[] => {
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

    // Create cards with tokens
    const angelCards: CardData[] = angelCardsBase.map(cardBase => {
        const tokenCount = cardBase.subtype === 'troop' ? 4 : 1;
        return {
            ...cardBase,
            tokens: createTokensForCard(cardBase, tokenCount),
        };
    });

    const demonCards: CardData[] = demonCardsBase.map(cardBase => {
        const tokenCount = cardBase.subtype === 'troop' ? 4 : 1;
        return {
            ...cardBase,
            tokens: createTokensForCard(cardBase, tokenCount),
        };
    });

    return [...angelCards, ...demonCards];
};

export default function CardGallery() {
    const [cards, setCards] = useState<CardData[]>(createCards());
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [filterFaction, setFilterFaction] = useState<'all' | Faction>('all');
    const [filterSubtype, setFilterSubtype] = useState<'all' | 'commander' | 'troop' | 'ally'>('all');

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

    const filteredCards = cards.filter(card => {
        if (filterFaction !== 'all' && card.faction !== filterFaction) return false;
        if (filterSubtype !== 'all' && card.subtype !== filterSubtype) return false;
        return true;
    });

    const selectedCardData = selectedCard ? cards.find(c => c.id === selectedCard) : null;

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
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>War in Heaven - Card Gallery</h1>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#999' }}>
                    16 cards total | 8 per faction | Click cards to select, double-click tokens to flip
                </p>
            </div>

            {/* Controls */}
            <div style={{
                padding: '1rem 2rem',
                background: '#2a2a2a',
                color: '#fff',
                display: 'flex',
                gap: '2rem',
                alignItems: 'center',
                borderBottom: '1px solid #444',
            }}>
                <div>
                    <label style={{ fontSize: '0.875rem', color: '#999', marginRight: '0.5rem' }}>Faction:</label>
                    <select
                        value={filterFaction}
                        onChange={(e) => setFilterFaction(e.target.value as any)}
                        style={{
                            background: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid #444',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                        }}
                    >
                        <option value="all">All</option>
                        <option value="angels">Angels</option>
                        <option value="demons">Demons</option>
                    </select>
                </div>

                <div>
                    <label style={{ fontSize: '0.875rem', color: '#999', marginRight: '0.5rem' }}>Type:</label>
                    <select
                        value={filterSubtype}
                        onChange={(e) => setFilterSubtype(e.target.value as any)}
                        style={{
                            background: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid #444',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                        }}
                    >
                        <option value="all">All</option>
                        <option value="commander">Commander</option>
                        <option value="troop">Troop</option>
                        <option value="ally">Ally</option>
                    </select>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Card grid */}
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: '#1a1a1a',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2rem',
                        justifyItems: 'center',
                    }}>
                        {filteredCards.map((card) => (
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

                {/* Info panel */}
                <div style={{
                    width: '350px',
                    background: '#2a2a2a',
                    color: '#fff',
                    padding: '1.5rem',
                    overflowY: 'auto',
                    borderLeft: '1px solid #444',
                }}>
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Card Details</h2>

                    {selectedCardData ? (
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Name:</strong> {selectedCardData.name}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Faction:</strong>{' '}
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: selectedCardData.faction === 'angels' ? '#FFB200' : '#7F0212',
                                    fontSize: '0.875rem',
                                }}>
                                    {selectedCardData.faction}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Type:</strong> {selectedCardData.subtype}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Cost:</strong> {selectedCardData.cost} {selectedCardData.cost === 1 ? 'token' : 'tokens'}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Attack:</strong> {selectedCardData.attack} ⚔️
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Defense:</strong> {selectedCardData.defense} 🛡️
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Tokens:</strong> {selectedCardData.tokens.length}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Ability:</strong>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                    {selectedCardData.specialText}
                                </p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Flavor:</strong>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', fontStyle: 'italic', color: '#999', lineHeight: '1.4' }}>
                                    {selectedCardData.flavorText}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>
                            Click a card to see details
                            <br /><br />
                            Double-click to flip first token
                            <br /><br />
                            Click individual tokens to select them
                        </p>
                    )}

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #444' }} />

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Summary</h3>
                    <div style={{ fontSize: '0.875rem', color: '#999' }}>
                        <div>Total Cards: {cards.length}</div>
                        <div>Angels: {cards.filter(c => c.faction === 'angels').length}</div>
                        <div>Demons: {cards.filter(c => c.faction === 'demons').length}</div>
                        <div style={{ marginTop: '1rem' }}>
                            <div>Commanders: {cards.filter(c => c.subtype === 'commander').length}</div>
                            <div>Troops: {cards.filter(c => c.subtype === 'troop').length}</div>
                            <div>Allies: {cards.filter(c => c.subtype === 'ally').length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
