import { describe, expect, it } from 'vitest';
import type { GreetingBoard } from './greeting-board';
import { sameBoard, sameFaces } from './greeting-board';

const BOARD: GreetingBoard = {
  schedule: {
    runs: [],
    tone: 'ink',
    line: { at: 620, duration: 160 },
    burstAt: null,
    duration: 960,
  },
  faces: ['Tag', '7', '0'],
};

describe('sameBoard', () => {
  it.each([
    { name: 'the same board', next: BOARD, same: true },
    { name: 'new faces', next: { ...BOARD, faces: ['Tag', '7', '1'] }, same: false },
    {
      name: 'a longer board',
      next: { ...BOARD, schedule: { ...BOARD.schedule, duration: 1200 } },
      same: false,
    },
    {
      name: 'a burst',
      next: { ...BOARD, schedule: { ...BOARD.schedule, burstAt: 900 } },
      same: false,
    },
    {
      name: 'a later line',
      next: { ...BOARD, schedule: { ...BOARD.schedule, line: { at: 700, duration: 160 } } },
      same: false,
    },
    {
      name: 'no line',
      next: { ...BOARD, schedule: { ...BOARD.schedule, line: null } },
      same: false,
    },
  ])('keeps the published board for $name: $same', ({ next, same }) => {
    expect(sameBoard(BOARD, next)).toBe(same);
  });

  it('takes the first board', () => {
    expect(sameBoard(null, BOARD)).toBe(false);
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
