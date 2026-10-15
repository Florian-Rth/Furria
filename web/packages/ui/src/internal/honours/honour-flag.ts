import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

export type FlagTone = 'coin' | 'sash';

export const FLAG_SELECTOR = '[data-kk-honour-flag]';

const FLAG_MOTION = 'transform 220ms cubic-bezier(0.3, 1.4, 0.5, 1), opacity 120ms ease-out';

const pill = `${kkTokens.radius.pill}px`;

const restingFlag: Record<FlagTone, CSSObject> = {
  coin: {
    left: '85%',
    top: '50%',
    transform: 'translateY(-50%) scaleX(0)',
    transformOrigin: 'left center',
    borderRadius: `0 ${pill} ${pill} 0`,
    zIndex: -1,
  },
  sash: {
    left: '50%',
    top: '100%',
    transform: 'translate(-50%, 0.5rem) scaleY(0)',
    transformOrigin: 'top center',
    borderRadius: pill,
    zIndex: 3,
  },
};

const shownFlag: Record<FlagTone, CSSObject> = {
  coin: { transform: 'translateY(-50%) scaleX(1)', opacity: 1 },
  sash: { transform: 'translate(-50%, 0.5rem) scaleY(1)', opacity: 1 },
};

export const flagPlacementOf = (tone: FlagTone): CSSObject => ({
  position: 'absolute',
  opacity: 0,
  transition: FLAG_MOTION,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  ...restingFlag[tone],
});

export const flagRevealOf = (tone: FlagTone): CSSObject => ({
  [`&:hover > ${FLAG_SELECTOR}, &:focus-visible > ${FLAG_SELECTOR}, &[aria-expanded="true"] > ${FLAG_SELECTOR}`]:
    shownFlag[tone],
});
