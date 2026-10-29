import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioEStageDotKind = 'own' | 'cast' | 'open';

const PERCENT = 100;
const GLIDE = 'transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const HALO_SECONDS = 2.4;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const sizes: Record<KkStudioEStageDotKind, { xs: string; desktop: string }> = {
  own: { xs: '2.25rem', desktop: '3rem' },
  cast: { xs: '1.25rem', desktop: '1.625rem' },
  open: { xs: '1.25rem', desktop: '1.625rem' },
};

const dotPaints: Record<KkStudioEStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
    boxShadow: `0 0 0 ${kkTokens.line.page}px ${palette(theme).background.paper}, ${kkTokens.shadow.floating}`,
    zIndex: 2,
  }),
  cast: (theme) => ({
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 90%, transparent)`,
    color: palette(theme).text.secondary,
    boxShadow: kkTokens.shadow.rest,
    zIndex: 1,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 35%, transparent)`,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
    zIndex: 1,
  }),
};

interface KkStudioEStageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkStudioEStageDotKind;
  turn: number | null;
  gliding: boolean;
}

export const KkStudioEStageDot: FC<KkStudioEStageDotProps> = ({
  x,
  y,
  number,
  kind,
  turn,
  gliding,
}) => {
  const own = kind === 'own';
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
  };
  const transition = gliding ? GLIDE : 'none';
  const numberVariant = own ? 'h3' : 'caption';
  const halo = own ? (
    <Box
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        backgroundColor: palette(theme).primary.main,
        animation: `kk-studio-e-halo ${HALO_SECONDS}s ease-out infinite`,
        '@keyframes kk-studio-e-halo': {
          from: { transform: 'scale(1)', opacity: 0.34 },
          to: { transform: 'scale(2.2)', opacity: 0 },
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
      })}
    />
  ) : null;
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
            transform: 'translate(-50%, 0.25rem)',
            borderLeft: '0.3125rem solid transparent',
            borderRight: '0.3125rem solid transparent',
            borderTop: `0.4375rem solid ${palette(theme).primary.main}`,
          })}
        />
      </Box>
    );

  return (
    <Box
      data-kk-studio-e-dot={kind}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: sizes[kind].xs,
        height: sizes[kind].xs,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        willChange: 'transform',
        transition,
        [theme.breakpoints.up('desktop')]: {
          width: sizes[kind].desktop,
          height: sizes[kind].desktop,
        },
        ...dotPaints[kind](theme),
      })}
    >
      {halo}
      {notch}
      <Typography
        component="span"
        variant={numberVariant}
        sx={{
          position: 'relative',
          lineHeight: 1,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {number}
      </Typography>
    </Box>
  );
};
