import { describe, expect, it } from 'vitest';
import type { ColorMode, ResolvedColorMode } from './color-mode';
import { resolveColorMode } from './color-mode';

describe('resolveColorMode', () => {
  it.each<[ColorMode | undefined, ResolvedColorMode | undefined, ResolvedColorMode]>([
    ['light', 'dark', 'light'],
    ['dark', 'light', 'dark'],
    ['system', 'dark', 'dark'],
    ['system', undefined, 'light'],
    [undefined, undefined, 'light'],
  ])('resolves mode %s under system %s to %s', (mode, systemMode, expected) => {
    expect(resolveColorMode(mode, systemMode)).toBe(expected);
  });
});
