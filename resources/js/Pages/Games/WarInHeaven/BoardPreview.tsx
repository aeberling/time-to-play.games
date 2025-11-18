import React, { useState } from 'react';
import { HexBoard } from './components/HexBoard';
import { HexState } from './types/HexTypes';

// Initialize the board with all hexes
const initializeBoard = (): Record<string, HexState> => {
    const hexes: Record<string, HexState> = {};

    // Gate/Bridge hexes (center row)
    const gateHexes = ['A5', 'B5', 'C5', 'D5'];
    // Deploy hexes
    const angelDeployHexes = ['A1', 'B1'];
    const demonDeployHexes = ['A9', 'B9'];

    // All valid hexes organized by row
    const allHexes = {
        1: ['A1', 'B1'],
        2: ['A2', 'B2', 'C2'],
        3: ['A3', 'B3', 'C3', 'D3'],
        4: ['A4', 'B4', 'C4', 'D4', 'E4'],
        5: ['A5', 'B5', 'C5', 'D5'],
        6: ['A6', 'B6', 'C6', 'D6', 'E6'],
        7: ['A7', 'B7', 'C7', 'D7'],
        8: ['A8', 'B8', 'C8'],
        9: ['A9', 'B9'],
    };

    // Create hex states
    Object.values(allHexes).flat().forEach((coordinate) => {
        let type: 'standard' | 'deploy' | 'gate' = 'standard';
        let owner: 'angels' | 'demons' | undefined = undefined;

        if (gateHexes.includes(coordinate)) {
            type = 'gate';
        } else if (angelDeployHexes.includes(coordinate)) {
            type = 'deploy';
            owner = 'angels';
        } else if (demonDeployHexes.includes(coordinate)) {
            type = 'deploy';
            owner = 'demons';
        }

        hexes[coordinate] = {
            coordinate,
            type,
            owner,
            occupiedBy: null,
        };
    });

    return hexes;
};

export default function BoardPreview() {
    const [hexes] = useState<Record<string, HexState>>(initializeBoard());
    const [selectedHex, setSelectedHex] = useState<string | null>(null);
    const [hoveredHex, setHoveredHex] = useState<string | null>(null);
    const [showCoordinates, setShowCoordinates] = useState(true);

    const handleHexClick = (coordinate: string) => {
        setSelectedHex(selectedHex === coordinate ? null : coordinate);
    };

    const handleHexHover = (coordinate: string | null) => {
        setHoveredHex(coordinate);
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #FFB200',
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>War in Heaven - Board Preview</h1>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#999' }}>
                        32 hexes | 4 Deploy spaces | 4 Gate/Bridge spaces | 24 Standard spaces
                    </p>
                </div>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showCoordinates}
                            onChange={(e) => setShowCoordinates(e.target.checked)}
                        />
                        <span>Show Coordinates</span>
                    </label>
                </div>
            </div>

            {/* Board */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Main board area */}
                <div style={{ flex: 1 }}>
                    <HexBoard
                        hexes={hexes}
                        selectedHex={selectedHex}
                        validMoves={[]}
                        onHexClick={handleHexClick}
                        onHexHover={handleHexHover}
                        showCoordinates={showCoordinates}
                    />
                </div>

                {/* Info panel */}
                <div style={{
                    width: '300px',
                    background: '#2a2a2a',
                    color: '#fff',
                    padding: '1.5rem',
                    overflowY: 'auto',
                    borderLeft: '1px solid #444',
                }}>
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Hex Information</h2>

                    {selectedHex ? (
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Selected:</strong> {selectedHex}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Type:</strong>{' '}
                                <span style={{
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: hexes[selectedHex].type === 'gate' ? '#606060' :
                                        hexes[selectedHex].type === 'deploy' ? '#999' : '#666',
                                    fontSize: '0.875rem',
                                }}>
                                    {hexes[selectedHex].type}
                                </span>
                            </div>
                            {hexes[selectedHex].owner && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong>Owner:</strong>{' '}
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        background: hexes[selectedHex].owner === 'angels' ? '#FFB200' : '#7F0212',
                                        fontSize: '0.875rem',
                                    }}>
                                        {hexes[selectedHex].owner}
                                    </span>
                                </div>
                            )}
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>Occupied:</strong> {hexes[selectedHex].occupiedBy || 'No'}
                            </div>
                        </div>
                    ) : hoveredHex ? (
                        <div>
                            <div style={{ marginBottom: '1rem', color: '#999' }}>
                                <strong>Hovering:</strong> {hoveredHex}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#666' }}>
                                Click to select
                            </p>
                        </div>
                    ) : (
                        <p style={{ color: '#666' }}>Click or hover over a hex to see details</p>
                    )}

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #444' }} />

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Legend</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '20px', height: '20px', background: '#E8E8E8', border: '1px solid #999' }} />
                            <span style={{ fontSize: '0.875rem' }}>Deploy Spaces</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '20px', height: '20px', background: '#606060', border: '1px solid #333' }} />
                            <span style={{ fontSize: '0.875rem' }}>Gate/Bridge (Pearly Gates)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '20px', height: '20px', background: '#F5F5F5', border: '1px solid #CCC' }} />
                            <span style={{ fontSize: '0.875rem' }}>Standard Spaces</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '20px', height: '20px', background: '#FFE59E', border: '2px solid #FFB200' }} />
                            <span style={{ fontSize: '0.875rem' }}>Selected Hex</span>
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #444' }} />

                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Board Layout</h3>
                    <div style={{ fontSize: '0.875rem', color: '#999', fontFamily: 'monospace' }}>
                        <div>Row 1: 2 hexes (Deploy - Angels)</div>
                        <div>Row 2: 3 hexes</div>
                        <div>Row 3: 4 hexes</div>
                        <div>Row 4: 5 hexes</div>
                        <div>Row 5: 4 hexes (Gate/Bridge)</div>
                        <div>Row 6: 5 hexes</div>
                        <div>Row 7: 4 hexes</div>
                        <div>Row 8: 3 hexes</div>
                        <div>Row 9: 2 hexes (Deploy - Demons)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
