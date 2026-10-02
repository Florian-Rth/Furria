import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

export type FlapTileFit = 'bleed' | 'line';

interface TileEdges {
  top: number;
  bottom: number;
}

const TILE_EDGES: Record<FlapTileFit, TileEdges> = {
  bleed: { top: -0.375, bottom: -0.375 },
  line: { top: -0.375, bottom: 0.125 },
};

export const flapHingeShiftOf = (theme: Theme, fit: FlapTileFit): string =>
  `calc((${theme.spacing(TILE_EDGES[fit].bottom)} - ${theme.spacing(TILE_EDGES[fit].top)}) / 2)`;

export const flapTileBoundsOf =
  (fit: FlapTileFit) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    top: theme.spacing(TILE_EDGES[fit].top),
    bottom: theme.spacing(TILE_EDGES[fit].bottom),
    left: 0,
    right: kkTokens.line.hair / 2,
    borderRadius: `${kkTokens.radius.bar}px`,
  });
