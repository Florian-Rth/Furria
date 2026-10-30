import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsBarClockProps {
  time: string;
  eight: string;
  count: string;
  label: string;
}

const numberSx = {
  fontFamily: kkTokens.font.display,
  fontWeight: kkTokens.font.displayWeight,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
} as const;

export const KkEightsBarClock: FC<KkEightsBarClockProps> = ({ time, eight, count, label }) => (
  <Stack
    direction="row"
    role="timer"
    aria-label={label}
    sx={{ alignItems: 'baseline', gap: 1, flexShrink: 0, px: 0.5 }}
  >
    <Typography variant="h4" component="span" sx={{ ...numberSx, minWidth: '4.5ch' }}>
      {time}
    </Typography>
    <Typography
      variant="body2"
      component="span"
      sx={(theme) => ({ ...numberSx, color: palette(theme).text.secondary, minWidth: '2.5ch' })}
    >
      {eight}
    </Typography>
    <Typography
      variant="h4"
      component="span"
      sx={(theme) => ({
        ...numberSx,
        minWidth: '1ch',
        textAlign: 'center',
        color: palette(theme).primary.main,
      })}
    >
      {count}
    </Typography>
  </Stack>
);
