import type { CSSObject, Theme } from '@mui/material/styles';
import { safeAreaInset } from '../../internal/safe-area';
import { kkTokens } from '../../tokens';

export const AWAKE_ATTRIBUTE = 'data-kk-studio-d-awake';

const ASLEEP = `[${AWAKE_ATTRIBUTE}="false"] &`;
const FADE_SECONDS = 0.45;
const EASE = 'cubic-bezier(.2,.8,.2,1)';

export const PLAYER_LAYER = { frame: 0, scrim: 1, surface: 2, overlay: 3, sheet: 4 } as const;

export const PLAYER_EDGE = '0.75rem';
export const PLAYER_EDGE_WIDE = '1.5rem';

export const edgeOf = (side: 'top' | 'right' | 'bottom' | 'left', wide: boolean): string =>
  `calc(${safeAreaInset(side)} + ${wide ? PLAYER_EDGE_WIDE : PLAYER_EDGE})`;

export const crossFade = (shown: boolean): CSSObject => ({
  opacity: shown ? 1 : 0,
  transition: `opacity ${FADE_SECONDS}s ${EASE}`,
});

export const fadesWhenAsleep: CSSObject = {
  transition: `opacity ${FADE_SECONDS}s ${EASE}`,
  [ASLEEP]: { opacity: 0, pointerEvents: 'none' },
};

export const glassOf = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    backgroundColor: `color-mix(in srgb, ${palette.background.default} 46%, transparent)`,
    backdropFilter: `blur(${kkTokens.glass.blur}) saturate(1.4)`,
    WebkitBackdropFilter: `blur(${kkTokens.glass.blur}) saturate(1.4)`,
    border: `1px solid color-mix(in srgb, ${palette.text.primary} 14%, transparent)`,
    color: palette.text.primary,
  };
};

export const onFootage: CSSObject = {
  textShadow: kkTokens.overlay.textShadow,
};
