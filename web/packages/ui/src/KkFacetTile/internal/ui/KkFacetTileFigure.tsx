import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { DISPLAY_FIGURE, goldInk } from '../facet-paint';

export type KkFacetFigureTone = 'ink' | 'accent' | 'attention' | 'muted';
export type KkFacetFigureSize = 'large' | 'medium';

const VARIANTS: Record<KkFacetFigureSize, 'h1' | 'h2'> = { large: 'h1', medium: 'h2' };

const FRAME: CSSObject = {
  alignItems: 'baseline',
  flexWrap: 'wrap',
  columnGap: 0.75,
  rowGap: 0.25,
  minWidth: 0,
};

const TONES: Record<KkFacetFigureTone, (theme: Theme) => CSSObject> = {
  ink: () => ({ color: 'text.primary' }),
  accent: redInk,
  attention: goldInk,
  muted: () => ({ color: 'text.secondary' }),
};

const valuePaint =
  (tone: KkFacetFigureTone) =>
  (theme: Theme): CSSObject => ({
    ...DISPLAY_FIGURE,
    ...TONES[tone](theme),
    overflowWrap: 'anywhere',
    minWidth: 0,
  });

const ASIDE_PAINT: CSSObject = {
  fontWeight: 700,
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
  minWidth: 0,
};

interface KkFacetTileFigureProps {
  value: string;
  aside?: string;
  tone?: KkFacetFigureTone;
  size?: KkFacetFigureSize;
}

export const KkFacetTileFigure: FC<KkFacetTileFigureProps> = ({
  value,
  aside,
  tone = 'ink',
  size = 'large',
}) => {
  const asideLine =
    aside === undefined ? null : (
      <Typography component="span" variant="body2" sx={ASIDE_PAINT}>
        {aside}
      </Typography>
    );

  return (
    <Stack direction="row" component="p" data-kk-facet-figure sx={{ ...FRAME, m: 0 }}>
      <Typography component="span" variant={VARIANTS[size]} sx={valuePaint(tone)}>
        {value}
      </Typography>
      {asideLine}
    </Stack>
  );
};
