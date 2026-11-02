import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

export type KkTouchLabTickKind = 'beat' | 'one';

export interface KkTouchLabTick {
  x: number;
  kind: KkTouchLabTickKind;
}

interface KkTouchLabTicksProps {
  ticks: readonly KkTouchLabTick[];
  snapX: number | null;
}

export const KkTouchLabTicks: FC<KkTouchLabTicksProps> = ({ ticks, snapX }) => {
  const snap = snapX === null ? null : <line data-snap x1={snapX} x2={snapX} y1="0" y2="100%" />;

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
        '& line': { stroke: touchLabPalette(theme).text.secondary, strokeWidth: 1 },
        '& line[data-kind="beat"]': { opacity: 0.35 },
        '& line[data-kind="one"]': { opacity: 0.8, strokeWidth: kkTokens.line.hair },
        '& line[data-snap]': {
          stroke: touchLabPalette(theme).warning.main,
          strokeWidth: kkTokens.line.section,
        },
      })}
    >
      {ticks.map((tick) => (
        <line
          key={tick.x}
          data-kind={tick.kind}
          x1={tick.x}
          x2={tick.x}
          y1={tick.kind === 'one' ? '82%' : '90%'}
          y2="100%"
        />
      ))}
      {snap}
    </Box>
  );
};
