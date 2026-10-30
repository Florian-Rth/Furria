import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const PERCENT = 100;
const DOWNBEAT = 1;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioIWaveTick {
  key: string;
  share: number;
  count: number;
  inside: boolean;
}

export type KkStudioIWaveNumbers = 'all' | 'halves' | 'downbeats';

const NUMBERED: Record<KkStudioIWaveNumbers, (count: number) => boolean> = {
  all: () => true,
  halves: (count) => count === 1 || count === 5,
  downbeats: (count) => count === 1,
};

interface KkStudioIWaveTicksProps {
  ticks: readonly KkStudioIWaveTick[];
  numbers: KkStudioIWaveNumbers;
}

export const KkStudioIWaveTicks: FC<KkStudioIWaveTicksProps> = ({ ticks, numbers }) => {
  const marks = ticks.map((tick) => {
    const downbeat = tick.count === DOWNBEAT;
    const number =
      tick.inside && NUMBERED[numbers](tick.count) ? (
        <Typography
          component="span"
          variant="caption"
          sx={(theme) => ({
            position: 'absolute',
            bottom: 0,
            left: 0,
            transform: 'translateX(-50%)',
            lineHeight: 1,
            fontWeight: downbeat ? 900 : 600,
            fontVariantNumeric: 'tabular-nums',
            color: downbeat ? palette(theme).text.primary : palette(theme).text.secondary,
          })}
        >
          {tick.count}
        </Typography>
      ) : null;

    return (
      <Box
        key={tick.key}
        data-kk-studio-i-tick={tick.count}
        style={{ left: `${tick.share * PERCENT}%` }}
        sx={{ position: 'absolute', top: 0, bottom: 0, width: 0 }}
      >
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: 0,
            bottom: '1rem',
            width: downbeat ? '2px' : '1px',
            height: downbeat ? '0.625rem' : '0.375rem',
            transform: 'translateX(-50%)',
            backgroundColor: tick.inside ? palette(theme).text.secondary : palette(theme).divider,
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
