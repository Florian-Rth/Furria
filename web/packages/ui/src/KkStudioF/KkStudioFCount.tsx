import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { redInkScheme } from '../internal/red-ink';
import { applyScheme } from '../internal/scheme-paint';
import { kkTokens } from '../tokens';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const ROW_HEIGHT = '2.25rem';
const PULSE_SCALE = 1.45;

const beatPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  textAlign: 'center',
  typography: 'h3',
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  color: (theme.vars ?? theme).palette.text.disabled,
  transition: 'transform 140ms ease-out, color 90ms linear',
  transformOrigin: 'center 60%',
  '&[data-kk-studio-f-beat="first"]': { color: (theme.vars ?? theme).palette.text.secondary },
  '&[data-kk-studio-f-beat="current"]': {
    transform: `scale(${PULSE_SCALE})`,
    transition: 'transform 60ms ease-out, color 30ms linear',
    ...applyScheme(theme, redInkScheme),
  },
});

const beatOf = (beat: number, count: number | null): string => {
  if (beat === count) {
    return 'current';
  }

  return beat === 1 ? 'first' : 'rest';
};

interface KkStudioFCountProps {
  count: number | null;
  label: string;
}

export const KkStudioFCount: FC<KkStudioFCountProps> = ({ count, label }) => {
  const beats = COUNTS.map((beat) => (
    <Box key={beat} component="span" data-kk-studio-f-beat={beatOf(beat, count)} sx={beatPaint}>
      {beat}
    </Box>
  ));

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-studio-f-count
      sx={{
        height: ROW_HEIGHT,
        alignItems: 'center',
        minWidth: 0,
        letterSpacing: kkTokens.type.tracking.display,
      }}
    >
      {beats}
    </Stack>
  );
};
