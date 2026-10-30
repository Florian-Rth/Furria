import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';
import { placeAt, UNZOOMED_SCALE, unzoomed, WAY_CAMERA_GLIDE } from '../logic/way-zoom';

export type KkWayStageDotKind = 'own' | 'cast' | 'open';

const GLIDE = 'transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const HALO_SECONDS = 2.4;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const sizes: Record<KkWayStageDotKind, { xs: string; desktop: string }> = {
  own: { xs: '2.5rem', desktop: '3.25rem' },
  cast: { xs: '1.125rem', desktop: '1.5rem' },
  open: { xs: '1.125rem', desktop: '1.5rem' },
};

const dotPaints: Record<KkWayStageDotKind, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
    boxShadow: `0 0 0 ${kkTokens.line.page}px ${palette(theme).background.paper}, ${kkTokens.shadow.floating}`,
    zIndex: 2,
  }),
  cast: (theme) => ({
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 72%, transparent)`,
    color: palette(theme).text.secondary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    zIndex: 1,
  }),
  open: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 30%, transparent)`,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
    zIndex: 1,
  }),
};

interface KkWayStageDotProps {
  x: number;
  y: number;
  number: number;
  kind: KkWayStageDotKind;
  turn: number | null;
  gliding: boolean;
}

export const KkWayStageDot: FC<KkWayStageDotProps> = ({ x, y, number, kind, turn, gliding }) => {
  const own = kind === 'own';
  const transition = gliding ? `${GLIDE}, width ${WAY_CAMERA_GLIDE}` : 'none';
  const numberVariant = own ? 'subtitle1' : 'caption';
  const halo = own ? (
    <Box
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        backgroundColor: palette(theme).primary.main,
        animation: `kk-way-halo ${HALO_SECONDS}s ease-out infinite`,
        '@keyframes kk-way-halo': {
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
            transform: 'translate(-50%, 0.1875rem)',
            borderLeft: `${unzoomed('0.3125rem')} solid transparent`,
            borderRight: `${unzoomed('0.3125rem')} solid transparent`,
            borderTop: `${unzoomed('0.4375rem')} solid ${palette(theme).primary.main}`,
          })}
        />
      </Box>
    );

  return (
    <Box
      data-kk-way-dot={kind}
      style={placeAt(x, y)}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: unzoomed(sizes[kind].xs),
        height: unzoomed(sizes[kind].xs),
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        willChange: 'transform',
        transition,
        [theme.breakpoints.up('desktop')]: {
          width: unzoomed(sizes[kind].desktop),
          height: unzoomed(sizes[kind].desktop),
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
          scale: UNZOOMED_SCALE,
          lineHeight: 1,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
          '@container (max-width: 15rem)': { display: own ? 'inline' : 'none' },
        }}
      >
        {number}
      </Typography>
    </Box>
  );
};
