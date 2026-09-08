import { describe, expect, it } from 'vitest';
import { kkThemeColorForScheme, resolveKkColorScheme } from './theme-color';
import { kkTokens } from './tokens';

describe('resolveKkColorScheme', () => {
  it.each([
    ['light', 'dark', 'light'],
    ['dark', 'light', 'dark'],
    ['system', 'dark', 'dark'],
    ['system', 'light', 'light'],
    ['system', undefined, 'light'],
    ['dark', undefined, 'dark'],
    [undefined, 'dark', 'dark'],
    [undefined, undefined, 'light'],
  ] as const)('resolves mode %s with system scheme %s to %s', (mode, systemMode, expected) => {
    expect(resolveKkColorScheme(mode, systemMode)).toBe(expected);
  });
});

describe('kkThemeColorForScheme', () => {
  it.each([
    ['light', kkTokens.color.light.bg],
    ['dark', kkTokens.color.dark.bg],
  ] as const)('maps the %s scheme to its background token', (resolved, expected) => {
    expect(kkThemeColorForScheme(resolved)).toBe(expected);
  });
});
