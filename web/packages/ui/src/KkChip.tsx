import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkChipSize } from './internal/chip-size';
import { chipSizeMetrics } from './internal/chip-size';
import type { KkTone } from './internal/tone';
import { tonePaint } from './internal/tone';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkChipTone = KkTone;

const DOT_SIZE = 6;

interface KkChipProps extends PropsWithChildren {
  tone?: KkChipTone;
  dot?: boolean;
  live?: boolean;
  size?: KkChipSize;
  sx?: KkSx;
}

export const KkChip: FC<KkChipProps> = ({
  tone = 'neutral',
  dot = false,
  live = false,
  size = 'medium',
  sx,
  children,
}) => {
  const animation = live ? kkTokens.motion.breath : 'none';

  const marker = dot ? (
    <Box
      aria-hidden
      component="span"
      sx={{
        display: 'inline-flex',
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        flexShrink: 0,
        animation,
      }}
    />
  ) : null;

  return (
    <Stack
      component="span"
      direction="row"
      data-kk-chip
      sx={[
        (theme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: 0.75,
          ...tonePaint(theme, tone),
          borderRadius: `${kkTokens.radius.pill}px`,
          fontFamily: kkTokens.font.body,
          fontWeight: 800,
          letterSpacing: kkTokens.type.tracking.tight,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          ...chipSizeMetrics[size],
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {marker}
      {children}
    </Stack>
  );
};
