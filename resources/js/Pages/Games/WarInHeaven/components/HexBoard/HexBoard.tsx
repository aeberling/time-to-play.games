import React from 'react';
import { HexState } from '../../types/HexTypes';
import { HexTile } from './HexTile';
import { getHexPixelPosition, HEX_SIZE } from '../../utils/hexCalculations';
import './HexBoard.css';

interface HexBoardProps {
  hexes: Record<string, HexState>;
  selectedHex: string | null;
  validMoves: string[];
  onHexClick: (coordinate: string) => void;
  onHexHover: (coordinate: string | null) => void;
  showCoordinates?: boolean;
}

// Board layout definition - which hexes exist per row
const BOARD_LAYOUT = {
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

export const HexBoard: React.FC<HexBoardProps> = ({
  hexes,
  selectedHex,
  validMoves,
  onHexClick,
  onHexHover,
  showCoordinates = false,
}) => {
  // Calculate board dimensions
  const boardWidth = 5.5 * Math.sqrt(3) * HEX_SIZE; // ~380px at HEX_SIZE=40
  const boardHeight = 9 * HEX_SIZE * 1.5; // ~540px at HEX_SIZE=40
  const padding = HEX_SIZE * 2;

  const viewBoxWidth = boardWidth + padding * 2;
  const viewBoxHeight = boardHeight + padding * 2;

  return (
    <div className="hex-board-container">
      <svg
        className="hex-board"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hex shadow filter */}
          <filter id="hexShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>

          {/* Valid move indicator filter */}
          <filter id="validMoveGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render hexes by row */}
        <g transform={`translate(${padding}, ${padding})`}>
          {Object.entries(BOARD_LAYOUT).map(([rowStr, coordinates]) => {
            const row = parseInt(rowStr);
            return coordinates.map((coordinate) => {
              const hexState = hexes[coordinate];
              if (!hexState) return null;

              const col = coordinate.charAt(0);
              const { x, y } = getHexPixelPosition(col, row);

              return (
                <HexTile
                  key={coordinate}
                  coordinate={coordinate}
                  hexState={hexState}
                  x={x}
                  y={y}
                  isSelected={selectedHex === coordinate}
                  isValidMove={validMoves.includes(coordinate)}
                  showCoordinate={showCoordinates}
                  onClick={() => onHexClick(coordinate)}
                  onMouseEnter={() => onHexHover(coordinate)}
                  onMouseLeave={() => onHexHover(null)}
                />
              );
            });
          })}
        </g>
      </svg>
    </div>
  );
};
