import { describe, expect, it } from 'vitest';
import { resolveColorMode } from './color-mode';

describe('resolveColorMode', () => {
  it('returns an explicit mode as-is', () => {
    expect(resolveColorMode('light', 'dark')).toBe('light');
    expect(resolveColorMode('dark', 'light')).toBe('dark');
  });

  it('follows the system mode when mode is system', () => {
    expect(resolveColorMode('system', 'dark')).toBe('dark');
    expect(resolveColorMode('system', 'light')).toBe('light');
  });

  it('falls back to light when nothing is resolved yet', () => {
    expect(resolveColorMode(undefined, undefined)).toBe('light');
    expect(resolveColorMode('system', undefined)).toBe('light');
  });
});
