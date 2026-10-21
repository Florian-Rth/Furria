import type { CSSObject, Theme } from '@mui/material/styles';
import { POSTER_TINT } from '../../internal/print-in/pane-paint';
import { applyScheme } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';
import type { PosterTint } from './logic/poster-composition';

const { light, dark } = kkTokens.color;
const TINT_SHARE = { light: 2, dark: 8 } as const;

interface SchemePair {
  light: string;
  dark: string;
}

const SEASON_INK: Record<PosterTint, SchemePair> = {
  red: { light: light.red, dark: dark.red },
  gold: { light: light.gold, dark: dark.gold },
  ash: { light: light.sub, dark: dark.sub },
  clear: { light: light.ink, dark: dark.ink },
};

const tintOf = (tint: PosterTint, color: string, share: number): string =>
  tint === 'clear' ? 'transparent' : `color-mix(in srgb, ${color} ${share}%, transparent)`;

export const backdropPaintOf =
  (tint: PosterTint) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flex: 1,
    minWidth: 0,
    isolation: 'isolate',
    ...applyScheme(theme, {
      light: { [POSTER_TINT]: tintOf(tint, SEASON_INK[tint].light, TINT_SHARE.light) },
      dark: { [POSTER_TINT]: tintOf(tint, SEASON_INK[tint].dark, TINT_SHARE.dark) },
    }),
  });
