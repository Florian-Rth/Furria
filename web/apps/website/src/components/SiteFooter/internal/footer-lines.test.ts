import { describe, expect, it } from 'vitest';
import { buildClubLine, buildCopyrightLine } from './footer-lines';

describe('buildClubLine', () => {
  it.each([
    ['FCC e.V.', 1971, 'FCC e.V. · Großfurra feiert seit 1971. Gross - Furria!'],
    ['FCC e.V.', null, 'FCC e.V. · Gross - Furria!'],
    [null, 1971, 'Großfurra feiert seit 1971. Gross - Furria!'],
    [null, null, 'Gross - Furria!'],
  ])('composes %s founded %s', (name, foundedYear, expected) => {
    expect(buildClubLine(name, foundedYear)).toBe(expected);
  });
});

describe('buildCopyrightLine', () => {
  it.each([
    ['FCC e.V.', '© 2026 FCC e.V.'],
    [null, '© 2026'],
  ])('credits %s', (name, expected) => {
    expect(buildCopyrightLine(name, 2026)).toBe(expected);
  });
});
