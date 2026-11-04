import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from './internal/gold-ink';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const BAR_HEIGHT = '0.625rem';
const TICK_HEIGHT = '0.375rem';

const fillPaint =
  (warns: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: `${kkTokens.radius.pill}px`,
    ...(warns
      ? { ...goldInkOf(theme), backgroundColor: 'currentColor' }
      : { backgroundColor: 'text.primary' }),
  });

const scalePaint: CSSObject = {
  ...stepFigures,
  typography: 'caption',
  fontWeight: 700,
  lineHeight: 1.2,
  color: 'text.secondary',
  whiteSpace: 'nowrap',
};

interface KkTabRunwayProps {
  label: string;
  daysLeft: number | null;
  spanDays: number;
  horizonDays: number;
  warns: boolean;
  startLabel: string;
  horizonLabel: string;
  endLabel: string;
  sx?: KkSx;
}

export const KkTabRunway: FC<KkTabRunwayProps> = ({
  label,
  daysLeft,
  spanDays,
  horizonDays,
  warns,
  startLabel,
  horizonLabel,
  endLabel,
  sx,
}) => {
  const share = daysLeft === null ? 1 : Math.max(0, Math.min(1, daysLeft / spanDays));
  const horizonShare = horizonDays / spanDays;
  const ticks = Array.from({ length: spanDays - 1 }, (_, index) => (
    <Box
      key={index}
      sx={{
        position: 'absolute',
        top: '100%',
        left: `${((index + 1) / spanDays) * 100}%`,
        width: kkTokens.line.hair,
        height: index + 1 === horizonDays ? BAR_HEIGHT : TICK_HEIGHT,
        bgcolor: index + 1 === horizonDays ? 'text.secondary' : 'divider',
      }}
    />
  ));

  return (
    <Stack
      role="img"
      aria-label={label}
      data-kk-tab-runway
      sx={[{ gap: 0.5, minWidth: 0, pb: 0.25 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        sx={{
          position: 'relative',
          height: BAR_HEIGHT,
          borderRadius: `${kkTokens.radius.pill}px`,
          bgcolor: 'divider',
        }}
      >
        <Box sx={[fillPaint(warns), { width: `${share * 100}%` }]} />
        {ticks}
      </Box>
      <Box sx={{ position: 'relative', height: '1.1rem', mt: 0.5 }}>
        <Box component="span" sx={{ ...scalePaint, position: 'absolute', left: 0 }}>
          {startLabel}
        </Box>
        <Box
          component="span"
          sx={{
            ...scalePaint,
            position: 'absolute',
            left: `${horizonShare * 100}%`,
            transform: 'translateX(-50%)',
            color: 'text.primary',
          }}
        >
          {horizonLabel}
        </Box>
        <Box component="span" sx={{ ...scalePaint, position: 'absolute', right: 0 }}>
          {endLabel}
        </Box>
      </Box>
    </Stack>
  );
};
