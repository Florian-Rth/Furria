import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export type KkHallDotKind = 'present' | 'absent' | 'empty';
export type KkHallDotNameSide = 'below' | 'above' | 'none';

const PERCENT = 100;
const GLIDE = 'transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const DOT = 'clamp(1rem, 5.2cqw, 1.75rem)';
const SMALL_FIELD = '@container (max-width: 12rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const discPaints: Record<KkHallDotKind, (theme: Theme, moving: boolean) => CSSObject> = {
  present: (theme, moving) => ({
    backgroundColor: moving ? palette(theme).primary.main : palette(theme).text.primary,
    color: moving ? palette(theme).primary.contrastText : palette(theme).background.default,
    transition: 'background-color 160ms ease-out, color 160ms ease-out',
  }),
  absent: (theme) => ({
    ...goldInkOf(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).warning.main} 18%, transparent)`,
    border: `${kkTokens.line.section}px dashed ${palette(theme).warning.main}`,
  }),
  empty: (theme) => ({
    color: palette(theme).text.disabled,
    border: `${kkTokens.line.hair}px dashed ${palette(theme).divider}`,
  }),
};

interface KkHallDotProps {
  x: number;
  y: number;
  number: number;
  name: string | null;
  kind: KkHallDotKind;
  moving: boolean;
  nameSide: KkHallDotNameSide;
  gliding: boolean;
}

export const KkHallDot: FC<KkHallDotProps> = ({
  x,
  y,
  number,
  name,
  kind,
  moving,
  nameSide,
  gliding,
}) => {
  const lift = nameSide === 'above' ? `100% - ${DOT} / 2` : `${DOT} / 2`;
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - (${lift})), 0)`,
  };
  const nameTag =
    name === null || nameSide === 'none' ? null : (
      <Typography
        component="span"
        variant="caption"
        data-kk-hall-dot-name
        noWrap
        sx={(theme) => ({
          maxWidth: 'min(4rem, 13cqw)',
          px: 0.5,
          lineHeight: 1.2,
          fontWeight: 800,
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: `color-mix(in srgb, ${palette(theme).background.default} 70%, transparent)`,
          color: kind === 'absent' ? palette(theme).warning.main : palette(theme).text.primary,
          textDecoration: kind === 'absent' ? 'line-through' : 'none',
        })}
      >
        {name}
      </Typography>
    );

  return (
    <Stack
      data-kk-hall-dot={kind}
      style={place}
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        flexDirection: nameSide === 'above' ? 'column-reverse' : 'column',
        alignItems: 'center',
        gap: 0.25,
        willChange: 'transform',
        transition: gliding ? GLIDE : 'none',
        zIndex: kind === 'absent' ? 2 : 1,
        [SMALL_FIELD]: { '& [data-kk-hall-dot-name]': { display: 'none' } },
      }}
    >
      <Box
        sx={(theme) => ({
          width: DOT,
          height: DOT,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          boxSizing: 'border-box',
          ...discPaints[kind](theme, moving),
        })}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 800,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: 'inherit',
          }}
        >
          {number}
        </Typography>
      </Box>
      {nameTag}
    </Stack>
  );
};
