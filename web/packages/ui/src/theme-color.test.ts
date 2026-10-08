import { describe, expect, it } from 'vitest';
import { resolveKkColorScheme } from './theme-color';

describe('resolveKkColorScheme', () => {
  it.each([
    ['light', 'dark', 'light'],
    ['dark', 'light', 'dark'],
    ['system', 'dark', 'dark'],
    [undefined, 'dark', 'dark'],
    ['system', undefined, 'light'],
  ] as const)('resolves mode %s with system scheme %s to %s', (mode, systemMode, expected) => {
    expect(resolveKkColorScheme(mode, systemMode)).toBe(expected);
  });
});
