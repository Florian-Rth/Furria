import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { resolvePersonTint, toBoardTiles, toInitials } from './people-content';

describe('resolvePersonTint', () => {
  const theme = createTheme();

  it('cycles red, gold then ink by position and wraps to any number of portraits', () => {
    expect(resolvePersonTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolvePersonTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolvePersonTint(theme, 2)).toBe(theme.palette.text.primary);
    expect(resolvePersonTint(theme, 3)).toBe(resolvePersonTint(theme, 0));
  });
});

describe('toInitials', () => {
  it.each([
    ['Nadine', 'Wolters', 'NW'],
    ['ötzi', 'übel', 'ÖÜ'],
    [' Anna', 'Lena Berg', 'AL'],
  ])('reads %s %s as %s', (firstName, lastName, expected) => {
    expect(toInitials(firstName, lastName)).toBe(expected);
  });
});

describe('toBoardTiles', () => {
  const theme = createTheme();

  it('keeps two offices held by the same person apart', () => {
    const tiles = toBoardTiles(
      [
        { officeName: 'Präsidentin', firstName: 'Nadine', lastName: 'Wolters', portraitUrl: null },
        { officeName: 'Pressewartin', firstName: 'Nadine', lastName: 'Wolters', portraitUrl: null },
      ],
      theme,
    );

    expect(new Set(tiles.map((tile) => tile.key)).size).toBe(2);
  });

  it('leaves the portrait out when the holder has none', () => {
    const [tile] = toBoardTiles(
      [{ officeName: 'Präsident', firstName: 'Tom', lastName: 'Kasse', portraitUrl: null }],
      theme,
    );

    expect(tile?.portraitUrl).toBeUndefined();
  });
});
