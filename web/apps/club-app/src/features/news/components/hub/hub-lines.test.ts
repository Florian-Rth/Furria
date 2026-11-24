import { describe, expect, it } from 'vitest';
import { sessionNumberOf } from './hub-lines';

describe('sessionNumberOf', () => {
  it.each([{ startYear: 2025, expected: 70 }])(
    'numbers the session starting $startYear as $expected',
    ({ startYear, expected }) => {
      expect(sessionNumberOf(startYear)).toBe(expected);
    },
  );
});
