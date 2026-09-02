import { kkTheme } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import { resolveEventTypeTint } from './event-tint';

const palette = (kkTheme.vars ?? kkTheme).palette;

describe('resolveEventTypeTint', () => {
  it('tints Prunksitzungen in the club red', () => {
    expect(resolveEventTypeTint(kkTheme, 'Prunksitzung')).toBe(palette.primary.main);
  });

  it('gives every known event type its own tint', () => {
    const knownTypes = ['Prunksitzung', 'Weiberfasching', 'Jugendfasching', 'Kinderfasching'];
    const tints = knownTypes.map((eventType) => resolveEventTypeTint(kkTheme, eventType));

    expect(new Set(tints).size).toBe(knownTypes.length);
  });

  it('falls back to the ink tint for unmapped types', () => {
    expect(resolveEventTypeTint(kkTheme, 'Rentnerfasching')).toBe(palette.text.primary);
    expect(resolveEventTypeTint(kkTheme, 'Ordensfest')).toBe(palette.text.primary);
  });
});
