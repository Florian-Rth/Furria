import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';
import type { KkStudioDStageSize } from '../layout/KkStudioDStageRoot';

export type KkStudioDStageDotKind = 'own' | 'cast' | 'open';

const PERCENT = 100;
const PULSE_SECONDS = 1.6;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const dotPaints: Record<KkStudioDStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: kkTokens.color.light.onRed,
    boxShadow: `0 0 0 2px ${kkTokens.color.dark.darkroom}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -2,
      borderRadius: '50%',
      border: `2px solid ${palette(theme).primary.main}`,
      animation: `kk-studio-d-pulse ${PULSE_SECONDS}s cubic-bezier(.2,.6,.3,1) infinite`,
    },
    '@keyframes kk-studio-d-pulse': {
      from: { transform: 'scale(1)', opacity: 0.85 },
      to: { transform: 'scale(2.1)', opacity: 0 },
    },
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).text.primary,
    color: kkTokens.color.dark.darkroom,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${kkTokens.color.dark.darkroom} 60%, transparent)`,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
  }),
};

const notchInk: Record<KkStudioDStageDotKind, (theme: Theme) => string> = {
  own: (theme) => palette(theme).primary.main,
  cast: (theme) => palette(theme).text.primary,
  open: (theme) => palette(theme).warning.main,
};

const dotExtents: Record<KkStudioDStageSize, Record<KkStudioDStageDotKind, string>> = {
  full: { own: '2rem', cast: '1.625rem', open: '1.625rem' },
  inset: { own: '0.75rem', cast: '0.5rem', open: '0.5rem' },
};

interface KkStudioDStageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStudioDStageDotKind;
  turn: number | null;
  size: KkStudioDStageSize;
}

export const KkStudioDStageDot: FC<KkStudioDStageDotProps> = ({
  x,
  y,
  number,
  kind,
  turn,
  size,
}) => {
  const full = size === 'full';
  const extent = dotExtents[size][kind];
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
  };
  const notch =
    turn === null || !full ? null : (
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
  const label = full ? (
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
  ) : null;

  return (
    <Box
      data-kk-studio-d-dot={kind}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: extent,
        height: extent,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        willChange: 'transform',
        zIndex: kind === 'own' ? 2 : 1,
        ...dotPaints[kind](theme),
      })}
    >
      {notch}
      {label}
    </Box>
  );
};
