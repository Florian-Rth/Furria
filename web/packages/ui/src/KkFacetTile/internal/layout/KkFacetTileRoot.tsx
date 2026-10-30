import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import {
  assembleOf,
  attentionEdge,
  controlFocus,
  currentMark,
  FACET_CONTROL,
  FACET_DOOR,
  FACET_RADIUS,
  facetSurface,
} from '../facet-paint';

export type KkFacetTileDensity = 'regular' | 'compact';

const INSETS: Record<KkFacetTileDensity, number> = { regular: 1.5, compact: 1.25 };
const GAPS: Record<KkFacetTileDensity, number> = { regular: 1, compact: 0.5 };

const framePaint =
  (order: number, density: KkFacetTileDensity) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    height: '100%',
    minWidth: 0,
    gap: GAPS[density],
    p: INSETS[density],
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: FACET_RADIUS,
    ...facetSurface(theme),
    ...assembleOf(order),
    transition: 'border-color 160ms ease-out, transform 120ms ease-out',
    [`& ${FACET_CONTROL}`]: { position: 'relative', zIndex: 1 },
    [`& ${FACET_CONTROL}, & ${FACET_DOOR}`]: controlFocus(theme),
    [`&:has(${FACET_DOOR}:active)`]: { transform: 'scale(0.985)' },
    '@media (hover: hover)': {
      [`&:has(${FACET_DOOR}:hover)`]: {
        borderColor: (theme.vars ?? theme).palette.text.secondary,
      },
    },
  });

const QUIET_EDGE: CSSObject = { borderStyle: 'dashed', backgroundColor: 'transparent' };

interface KkFacetTileRootProps extends PropsWithChildren {
  label: string;
  order: number;
  density?: KkFacetTileDensity;
  attention?: boolean;
  current?: boolean;
  quiet?: boolean;
  sx?: KkSx;
}

export const KkFacetTileRoot: FC<KkFacetTileRootProps> = ({
  label,
  order,
  density = 'regular',
  attention = false,
  current = false,
  quiet = false,
  sx,
  children,
}) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-facet-tile
    sx={[
      framePaint(order, density),
      attention && attentionEdge,
      current && currentMark,
      quiet && QUIET_EDGE,
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
