import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioAStageDotKind = 'own' | 'cast' | 'open';

const PERCENT = 100;
const PULSE_SECONDS = 1.6;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const dotPaints: Record<KkStudioAStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
    boxShadow: `0 0 0 2px ${palette(theme).background.paper}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -2,
      borderRadius: '50%',
      border: `2px solid ${palette(theme).primary.main}`,
      animation: `kk-studio-a-pulse ${PULSE_SECONDS}s cubic-bezier(.2,.6,.3,1) infinite`,
    },
    '@keyframes kk-studio-a-pulse': {
      from: { transform: 'scale(1)', opacity: 0.85 },
      to: { transform: 'scale(2.1)', opacity: 0 },
    },
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).text.primary,
    color: palette(theme).background.paper,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 72%, transparent)`,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
  }),
};

const notchInk: Record<KkStudioAStageDotKind, (theme: Theme) => string> = {
  own: (theme) => palette(theme).primary.main,
  cast: (theme) => palette(theme).text.primary,
  open: (theme) => palette(theme).warning.main,
};

interface KkStudioAStageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStudioAStageDotKind;
  turn: number | null;
}

export const KkStudioAStageDot: FC<KkStudioAStageDotProps> = ({ x, y, number, kind, turn }) => {
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
  };
  const notch =
    turn === null ? null : (
      <Box
        aria-hidden
        style={{ transform: `rotate(${turn}deg)` }}
        sx={{ position: 'absolute', inset: 0 }}
      >
        <Box
          sx={(theme) => ({
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: 0,
            height: 0,
            transform: 'translate(-50%, 1px)',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `5px solid ${notchInk[kind](theme)}`,
          })}
        />
      </Box>
    );

  return (
    <Box
      data-kk-studio-a-dot={kind}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '1.375rem',
        height: '1.375rem',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        willChange: 'transform',
        zIndex: kind === 'own' ? 2 : 1,
        [theme.breakpoints.up('desktop')]: { width: '1.75rem', height: '1.75rem' },
        ...dotPaints[kind](theme),
      })}
    >
      {notch}
      <Typography
        component="span"
        variant="caption"
        sx={{
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {number}
      </Typography>
    </Box>
  );
};
