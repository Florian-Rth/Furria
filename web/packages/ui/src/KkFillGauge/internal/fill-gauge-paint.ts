import type { CSSObject, Theme } from '@mui/material/styles';
import { inkWash } from '../../internal/ink-wash';
import { kkTokens } from '../../tokens';
import type { KkFillCap } from './fill-gauge';

const PART_SHADES = ['100%', '62%', '38%'] as const;
const OTHER_SHADE = '16%';
const HATCH = 6;

export type KkFillSwatch = { kind: 'part'; order: number } | { kind: 'other' } | { kind: 'free' };

const shadeOf = (order: number): string =>
  PART_SHADES[Math.min(order, PART_SHADES.length - 1)] ?? OTHER_SHADE;

export const swatchPaint =
  (swatch: KkFillSwatch) =>
  (theme: Theme): CSSObject => {
    switch (swatch.kind) {
      case 'part':
        return { backgroundColor: inkWash(theme, shadeOf(swatch.order)) };
      case 'other':
        return { backgroundColor: inkWash(theme, OTHER_SHADE) };
      case 'free':
        return {
          backgroundImage: `repeating-linear-gradient(135deg, ${inkWash(theme, '30%')} 0 1px, transparent 1px ${HATCH}px)`,
        };
    }
  };

const { light, dark } = kkTokens.color;

export const capPaint =
  (cap: KkFillCap) =>
  (theme: Theme): CSSObject => {
    switch (cap) {
      case 'critical':
        return {
          backgroundColor: light.red,
          ...theme.applyStyles('dark', { backgroundColor: dark.red }),
        };
      case 'low':
        return {
          backgroundColor: light.gold,
          ...theme.applyStyles('dark', { backgroundColor: dark.gold }),
        };
      case 'calm':
        return { backgroundColor: inkWash(theme, '42%') };
    }
  };
