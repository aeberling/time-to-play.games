import React from 'react';
import { Faction } from '../../types/HexTypes';
import './GateControl.css';

export interface GateControlProps {
    angelsControl: number;
    demonsControl: number;
    totalGates: number;
}

export const GateControl: React.FC<GateControlProps> = ({
    angelsControl,
    demonsControl,
    totalGates,
}) => {
    const neutral = totalGates - angelsControl - demonsControl;

    return (
        <div className="gate-control">
            <div className="gate-control-header">
                <span className="gate-icon">🚪</span>
                <span className="gate-title">Gate Control</span>
            </div>

            <div className="gate-control-bar">
                <div
                    className="gate-segment gate-segment-angels"
                    style={{ width: `${(angelsControl / totalGates) * 100}%` }}
                >
                    {angelsControl > 0 && angelsControl}
                </div>
                <div
                    className="gate-segment gate-segment-neutral"
                    style={{ width: `${(neutral / totalGates) * 100}%` }}
                >
                    {neutral > 0 && neutral}
                </div>
                <div
                    className="gate-segment gate-segment-demons"
                    style={{ width: `${(demonsControl / totalGates) * 100}%` }}
                >
                    {demonsControl > 0 && demonsControl}
                </div>
            </div>

            <div className="gate-control-labels">
                <div className="gate-label gate-label-angels">
                    Angels: {angelsControl}/{totalGates}
                </div>
                <div className="gate-label gate-label-demons">
                    Demons: {demonsControl}/{totalGates}
                </div>
            </div>
        </div>
    );
};
