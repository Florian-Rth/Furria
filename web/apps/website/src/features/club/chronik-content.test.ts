import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { resolveMilestoneTint } from './chronik-content';

describe('resolveMilestoneTint', () => {
  const theme = createTheme();

  it('tints the founding milestone red and every later one gold', () => {
    expect(resolveMilestoneTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolveMilestoneTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolveMilestoneTint(theme, 4)).toBe(theme.palette.warning.main);
  });
});
