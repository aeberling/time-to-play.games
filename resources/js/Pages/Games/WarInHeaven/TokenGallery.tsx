import React, { useState } from 'react';
import { Token, TokenData } from './components/Token';
import { Faction } from './types/HexTypes';

// Define all tokens based on the CSV data
const createTokens = (): TokenData[] => {
    const angels: TokenData[] = [
        {
            id: 'angel_michael',
            name: 'Michael',
            faction: 'angels',
            subtype: 'commander',
            attack: 5,
            defense: 6,
            icon: '/assets/games/war-in-heaven/icons/iconmichael.png',
            isActive: true,
        },
        {
            id: 'angel_militia_1',
            name: "Heaven's Militia",
            faction: 'angels',
            subtype: 'troop',
            attack: 1,
            defense: 1,
            icon: '/assets/games/war-in-heaven/icons/iconmilitia.png',
            isActive: true,
        },
        {
            id: 'angel_uriel',
            name: 'Uriel',
            faction: 'angels',
            subtype: 'ally',
            attack: 3,
            defense: 2,
            icon: '/assets/games/war-in-heaven/icons/iconuriel.png',
            isActive: true,
        },
        {
            id: 'angel_jophiel',
            name: 'Jophiel',
            faction: 'angels',
            subtype: 'ally',
            attack: 2,
            defense: 4,
            icon: '/assets/games/war-in-heaven/icons/iconjophiel.png',
            isActive: true,
        },
        {
            id: 'angel_raphael',
            name: 'Raphael',
            faction: 'angels',
            subtype: 'ally',
            attack: 0,
            defense: 4,
            icon: '/assets/games/war-in-heaven/icons/iconraphael.png',
            isActive: true,
        },
        {
            id: 'angel_camiel',
            name: 'Camiel',
            faction: 'angels',
            subtype: 'ally',
            attack: 6,
            defense: 2,
            icon: '/assets/games/war-in-heaven/icons/iconcamiel.png',
            isActive: true,
        },
        {
            id: 'angel_zadkiel',
            name: 'Zadkiel',
            faction: 'angels',
            subtype: 'ally',
            attack: 1,
            defense: 3,
            icon: '/assets/games/war-in-heaven/icons/iconzadkiel.png',
            isActive: true,
        },
        {
            id: 'angel_gabriel',
            name: 'Gabriel',
            faction: 'angels',
            subtype: 'ally',
            attack: 3,
            defense: 3,
            icon: '/assets/games/war-in-heaven/icons/icongabriel.png',
            isActive: true,
        },
    ];

    const demons: TokenData[] = [
        {
            id: 'demon_lucifer',
            name: 'Lucifer',
            faction: 'demons',
            subtype: 'commander',
            attack: 5,
            defense: 6,
            icon: '/assets/games/war-in-heaven/icons/iconlucifer.png',
            isActive: true,
        },
        {
            id: 'demon_fallen_1',
            name: 'Fallen Angels',
            faction: 'demons',
            subtype: 'troop',
            attack: 1,
            defense: 1,
            icon: '/assets/games/war-in-heaven/icons/iconfallenangels.png',
            isActive: true,
        },
        {
            id: 'demon_leviathen',
            name: 'Leviathen',
            faction: 'demons',
            subtype: 'ally',
            attack: 3,
            defense: 2,
            icon: '/assets/games/war-in-heaven/icons/iconleviathen.png',
            isActive: true,
        },
        {
            id: 'demon_belphegor',
            name: 'Belphegor',
            faction: 'demons',
            subtype: 'ally',
            attack: 2,
            defense: 4,
            icon: '/assets/games/war-in-heaven/icons/iconbelphegor.png',
            isActive: true,
        },
        {
            id: 'demon_mammon',
            name: 'Mammon',
            faction: 'demons',
            subtype: 'ally',
            attack: 0,
            defense: 4,
            icon: '/assets/games/war-in-heaven/icons/iconmammon.png',
            isActive: true,
        },
        {
            id: 'demon_asmodeus',
            name: 'Asmodeus',
            faction: 'demons',
            subtype: 'ally',
            attack: 6,
            defense: 2,
            icon: '/assets/games/war-in-heaven/icons/iconasmodeus.png',
            isActive: true,
        },
        {
            id: 'demon_beelzebub',
            name: 'Beelzebub',
            faction: 'demons',
            subtype: 'ally',
            attack: 1,
            defense: 3,
            icon: '/assets/games/war-in-heaven/icons/iconbeelzebub.png',
            isActive: true,
        },
        {
            id: 'demon_baal',
            name: 'Baal',
            faction: 'demons',
            subtype: 'ally',
            attack: 3,
            defense: 3,
            icon: '/assets/games/war-in-heaven/icons/iconbaal.png',
            isActive: true,
        },
    ];

    // Add 3 more troop tokens for each faction (total 4 per faction)
    for (let i = 2; i <= 4; i++) {
        angels.push({
            id: `angel_militia_${i}`,
            name: "Heaven's Militia",
            faction: 'angels',
            subtype: 'troop',
            attack: 1,
            defense: 1,
            icon: '/assets/games/war-in-heaven/icons/iconmilitia.png',
            isActive: true,
        });

        demons.push({
            id: `demon_fallen_${i}`,
            name: 'Fallen Angels',
            faction: 'demons',
            subtype: 'troop',
            attack: 1,
            defense: 1,
            icon: '/assets/games/war-in-heaven/icons/iconfallenangels.png',
            isActive: true,
        });
    }

    return [...angels, ...demons];
};

