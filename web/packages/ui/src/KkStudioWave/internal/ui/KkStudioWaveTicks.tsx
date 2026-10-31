import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioWaveTick {
  key: string;
  share: number;
  text: string;
  current: boolean;
}

interface KkStudioWaveTicksProps {
  ticks: readonly KkStudioWaveTick[];
}

export const KkStudioWaveTicks: FC<KkStudioWaveTicksProps> = ({ ticks }) => {
  const marks = ticks.map((tick) => (
    <Box
      key={tick.key}
      data-current={tick.current}
      style={{ left: `${tick.share * PERCENT}%` }}
      sx={(theme) => ({
        position: 'absolute',
        bottom: 0,
        height: '1.75rem',
        pl: 0.375,
        borderLeft: `1px solid ${palette(theme).divider}`,
        color: palette(theme).text.secondary,
        '&[data-current="true"]': { color: palette(theme).primary.main },
      })}
    >
      <Typography
        component="span"
        variant="caption"
        sx={{
          display: 'block',
          lineHeight: '1.75rem',
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {tick.text}
      </Typography>
    </Box>
  ));

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {marks}
    </Box>
  );
};
