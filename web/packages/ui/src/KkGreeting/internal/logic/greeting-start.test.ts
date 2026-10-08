import { describe, expect, it } from 'vitest';
import { greetingStartOf, leavesRest } from './greeting-start';

describe('greetingStartOf', () => {
  it.each([
    { waitedMs: 1199, hidden: false, reducedMotion: false, start: 'play' },
    { waitedMs: 1200, hidden: false, reducedMotion: false, start: 'still' },
    { waitedMs: 140, hidden: true, reducedMotion: false, start: 'still' },
    { waitedMs: 140, hidden: false, reducedMotion: true, start: 'still' },
  ] as const)(
    'starts $start after $waitedMs ms (hidden $hidden, reduced motion $reducedMotion)',
    ({ waitedMs, hidden, reducedMotion, start }) => {
      expect(greetingStartOf({ waitedMs, hidden, reducedMotion })).toBe(start);
    },
  );
});

describe('leavesRest', () => {
  it.each([
    { previous: 0, offset: 12, leaves: true },
    { previous: 0, offset: 0, leaves: false },
    { previous: 300, offset: 281, leaves: false },
  ])(
    'treats a scroll from $previous to $offset as leaving rest: $leaves',
    ({ previous, offset, leaves }) => {
      expect(leavesRest(previous, offset)).toBe(leaves);
    },
  );
});