export default function TokenGallery() {
    const [tokens, setTokens] = useState<TokenData[]>(createTokens());
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [showActive, setShowActive] = useState(true);
    const [filterFaction, setFilterFaction] = useState<'all' | Faction>('all');
    const [filterSubtype, setFilterSubtype] = useState<'all' | 'commander' | 'troop' | 'ally'>('all');

    const handleTokenClick = (tokenId: string) => {
        setSelectedToken(selectedToken === tokenId ? null : tokenId);
    };

    const toggleTokenState = (tokenId: string) => {
        setTokens(tokens.map(t =>
            t.id === tokenId ? { ...t, isActive: !t.isActive } : t
        ));
    };

    const filteredTokens = tokens.filter(token => {
        if (filterFaction !== 'all' && token.faction !== filterFaction) return false;
        if (filterSubtype !== 'all' && token.subtype !== filterSubtype) return false;
        return true;
    });

    const selectedTokenData = selectedToken ? tokens.find(t => t.id === selectedToken) : null;

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
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>War in Heaven - Token Gallery</h1>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#999' }}>
                    22 tokens total | 11 per faction | Click tokens to select, double-click to flip
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
                {/* Token grid */}
                <div style={{
                    flex: 1,
                    padding: '2rem',
                    overflowY: 'auto',
                    background: '#1a1a1a',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '2rem',
                        justifyItems: 'center',
                    }}>
                        {filteredTokens.map((token) => (
                            <div
                                key={token.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                                onDoubleClick={() => toggleTokenState(token.id)}
                            >
                                <Token
                                    token={token}
                                    size="large"
                                    isSelected={selectedToken === token.id}
                                    onClick={() => handleTokenClick(token.id)}
                                />
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#999',
                                    textAlign: 'center',
                                }}>
                                    {token.name}
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: '#666',
                                    textAlign: 'center',
                                }}>
                                    {token.subtype}
                                </div>
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
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Token Details</h2>

                    {selectedTokenData ? (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <Token
                                    token={selectedTokenData}
                                    size="large"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Name:</strong> {selectedTokenData.name}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Faction:</strong>{' '}
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: selectedTokenData.faction === 'angels' ? '#FFB200' : '#7F0212',
                                    fontSize: '0.875rem',
                                }}>
                                    {selectedTokenData.faction}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Type:</strong> {selectedTokenData.subtype}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Attack:</strong> {selectedTokenData.attack} ⚔️
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Defense:</strong> {selectedTokenData.defense} 🛡️
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <strong>State:</strong> {selectedTokenData.isActive ? 'Active (Face Up)' : 'Inactive (Face Down)'}
                            </div>

                            <button
                                onClick={() => toggleTokenState(selectedTokenData.id)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#FFB200',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginTop: '1rem',
                                }}
                            >
                                Flip Token
                            </button>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>
                            Click a token to see details
                            <br /><br />
                            Double-click to flip between active/inactive states
                        </p>
                    )}

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #444' }} />

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Summary</h3>
                    <div style={{ fontSize: '0.875rem', color: '#999' }}>
                        <div>Total Tokens: {tokens.length}</div>
                        <div>Angels: {tokens.filter(t => t.faction === 'angels').length}</div>
                        <div>Demons: {tokens.filter(t => t.faction === 'demons').length}</div>
                        <div style={{ marginTop: '1rem' }}>
                            <div>Commanders: {tokens.filter(t => t.subtype === 'commander').length}</div>
                            <div>Troops: {tokens.filter(t => t.subtype === 'troop').length}</div>
                            <div>Allies: {tokens.filter(t => t.subtype === 'ally').length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
