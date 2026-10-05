import { describe, expect, it } from 'vitest';
import type { FlapSchedule } from './flap-schedule';
import { sameFaces, sameSchedule } from './greeting-board';

const SCHEDULE: FlapSchedule = {
  runs: [],
  tone: 'ink',
  line: { at: 620, duration: 160 },
  burstAt: null,
  duration: 960,
};

describe('sameSchedule', () => {
  it.each([
    { name: 'the same schedule', next: SCHEDULE, same: true },
    { name: 'a longer schedule', next: { ...SCHEDULE, duration: 1200 }, same: false },
    { name: 'a burst', next: { ...SCHEDULE, burstAt: 900 }, same: false },
    { name: 'a later line', next: { ...SCHEDULE, line: { at: 700, duration: 160 } }, same: false },
    { name: 'no line', next: { ...SCHEDULE, line: null }, same: false },
  ])('keeps the published schedule for $name: $same', ({ next, same }) => {
    expect(sameSchedule(SCHEDULE, next)).toBe(same);
  });

  it('takes the first schedule', () => {
    expect(sameSchedule(null, SCHEDULE)).toBe(false);
  });
});

describe('sameFaces', () => {
  it.each([
    { left: ['9', ':', '5', '9'], right: ['9', ':', '5', '9'], same: true },
    { left: ['9', ':', '5', '9'], right: ['9', ':', '5', '8'], same: false },
    { left: ['1', '0', ':', '0', '0'], right: ['9', ':', '5', '9'], same: false },
  ])('compares $left with $right: $same', ({ left, right, same }) => {
    expect(sameFaces(left, right)).toBe(same);
  });
});
