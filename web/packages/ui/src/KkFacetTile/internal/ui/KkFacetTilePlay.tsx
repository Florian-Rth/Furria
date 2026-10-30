import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme, schemeFill, schemeInk } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { assembleEndMs, breathOnceAfter, swellOnceAfter } from '../facet-paint';

const { light, dark } = kkTokens.color;
const GLYPH = '3rem';

const BASE: CSSObject = {
  width: GLYPH,
  height: GLYPH,
  flexShrink: 0,
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
};

const livePaint =
  (order: number) =>
  (theme: Theme): CSSObject => ({
    ...BASE,
    ...applyScheme(theme, schemeFill(light.red, dark.red), schemeInk(light.onRed, dark.onRedDk)),
    ...swellOnceAfter(assembleEndMs(order)),
    '& > [data-kk-facet-ring]': {
      ...BASE,
      position: 'absolute',
      color: (theme.vars ?? theme).palette.primary.main,
      ...breathOnceAfter(assembleEndMs(order)),
    },
    position: 'relative',
  });

const restingPaint = (theme: Theme): CSSObject => ({
  ...BASE,
  borderWidth: kkTokens.line.section,
  borderStyle: 'dashed',
  borderColor: (theme.vars ?? theme).palette.divider,
  color: 'text.disabled',
});

interface KkFacetTilePlayProps {
  playable: boolean;
  order: number;
}

export const KkFacetTilePlay: FC<KkFacetTilePlayProps> = ({ playable, order }) => {
  if (!playable) {
    return (
      <Stack aria-hidden data-kk-facet-play="resting" sx={restingPaint}>
        <KkIcon name="music" size="small" />
      </Stack>
    );
  }

  return (
    <Stack aria-hidden data-kk-facet-play="live" sx={livePaint(order)}>
      <Stack component="span" data-kk-facet-ring />
      <KkIcon name="play" size="medium" />
    </Stack>
  );
};
