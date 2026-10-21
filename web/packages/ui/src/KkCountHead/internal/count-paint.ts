import type { CSSObject, Theme } from '@mui/material/styles';
import { applyScheme, schemeInk } from '../../internal/scheme-paint';
import { TABULAR } from '../../KkStartTile/internal/tile-paint';
import { kkTokens } from '../../tokens';

export type CountInk = 'onDeep' | 'onGold' | 'mark';

const { light, dark } = kkTokens.color;

const FACE: CSSObject = {
  position: 'relative',
  display: 'block',
  textAlign: 'center',
  whiteSpace: 'pre',
  typography: { xs: 'poster', desktop: 'display' },
  lineHeight: 1,
  letterSpacing: 0,
  ...TABULAR,
};

const inks: Record<CountInk, (theme: Theme) => CSSObject> = {
  onDeep: (theme) => ({ ...applyScheme(theme, schemeInk(light.panel2, dark.ink)), px: 0.5 }),
  onGold: (theme) => ({ ...applyScheme(theme, schemeInk(light.ink, light.ink)), px: 0.5 }),
  mark: () => ({ color: 'text.primary', px: 0.125 }),
};

export const countFaceOf =
  (ink: CountInk) =>
  (theme: Theme): CSSObject => ({ ...FACE, ...inks[ink](theme) });
