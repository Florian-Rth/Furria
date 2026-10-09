import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { redInk } from './internal/red-ink';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme, schemeInk } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkFilmEdgeTone = 'ink' | 'red' | 'gold' | 'muted';
type KkFilmEdgeSize = 'title' | 'line';
type KkFilmEdgeLevel = 'h2' | 'h3' | 'p';

const goldInk: KkScheme = schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk);

const tonePaint: Record<KkFilmEdgeTone, (theme: Theme) => CSSObject> = {
  ink: () => ({ color: 'text.primary' }),
  red: (theme) => redInk(theme),
  gold: (theme) => applyScheme(theme, goldInk),
  muted: () => ({ color: 'text.secondary' }),
};

const leadTypography: Record<KkFilmEdgeSize, 'h4' | 'overline'> = {
  title: 'h4',
  line: 'overline',
};

const { edgeSprocket, edgeSprocketGap } = kkTokens.gallery;

interface KkFilmEdgeProps {
  lead: ReactNode;
  meta?: ReactNode;
  trail?: ReactNode;
  tone?: KkFilmEdgeTone;
  size?: KkFilmEdgeSize;
  level?: KkFilmEdgeLevel;
  sprockets?: boolean;
  sx?: KkSx;
}

export const KkFilmEdge: FC<KkFilmEdgeProps> = ({
  lead,
  meta,
  trail,
  tone = 'ink',
  size = 'line',
  level = 'p',
  sprockets = false,
  sx,
}) => (
  <Stack
    direction="row"
    data-kk-film-edge
    sx={[
      {
        alignItems: 'baseline',
        columnGap: 1,
        minWidth: 0,
        pt: sprockets ? 0.75 : 0,
        backgroundImage: sprockets
          ? `radial-gradient(circle, currentColor ${edgeSprocket / 2}px, transparent ${edgeSprocket / 2 + 0.5}px)`
          : 'none',
        backgroundSize: `${edgeSprocketGap}px ${edgeSprocket + 1}px`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left top',
        color: 'text.disabled',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      component={level}
      sx={(theme) => ({
        ...theme.typography[leadTypography[size]],
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        letterSpacing: kkTokens.type.tracking.display,
        textTransform: 'uppercase',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
        maxWidth: '100%',
        flexShrink: 0,
        ...tonePaint[tone](theme),
      })}
    >
      {lead}
    </Typography>
    {meta === undefined ? null : (
      <Typography
        component="span"
        sx={(theme) => ({
          ...theme.typography.caption,
          fontWeight: 700,
          letterSpacing: kkTokens.type.tracking.tight,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          flexShrink: 1,
        })}
      >
        {meta}
      </Typography>
    )}
    {trail === undefined ? null : (
      <Typography
        component="span"
        sx={(theme) => ({
          ...theme.typography.caption,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: kkTokens.type.tracking.label,
          color: 'text.disabled',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          maxWidth: '100%',
          ml: 'auto',
          flexShrink: 0,
        })}
      >
        {trail}
      </Typography>
    )}
  </Stack>
);
