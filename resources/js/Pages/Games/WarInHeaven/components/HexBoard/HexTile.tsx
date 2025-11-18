import React from 'react';
import { HexState } from '../../types/HexTypes';
import { HEX_SIZE } from '../../utils/hexCalculations';

interface HexTileProps {
  coordinate: string;
  hexState: HexState;
  x: number;
  y: number;
  isSelected: boolean;
  isValidMove: boolean;
  showCoordinate: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Generate flat-top hexagon points
const generateHexPoints = (size: number): string => {
  const points: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30); // Start from top-right
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push([x, y]);
  }
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
};

const HEX_POINTS = generateHexPoints(HEX_SIZE);

export const HexTile: React.FC<HexTileProps> = ({
  coordinate,
  hexState,
  x,
  y,
  isSelected,
  isValidMove,
  showCoordinate,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Determine hex fill color based on type
  const getFillColor = (): string => {
    if (isSelected) return '#FFE59E'; // Light yellow for selection
    if (isValidMove) return '#B8E6B8'; // Light green for valid moves

    switch (hexState.type) {
      case 'deploy':
        return hexState.owner === 'angels' ? '#E8E8E8' : '#E8E8E8';
      case 'gate':
        return '#606060';
      case 'standard':
      default:
        return '#F5F5F5';
    }
  };

  // Determine stroke color
  const getStrokeColor = (): string => {
    if (isSelected) return '#FFB200'; // Gold for selection
    if (isValidMove) return '#4CAF50'; // Green for valid moves

    switch (hexState.type) {
      case 'deploy':
        return '#999';
      case 'gate':
        return '#333';
      case 'standard':
      default:
        return '#CCC';
    }
  };

  // Determine stroke width
  const getStrokeWidth = (): number => {
    if (isSelected) return 3;
    if (isValidMove) return 2;
    return hexState.type === 'deploy' || hexState.type === 'gate' ? 1.5 : 1;
  };

  // Text color for coordinates
  const getTextColor = (): string => {
    return hexState.type === 'gate' ? '#EEE' : '#333';
  };

  // Type label text
  const getTypeLabel = (): string | null => {
    if (hexState.type === 'deploy') {
      return `Deploy (${hexState.owner === 'angels' ? 'A' : 'D'})`;
    }
    if (hexState.type === 'gate') {
      return 'Gate';
    }
    return null;
  };

  return (
    <g
      className="hex-tile"
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Hexagon shape */}
      <polygon
        points={HEX_POINTS}
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        filter="url(#hexShadow)"
        className="hex-polygon"
      />

      {/* Valid move indicator (glow) */}
      {isValidMove && (
        <polygon
          points={HEX_POINTS}
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2"
          opacity="0.6"
          filter="url(#validMoveGlow)"
        />
      )}

      {/* Coordinate label */}
      {showCoordinate && (
        <text
          x="0"
          y="-5"
          textAnchor="middle"
          fontSize="10"
          fontFamily="monospace"
          fill={getTextColor()}
          pointerEvents="none"
        >
          {coordinate}
        </text>
      )}

      {/* Type label */}
      {getTypeLabel() && (
        <text
          x="0"
          y="8"
          textAnchor="middle"
          fontSize="7"
          fontFamily="sans-serif"
          fill={hexState.type === 'gate' ? '#CCC' : '#666'}
          pointerEvents="none"
        >
          {getTypeLabel()}
        </text>
      )}

      {/* Occupied indicator (if hex has a token) */}
      {hexState.occupiedBy && (
        <circle
          r={HEX_SIZE * 0.4}
          fill="rgba(255, 255, 255, 0.3)"
          stroke="#333"
          strokeWidth="1"
          pointerEvents="none"
        />
      )}
    </g>
  );
};
