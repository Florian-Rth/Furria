import type { FC } from 'react';
import type { KkPressRulerMarkState } from '../../press-ruler-data';

const PLATE_LAG_MS = 80;
const PLATE_SHIFT = 1.5;

interface KkPressRulerCellProps {
  state: KkPressRulerMarkState;
  x: number;
  y: number;
  width: number;
  height: number;
  delay: number;
}

export const KkPressRulerCell: FC<KkPressRulerCellProps> = ({
  state,
  x,
  y,
  width,
  height,
  delay,
}) => {
  const cellStyle = { animationDelay: `${delay}ms` };
  const plateStyle = { animationDelay: `${delay + PLATE_LAG_MS}ms` };
  const paint = state === 'struck' ? 'faint' : 'ink';

  const pendingPlate =
    state === 'shifted' ? (
      <rect
        x={x + PLATE_SHIFT}
        y={y - 1}
        width={width}
        height={height}
        data-paint="red"
        data-press="plate"
        strokeWidth={0}
        style={plateStyle}
      />
    ) : null;

  const strike =
    state === 'struck' ? (
      <line
        x1={x - 0.5}
        y1={y + height + 0.5}
        x2={x + width + 0.5}
        y2={y - 0.5}
        data-paint="red-line"
        data-press="plate"
        strokeWidth={1}
        style={plateStyle}
      />
    ) : null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        data-paint={paint}
        data-press="cell"
        style={cellStyle}
      />
      {pendingPlate}
      {strike}
    </g>
  );
};
