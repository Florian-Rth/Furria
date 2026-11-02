import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabGridKind = 'metre' | 'quarter' | 'centre';

export interface KkTouchLabGridLine {
  at: number;
  kind: KkTouchLabGridKind;
}

export interface KkTouchLabFloorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface KkTouchLabFloorProps {
  floor: KkTouchLabFloorBox;
  columns: readonly KkTouchLabGridLine[];
  rows: readonly KkTouchLabGridLine[];
  snapX: number | null;
  snapY: number | null;
}

export const KkTouchLabFloor: FC<KkTouchLabFloorProps> = ({
  floor,
  columns,
  rows,
  snapX,
  snapY,
}) => {
  const top = floor.y;
  const bottom = floor.y + floor.height;
  const left = floor.x;
  const right = floor.x + floor.width;
  const snapColumn =
    snapX === null ? null : <line data-snap x1={snapX} x2={snapX} y1={top} y2={bottom} />;
  const snapRow =
    snapY === null ? null : <line data-snap x1={left} x2={right} y1={snapY} y2={snapY} />;

  return (
    <Box
      component="svg"
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        '& rect': {
          fill: touchLabPalette(theme).action.hover,
          stroke: touchLabPalette(theme).text.secondary,
          strokeWidth: kkTokens.line.hair,
        },
        '& line': { stroke: touchLabPalette(theme).text.secondary, strokeWidth: 1 },
        '& line[data-kind="quarter"]': { opacity: 0.14 },
        '& line[data-kind="metre"]': { opacity: 0.32 },
        '& line[data-kind="centre"]': { opacity: 0.6, strokeDasharray: '4 4' },
        '& line[data-snap]': {
          stroke: touchLabPalette(theme).warning.main,
          strokeWidth: kkTokens.line.section,
          opacity: 1,
        },
        '& line[data-front]': {
          stroke: touchLabPalette(theme).primary.main,
          strokeWidth: kkTokens.line.page,
          opacity: 1,
        },
      })}
    >
      <rect x={floor.x} y={floor.y} width={floor.width} height={floor.height} />
      {columns.map((line) => (
        <line
          key={`c${line.at}`}
          data-kind={line.kind}
          x1={line.at}
          x2={line.at}
          y1={top}
          y2={bottom}
        />
      ))}
      {rows.map((line) => (
        <line
          key={`r${line.at}`}
          data-kind={line.kind}
          x1={left}
          x2={right}
          y1={line.at}
          y2={line.at}
        />
      ))}
      <line data-front x1={left} x2={right} y1={bottom} y2={bottom} />
      {snapColumn}
      {snapRow}
    </Box>
  );
};
