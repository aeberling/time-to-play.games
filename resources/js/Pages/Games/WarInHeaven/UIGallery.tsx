import React, { useState } from 'react';
import { PlayerPanel, GameInfo, GameControls, GateControl, GamePhase } from './components/UI';

export default function UIGallery() {
    const [round, setRound] = useState(1);
    const [actionsRemaining, setActionsRemaining] = useState(3);
    const [currentPhase, setCurrentPhase] = useState<GamePhase>('action');
    const [angelsGates, setAngelsGates] = useState(2);
    const [demonsGates, setDemonsGates] = useState(1);

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
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>War in Heaven - UI Components Gallery</h1>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#999' }}>
                    Interactive preview of all game UI components
                </p>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '3rem',
            }}>
                {/* Player Panels Section */}
                <section>
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Player Panels</h2>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '300px' }}>
                            <h3 style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Player (Angels)</h3>
                            <PlayerPanel
                                playerName="Player 1"
                                faction="angels"
                                tokensOnBoard={8}
                                tokensActive={5}
                                tokensInactive={3}
                                isCurrentPlayer={true}
                            />
                        </div>
                        <div style={{ width: '300px' }}>
                            <h3 style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Waiting Player (Demons)</h3>
                            <PlayerPanel
                                playerName="Player 2"
                                faction="demons"
                                tokensOnBoard={7}
                                tokensActive={4}
                                tokensInactive={3}
                                isCurrentPlayer={false}
                            />
                        </div>
                    </div>
                </section>

                {/* Game Info Section */}
                <section>
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Game Information Display</h2>
                    <GameInfo
                        round={round}
                        maxRounds={12}
                        actionsRemaining={actionsRemaining}
                        maxActions={3}
                        currentPhase={currentPhase}
                    />

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setRound(r => Math.min(12, r + 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Next Round
                        </button>
                        <button
                            onClick={() => setActionsRemaining(a => Math.max(0, a - 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#f59e0b',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Use Action
                        </button>
                        <button
                            onClick={() => setActionsRemaining(3)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Reset Actions
                        </button>
                        <select
                            value={currentPhase}
                            onChange={(e) => setCurrentPhase(e.target.value as GamePhase)}
                            style={{
                                padding: '0.5rem',
                                background: '#2a2a2a',
                                color: '#fff',
                                border: '1px solid #444',
                                borderRadius: '4px',
                            }}
                        >
                            <option value="recharge">Recharge</option>
                            <option value="action">Action</option>
                            <option value="battle">Battle</option>
                            <option value="end">End Turn</option>
                        </select>
                    </div>
                </section>

                {/* Gate Control Section */}
                <section>
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Gate Control Indicator</h2>
                    <div style={{ maxWidth: '400px' }}>
                        <GateControl
                            angelsControl={angelsGates}
                            demonsControl={demonsGates}
                            totalGates={4}
                        />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setAngelsGates(g => Math.min(4, g + 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#FFB200',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Angels +1
                        </button>
                        <button
                            onClick={() => setAngelsGates(g => Math.max(0, g - 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#92400e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Angels -1
                        </button>
                        <button
                            onClick={() => setDemonsGates(g => Math.min(4, g + 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#7F0212',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Demons +1
                        </button>
                        <button
                            onClick={() => setDemonsGates(g => Math.max(0, g - 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#450a0a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Demons -1
                        </button>
                    </div>
                </section>

                {/* Game Controls Section */}
                <section>
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Game Controls</h2>
                    <GameControls
                        onEndTurn={() => alert('End Turn clicked!')}
                        onDeclareAttack={() => alert('Declare Attack clicked!')}
                        canEndTurn={true}
                        canDeclareAttack={true}
                    />

                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Disabled State</h3>
                        <GameControls
                            onEndTurn={() => {}}
                            onDeclareAttack={() => {}}
                            canEndTurn={false}
                            canDeclareAttack={false}
                        />
                    </div>
                </section>

                {/* Combined Layout Preview */}
                <section>
                    <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Combined Layout Example</h2>
                    <div style={{
                        background: '#2a2a2a',
                        padding: '2rem',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <PlayerPanel
                                    playerName="Player 1"
                                    faction="angels"
                                    tokensOnBoard={8}
                                    tokensActive={5}
                                    tokensInactive={3}
                                    isCurrentPlayer={true}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <PlayerPanel
                                    playerName="Player 2"
                                    faction="demons"
                                    tokensOnBoard={7}
                                    tokensActive={4}
                                    tokensInactive={3}
                                    isCurrentPlayer={false}
                                />
                            </div>
                        </div>

                        <GameInfo
                            round={round}
                            maxRounds={12}
                            actionsRemaining={actionsRemaining}
                            maxActions={3}
                            currentPhase={currentPhase}
                        />

                        <GateControl
                            angelsControl={angelsGates}
                            demonsControl={demonsGates}
                            totalGates={4}
                        />

                        <GameControls
                            onEndTurn={() => alert('End Turn!')}
                            onDeclareAttack={() => alert('Attack!')}
                            canEndTurn={true}
                            canDeclareAttack={true}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
