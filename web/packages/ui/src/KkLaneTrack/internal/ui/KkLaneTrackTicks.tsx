import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { percentOf } from '../lane-geometry';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkLaneTrackTick {
  key: string;
  share: number;
  strong: boolean;
  text: string | null;
}

interface KkLaneTrackTicksProps {
  ticks: readonly KkLaneTrackTick[];
  edge: 'top' | 'bottom';
}

export const KkLaneTrackTicks: FC<KkLaneTrackTicksProps> = ({ ticks, edge }) => {
  const marks = ticks.map((tick) => {
    const text =
      tick.text === null ? null : (
        <Typography
          component="span"
          variant="caption"
          sx={{
            position: 'absolute',
            [edge]: 0,
            left: '0.25rem',
            lineHeight: 1.1,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
            color: tick.strong ? 'text.primary' : 'text.secondary',
          }}
        >
          {tick.text}
        </Typography>
      );

    return (
      <Box
        key={tick.key}
        data-strong={tick.strong}
        style={{ left: percentOf(tick.share) }}
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            [edge === 'top' ? 'bottom' : 'top']: 0,
            left: 0,
            height: '28%',
            borderLeft: `${kkTokens.line.hair / 1.5}px solid ${palette(theme).divider}`,
          },
          '&[data-strong="true"]::before': {
            height: '100%',
            borderLeftColor: `color-mix(in srgb, ${palette(theme).text.primary} 30%, transparent)`,
          },
        })}
      >
        {text}
      </Box>
    );
  });

  return (
    <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {marks}
    </Box>
  );
};
