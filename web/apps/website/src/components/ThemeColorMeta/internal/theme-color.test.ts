import { kkTokens } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import { themeColorForScheme } from './theme-color';

describe('themeColorForScheme', () => {
  it('uses the dark background token in dark mode', () => {
    expect(themeColorForScheme('dark')).toBe(kkTokens.color.dark.bg);
  });

  it('uses the light background token in light mode', () => {
    expect(themeColorForScheme('light')).toBe(kkTokens.color.light.bg);
  });
});
