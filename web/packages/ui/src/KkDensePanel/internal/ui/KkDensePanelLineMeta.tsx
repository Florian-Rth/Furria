import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { DENSE_GAP, DENSE_LINE_STACKED } from '../dense-panel-paint';
import type { FacetFit } from '../logic/facet-fit';
import type { FacetPiece } from '../logic/facet-pieces';
import { FACET_ICON_EM, FACET_ICON_GAP_EM, useFacetFit } from '../logic/use-facet-fit';

export type KkDenseMetaTone = 'muted' | 'alert';

const FACET_ICON = {
  width: `${FACET_ICON_EM}em`,
  height: `${FACET_ICON_EM}em`,
  mr: `${FACET_ICON_GAP_EM}em`,
  verticalAlign: '-0.3em',
} as const;

const WHOLE_FIT: FacetFit = { kind: 'whole' };

const WHOLE_FACET: CSSObject = { flex: 'none', whiteSpace: 'pre' };

const YIELDING_FACET: CSSObject = {
  flex: '0 1 auto',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const STRUT: CSSObject = { flex: 'none', width: 0, height: '1lh' };

const FITTED_FACETS: CSSObject = {
  '& [data-kk-dense-facet][data-fit="drop"]': { display: 'none' },
  '& [data-kk-dense-facet][data-fit="cut"] [data-kk-dense-facet-text]': { display: 'none' },
};

const metaTones: Record<KkDenseMetaTone, (theme: Theme) => CSSObject> = {
  muted: () => ({ flex: '1 1 0', color: 'text.secondary', ...FITTED_FACETS }),
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
      '& [data-kk-dense-facet], & [data-kk-dense-facet][data-fit]': {
        display: 'block',
        flexBasis: '100%',
        flexShrink: 1,
        whiteSpace: 'normal',
      },
      '& [data-kk-dense-facet][data-fit] [data-kk-dense-facet-text]': { display: 'inline' },
      '& [data-kk-dense-facet-cut], & [data-kk-dense-facet-lead]': { display: 'none' },
    },
  });

interface KkDensePanelLineMetaProps {
  pieces: readonly FacetPiece[];
  tone: KkDenseMetaTone;
}

export const KkDensePanelLineMeta: FC<KkDensePanelLineMetaProps> = ({ pieces, tone }) => {
  const fitting = tone === 'muted';
  const { metaRef, fits } = useFacetFit(pieces, fitting);
  const facetPaint = fitting ? WHOLE_FACET : YIELDING_FACET;
  const strut = fitting ? <Box component="span" sx={STRUT} /> : null;
  const facets = pieces.map((piece, index) => {
    const fit = fits?.[index] ?? WHOLE_FIT;
    const fitMark = fits === null ? undefined : fit.kind;
    const icon =
      piece.icon === null ? null : <KkIcon name={piece.icon} size="small" sx={FACET_ICON} />;
    const cut =
      fit.kind === 'cut' ? (
        <Box component="span" data-kk-dense-facet-cut>
          {fit.text}
        </Box>
      ) : null;

    return (
      <Box key={piece.key} component="span" data-kk-dense-facet data-fit={fitMark} sx={facetPaint}>
        <Box component="span" data-kk-dense-facet-lead>
          {piece.lead}
        </Box>
        {icon}
        <Box component="span" data-kk-dense-facet-text>
          {piece.text}
        </Box>
        {cut}
      </Box>
    );
  });

  return (
    <Typography
      ref={metaRef}
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
