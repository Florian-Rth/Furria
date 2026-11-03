import { describe, expect, it } from 'vitest';
import { stickyOffsetOf } from './sticky-name';

describe('stickyOffsetOf', () => {
  it.each([
    { panX: 100, bandLeft: 50, room: 300, expected: 0 },
    { panX: -120, bandLeft: 50, room: 300, expected: 70 },
    { panX: -900, bandLeft: 50, room: 300, expected: 300 },
    { panX: -900, bandLeft: 50, room: -20, expected: 0 },
  ])(
    'keeps the name $expected px in when the band starts at $bandLeft and the strip sits at $panX',
    ({ panX, bandLeft, room, expected }) => {
      expect(stickyOffsetOf(panX, bandLeft, room)).toBe(expected);
    },
  );
});
