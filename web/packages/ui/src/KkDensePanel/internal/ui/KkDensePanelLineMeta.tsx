import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { FACT_YIELD } from '../dense-panel-paint';
import type { FacetPiece } from '../logic/facet-pieces';

export type KkDenseMetaTone = 'muted' | 'alert';

const FACET_ICON = {
  width: '1.25em',
  height: '1.25em',
  mr: 0.25,
  verticalAlign: '-0.3em',
} as const;

const metaTones: Record<KkDenseMetaTone, (theme: Theme) => CSSObject> = {
  muted: () => ({ ...FACT_YIELD, color: 'text.secondary' }),
  alert: (theme) => ({ ...FACT_YIELD, ...redInk(theme), fontWeight: 700 }),
};

const metaPaintOf =
  (tone: KkDenseMetaTone) =>
  (theme: Theme): CSSObject => ({
    fontWeight: 500,
    letterSpacing: kkTokens.type.tracking.tight,
    ...metaTones[tone](theme),
  });

interface KkDensePanelLineMetaProps {
  pieces: readonly FacetPiece[];
  tone: KkDenseMetaTone;
}

export const KkDensePanelLineMeta: FC<KkDensePanelLineMetaProps> = ({ pieces, tone }) => {
  const facets = pieces.map((piece) => {
    const icon =
      piece.icon === null ? null : <KkIcon name={piece.icon} size="small" sx={FACET_ICON} />;

    return (
      <Box key={piece.key} component="span">
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
      noWrap
      aria-hidden
      data-kk-dense-meta
      sx={metaPaintOf(tone)}
    >
      {facets}
    </Typography>
  );
};
