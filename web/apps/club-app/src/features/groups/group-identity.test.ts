import { describe, expect, it } from 'vitest';
import { toAnniversary } from './group-identity';

describe('toAnniversary', () => {
  it.each([
    { foundedYear: 2025, sessionYear: 2026, expected: null },
    { foundedYear: 2021, sessionYear: 2026, expected: 5 },
    { foundedYear: 2031, sessionYear: 2026, expected: null },
  ])(
    'turns the founded year $foundedYear into $expected years in $sessionYear',
    ({ foundedYear, sessionYear, expected }) => {
      expect(toAnniversary(foundedYear, sessionYear)?.years ?? null).toBe(expected);
    },
  );
});
