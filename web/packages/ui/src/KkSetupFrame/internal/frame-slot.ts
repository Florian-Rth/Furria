import type { CSSObject, Theme } from '@mui/material/styles';
import { safeAreaInset } from '../../internal/safe-area';
import { kkTokens } from '../../tokens';
import { SETUP_WIDE } from './setup-wide';

export type KkSetupFrameSlotName = 'head' | 'picture' | 'timeline' | 'transport' | 'task' | 'foot';

const { inset, zoneGap, playerGap } = kkTokens.setupFrame;
const ICON_GLYPH = '1.5rem';

const glyphEdgeOf = (theme: Theme): string =>
  `calc(${theme.spacing(inset)} - (${kkTokens.tapTarget} - ${ICON_GLYPH}) / 2)`;

const slotPaddingOf = (theme: Theme, slot: KkSetupFrameSlotName): CSSObject => {
  const edge = theme.spacing(inset);

  switch (slot) {
    case 'head':
      return { px: glyphEdgeOf(theme), alignContent: 'center' };
    case 'picture':
    case 'timeline':
      return { px: edge, [SETUP_WIDE]: { pl: edge, pr: 0 } };
    case 'transport':
      return {
        px: edge,
        pb: theme.spacing(playerGap - zoneGap),
        alignContent: 'center',
        [SETUP_WIDE]: { pl: edge, pr: 0, pb: 0 },
      };
    case 'task':
      return {
        px: edge,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        [SETUP_WIDE]: { pl: 0, pr: edge },
      };
    case 'foot':
      return {
        px: edge,
        pb: safeAreaInset('bottom'),
        alignContent: 'center',
        [SETUP_WIDE]: { pl: 0, pr: edge },
      };
  }
};

export const frameSlotOf =
  (slot: KkSetupFrameSlotName) =>
  (theme: Theme): CSSObject => ({
    gridArea: slot,
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'minmax(0, 1fr)',
    gridTemplateAreas: `"${slot}"`,
    ...slotPaddingOf(theme, slot),
  });
