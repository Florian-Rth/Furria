import type { CSSObject, Theme } from '@mui/material/styles';
import { applyScheme, schemeInk } from '../internal/scheme-paint';
import type { KkRegisterMarkState } from '../KkRegisterMark';
import { kkTokens } from '../tokens';

export interface PressPlanBar {
  key: string;
  top: string;
  bottom: string;
  shift: number;
  lift: number;
  paint: (theme: Theme) => CSSObject;
  dashed: boolean;
  slant: number;
}

const inkPaint = (): CSSObject => ({ color: 'text.primary' });
const redPaint = (): CSSObject => ({ color: 'primary.main' });
const greyPaint = (): CSSObject => ({ color: 'text.disabled' });
const goldPaint = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.gold));
const FULL: Pick<PressPlanBar, 'top' | 'bottom' | 'shift' | 'lift' | 'dashed' | 'slant'> = {
  top: '36%',
  bottom: '14%',
  shift: 0,
  lift: 0,
  dashed: false,
  slant: 0,
};

export const PRESS_PLAN_BARS: Record<KkRegisterMarkState, readonly PressPlanBar[]> = {
  aligned: [{ ...FULL, key: 'ink', paint: inkPaint }],
  shifted: [
    { ...FULL, key: 'ink', paint: inkPaint },
    { ...FULL, key: 'red', paint: redPaint, shift: 4, lift: -3 },
  ],
  struck: [
    { ...FULL, key: 'grey', paint: greyPaint, top: '40%', bottom: '18%' },
    { ...FULL, key: 'strike', paint: redPaint, top: '46%', bottom: '24%', slant: 45 },
  ],
  loose: [{ ...FULL, key: 'gold', paint: goldPaint, top: '4%', bottom: '50%', dashed: true }],
};
