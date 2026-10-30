import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkStudioIWaveNumbers } from '../../../KkStudioIWave/internal/ui/KkStudioIWaveTicks';

const PERCENT = 100;
const DOWNBEAT = 1;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioICountsCell {
  key: string;
  share: number;
  count: number;
}

interface KkStudioICountsRulerProps {
  cells: readonly KkStudioICountsCell[];
  numbers: KkStudioIWaveNumbers;
}

const NUMBERED: Record<KkStudioIWaveNumbers, (count: number) => boolean> = {
  all: () => true,
  halves: (count) => count === 1 || count === 5,
  downbeats: (count) => count === 1,
};

export const KkStudioICountsRuler: FC<KkStudioICountsRulerProps> = ({ cells, numbers }) => {
  const marks = cells.map((cell) => {
    const downbeat = cell.count === DOWNBEAT;
    const number = NUMBERED[numbers](cell.count) ? (
      <Typography
        component="span"
        variant="caption"
        sx={(theme) => ({
          position: 'absolute',
          top: '0.25rem',
          left: '0.25rem',
          lineHeight: 1,
          fontWeight: downbeat ? 900 : 600,
          fontVariantNumeric: 'tabular-nums',
          color: downbeat ? palette(theme).text.primary : palette(theme).text.secondary,
        })}
      >
        {cell.count}
      </Typography>
    ) : null;

    return (
      <Box
        key={cell.key}
        style={{ left: `${cell.share * PERCENT}%` }}
        sx={{ position: 'absolute', top: 0, bottom: 0, width: 0 }}
      >
        <Box
          sx={(theme) => ({
            position: 'absolute',
            top: downbeat ? '0.25rem' : '0.5rem',
            bottom: '0.25rem',
            left: 0,
            width: downbeat ? '2px' : '1px',
            transform: 'translateX(-50%)',
            backgroundColor: downbeat ? palette(theme).text.secondary : palette(theme).divider,
          })}
        />
        {number}
      </Box>
    );
  });

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {marks}
    </Box>
  );
};
