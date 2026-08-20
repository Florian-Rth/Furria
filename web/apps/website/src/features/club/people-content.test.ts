import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { resolvePersonTint } from './people-content';

describe('resolvePersonTint', () => {
  const theme = createTheme();

  it('cycles red, gold then ink by position and wraps to any number of portraits', () => {
    expect(resolvePersonTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolvePersonTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolvePersonTint(theme, 2)).toBe(theme.palette.text.primary);
    expect(resolvePersonTint(theme, 3)).toBe(resolvePersonTint(theme, 0));
  });
});
