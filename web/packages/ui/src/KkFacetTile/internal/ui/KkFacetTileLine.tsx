import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { goldInk, greenInk } from '../facet-paint';

export type KkFacetLineTone = 'strong' | 'secondary' | 'attention' | 'positive';

const TONES: Record<KkFacetLineTone, (theme: Theme) => CSSObject> = {
  strong: () => ({ color: 'text.primary', fontWeight: 700 }),
  secondary: () => ({ color: 'text.secondary', fontWeight: 600 }),
  attention: (theme) => ({ ...goldInk(theme), fontWeight: 800 }),
  positive: (theme) => ({ ...greenInk(theme), fontWeight: 800 }),
};

const linePaint =
  (tone: KkFacetLineTone, lines: number) =>
  (theme: Theme): CSSObject => ({
    ...lineClamp(lines),
    ...TONES[tone](theme),
    m: 0,
    lineHeight: 1.35,
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  });

interface KkFacetTileLineProps extends PropsWithChildren {
  tone?: KkFacetLineTone;
  lines?: number;
}

export const KkFacetTileLine: FC<KkFacetTileLineProps> = ({
  tone = 'secondary',
  lines = 1,
  children,
}) => (
  <Typography component="p" variant="caption" data-kk-facet-line sx={linePaint(tone, lines)}>
    {children}
  </Typography>
);
