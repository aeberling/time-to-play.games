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
  onDrop?: () => void;
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
  onDrop,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDrop) onDrop();
  };
  // Determine hex fill color based on type
  const getFillColor = (): string => {
    if (isDragOver && hexState.type === 'deploy') return '#C8E6C8'; // Light green for valid drop zone
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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

      {/* Token (if hex is occupied) - always shows active state */}
      {hexState.occupiedBy && (
        <g pointerEvents="none">
          {/* Token background - black border */}
          <circle r={HEX_SIZE * 0.65} fill="#000" />

          {/* Top section - 3/5 of token with faction color */}
          <circle
            r={HEX_SIZE * 0.62}
            fill={hexState.occupiedBy.faction === 'angels' ? '#FFB200' : '#7F0212'}
            clipPath={`url(#token-top-${coordinate})`}
          />
          <clipPath id={`token-top-${coordinate}`}>
            <rect
              x={-HEX_SIZE * 0.62}
              y={-HEX_SIZE * 0.62}
              width={HEX_SIZE * 1.24}
              height={HEX_SIZE * 0.744}
            />
          </clipPath>

          {/* Bottom section - 2/5 of token with grey-blue */}
          <circle
            r={HEX_SIZE * 0.62}
            fill="#5A6C7D"
            clipPath={`url(#token-bottom-${coordinate})`}
          />
          <clipPath id={`token-bottom-${coordinate}`}>
            <rect
              x={-HEX_SIZE * 0.62}
              y={-HEX_SIZE * 0.124}
              width={HEX_SIZE * 1.24}
              height={HEX_SIZE * 0.496}
            />
          </clipPath>

          {/* Character icon in top section */}
          <image
            href={hexState.occupiedBy.icon}
            x={-HEX_SIZE * 0.35}
            y={-HEX_SIZE * 0.5}
            width={HEX_SIZE * 0.7}
            height={HEX_SIZE * 0.7}
            clipPath={`url(#token-top-${coordinate})`}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Attack and Defense stats in bottom section */}
          <text
            x={-HEX_SIZE * 0.35}
            y={HEX_SIZE * 0.35}
            textAnchor="middle"
            fontSize={HEX_SIZE * 0.35}
            fill="#FFF"
            fontWeight="bold"
            filter={`url(#token-shadow-${coordinate})`}
          >
            {hexState.occupiedBy.attack}
          </text>
          <text
            x={HEX_SIZE * 0.35}
            y={HEX_SIZE * 0.35}
            textAnchor="middle"
            fontSize={HEX_SIZE * 0.35}
            fill="#FFF"
            fontWeight="bold"
            filter={`url(#token-shadow-${coordinate})`}
          >
            {hexState.occupiedBy.defense}
          </text>

          <defs>
            <filter id={`token-shadow-${coordinate}`}>
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.8" floodColor="#000"/>
            </filter>
          </defs>
        </g>
      )}
    </g>
  );
};
