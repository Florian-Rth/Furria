import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { DENSE_GAP, DENSE_LINE_STACKED } from '../dense-panel-paint';
import type { FacetPiece } from '../logic/facet-pieces';

export type KkDenseMetaTone = 'muted' | 'alert';

const FACET_ICON = {
  width: '1.25em',
  height: '1.25em',
  mr: 0.25,
  verticalAlign: '-0.3em',
} as const;

const WHOLE_FACET: CSSObject = { flex: 'none', whiteSpace: 'pre' };

const YIELDING_FACET: CSSObject = {
  flex: '0 1 auto',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const STRUT: CSSObject = { flex: 'none', width: 0, height: '1lh' };

const metaTones: Record<KkDenseMetaTone, (theme: Theme) => CSSObject> = {
  muted: () => ({ flex: '1 1 0', color: 'text.secondary' }),
  alert: (theme) => ({ flex: '0 1 auto', ...redInk(theme), fontWeight: 700 }),
};

const metaPaintOf =
  (tone: KkDenseMetaTone) =>
  (theme: Theme): CSSObject => ({
    display: 'flex',
    flexWrap: tone === 'muted' ? 'wrap' : 'nowrap',
    alignItems: 'flex-start',
    minWidth: 0,
    ml: DENSE_GAP,
    lineHeight: '1lh',
    height: '1lh',
    overflow: 'clip',
    fontWeight: 500,
    letterSpacing: kkTokens.type.tracking.tight,
    ...metaTones[tone](theme),
    [DENSE_LINE_STACKED]: {
      flexBasis: '100%',
      height: 'auto',
      ml: 0,
      '& [data-kk-dense-facet]': { flexShrink: 1, whiteSpace: 'normal' },
    },
  });

interface KkDensePanelLineMetaProps {
  pieces: readonly FacetPiece[];
  tone: KkDenseMetaTone;
}

export const KkDensePanelLineMeta: FC<KkDensePanelLineMetaProps> = ({ pieces, tone }) => {
  const facetPaint = tone === 'muted' ? WHOLE_FACET : YIELDING_FACET;
  const strut = tone === 'muted' ? <Box component="span" sx={STRUT} /> : null;
  const facets = pieces.map((piece) => {
    const icon =
      piece.icon === null ? null : <KkIcon name={piece.icon} size="small" sx={FACET_ICON} />;

    return (
      <Box key={piece.key} component="span" data-kk-dense-facet sx={facetPaint}>
        {piece.lead}
        {icon}
        {piece.text}
      </Box>
    );
  });

  return (
    <Typography
      component="span"
      variant="caption"
      aria-hidden
      data-kk-dense-meta
      sx={metaPaintOf(tone)}
    >
      {strut}
      {facets}
    </Typography>
  );
};
