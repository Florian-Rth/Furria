import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioGStageDotKind = 'cast' | 'open';

const PERCENT = 100;
const GLIDE = 'transform 360ms cubic-bezier(0.22, 0.61, 0.36, 1)';
const SIZE = { xs: '1.5rem', desktop: '1.875rem', narrow: '0.5rem' };
const NARROW_FIELD = '@container (max-width: 12rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const paintOf = (kind: KkStudioGStageDotKind, selected: boolean, theme: Theme): CSSObject => {
  if (selected) {
    return {
      backgroundColor: palette(theme).text.primary,
      color: palette(theme).background.paper,
      boxShadow: `0 0 0 ${kkTokens.line.section}px ${palette(theme).background.paper}, 0 0 0 ${kkTokens.line.section * 2}px ${palette(theme).text.primary}, ${kkTokens.shadow.floating}`,
      zIndex: 2,
    };
  }
  if (kind === 'open') {
    return {
      ...goldInkOf(theme),
      backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 55%, transparent)`,
      border: `${kkTokens.line.hair}px dashed ${palette(theme).warning.main}`,
      zIndex: 1,
    };
  }

  return {
    backgroundColor: palette(theme).background.paper,
    color: palette(theme).text.primary,
    boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}, ${kkTokens.shadow.rest}`,
    zIndex: 1,
  };
};

interface KkStudioGStageDotProps {
  spotId: number;
  x: number;
  y: number;
  number: number;
  label: string;
  kind: KkStudioGStageDotKind;
  selected: boolean;
  gliding: boolean;
}

export const KkStudioGStageDot: FC<KkStudioGStageDotProps> = ({
  spotId,
  x,
  y,
  number,
  label,
  kind,
  selected,
  gliding,
}) => {
  const place = {
    transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh - 50%), 0)`,
  };

  return (
    <Box
      title={label}
      data-kk-studio-g-dot
      data-spot-id={spotId}
      data-selected={selected}
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: SIZE.xs,
        height: SIZE.xs,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        cursor: 'grab',
        willChange: 'transform',
        transition: gliding ? GLIDE : 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-0.5rem',
          borderRadius: '50%',
        },
        [theme.breakpoints.up('desktop')]: { width: SIZE.desktop, height: SIZE.desktop },
        [NARROW_FIELD]: {
          width: SIZE.narrow,
          height: SIZE.narrow,
          '& [data-kk-studio-g-dot-number]': { display: 'none' },
        },
        ...paintOf(kind, selected, theme),
      })}
    >
      <Typography
        component="span"
        data-kk-studio-g-dot-number
        variant="caption"
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
