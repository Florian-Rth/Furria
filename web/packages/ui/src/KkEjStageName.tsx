import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

export type KkEjStageNameSize = 'large' | 'small';

const PERCENT = 100;
const NAME_LAYER = 5;
const CRAMPED_STAGE = '@container (max-width: 10rem) or (max-height: 6.5rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const transformOf = (x: number, y: number, dx: number, dy: number): string =>
  `translate3d(calc(${x * PERCENT}cqw + ${dx}px - 50%), calc(${y * PERCENT}cqh + ${dy}px - 50%), 0)`;

interface KkEjStageNameProps {
  x: number;
  y: number;
  dx: number;
  dy: number;
  name: string;
  free: boolean;
  selected: boolean;
  size: KkEjStageNameSize;
}

export const KkEjStageName: FC<KkEjStageNameProps> = ({
  x,
  y,
  dx,
  dy,
  name,
  free,
  selected,
  size,
}) => (
  <Typography
    component="span"
    variant="body2"
    aria-hidden
    noWrap
    data-kk-ej-stage-name={free ? 'free' : 'held'}
    data-selected={selected}
    data-size={size}
    style={{ transform: transformOf(x, y, dx, dy) }}
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: NAME_LAYER,
      pointerEvents: 'none',
      maxWidth: '7.5rem',
      px: 0.75,
      fontWeight: 900,
      lineHeight: 1.35,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: palette(theme).text.primary,
      backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 88%, transparent)`,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      '&[data-kk-ej-stage-name="free"]': {
        color: palette(theme).text.secondary,
        fontStyle: 'italic',
        fontWeight: 700,
      },
      '&[data-size="small"]': {
        typography: 'caption',
        fontWeight: 900,
        lineHeight: 1.35,
        maxWidth: '4.5rem',
        px: 0.5,
      },
      [CRAMPED_STAGE]: { '&[data-selected="false"]': { display: 'none' } },
      '&[data-selected="true"]': {
        color: palette(theme).background.paper,
        backgroundColor: palette(theme).text.primary,
        boxShadow: 'none',
      },
    })}
  >
    {name}
  </Typography>
);
