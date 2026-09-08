import { describe, expect, it } from 'vitest';
import { resolveSheetSnap } from './sheet-snap';

describe('resolveSheetSnap', () => {
  it.each([
    { offsetY: 0, velocityY: 900, travel: 400, expected: 'closed' },
    { offsetY: 380, velocityY: -900, travel: 400, expected: 'open' },
    { offsetY: 100, velocityY: 0, travel: 400, expected: 'open' },
    { offsetY: 300, velocityY: 0, travel: 400, expected: 'closed' },
    { offsetY: 200, velocityY: 0, travel: 400, expected: 'open' },
    { offsetY: 0, velocityY: 0, travel: 0, expected: 'open' },
  ])(
    'snaps to $expected at $offsetY with velocity $velocityY',
    ({ offsetY, velocityY, travel, expected }) => {
      expect(resolveSheetSnap(offsetY, velocityY, travel)).toBe(expected);
    },
  );
});
