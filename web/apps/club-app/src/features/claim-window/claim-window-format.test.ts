import { describe, expect, it } from 'vitest';
import { formatWindowMoment } from './claim-window-format';

describe('formatWindowMoment', () => {
  it.each([
    ['2026-11-14T22:59:00Z', 'Sa., 14.11., 23:59 Uhr'],
    ['2026-11-14T18:30:00+01:00', 'Sa., 14.11., 18:30 Uhr'],
  ])('formats %s in club time as %s', (at, expected) => {
    expect(formatWindowMoment(at)).toBe(expected);
  });
});
