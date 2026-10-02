import { describe, expect, it } from 'vitest';
import type { FlapSchedule } from './flap-schedule';
import { inkCueOf, lineCueOf } from './greeting-cues';

const BOARD: FlapSchedule = {
  runs: [
    {
      motion: 'flap',
      cell: 0,
      start: 0,
      end: 450,
      faces: [
        { kind: 'text', text: '' },
        { kind: 'text', text: 'Tag' },
      ],
      flips: [{ kind: 'final', at: 0, duration: 230 }],
    },
    { motion: 'fade', cell: 2, start: 60, end: 300 },
    {
      motion: 'tick',
      cell: 3,
      start: 0,
      end: 180,
      faces: [
        { kind: 'text', text: 'Lena.' },
        { kind: 'text', text: 'Lena.' },
      ],
      flips: [{ kind: 'tick', at: 0, duration: 180 }],
    },
  ],
  tone: 'ink',
  line: { at: 620, duration: 160 },
  burstAt: null,
  duration: 960,
};

describe('inkCueOf', () => {
  it.each([
    { cell: 0, phase: 'waiting', opacity: 0, delay: 0 },
    { cell: 0, phase: 'playing', opacity: 0, delay: 0 },
    { cell: 0, phase: 'settled', opacity: 1, delay: 0 },
    { cell: 2, phase: 'waiting', opacity: 0, delay: 0 },
    { cell: 2, phase: 'playing', opacity: 1, delay: 0.06 },
    { cell: 2, phase: 'settled', opacity: 1, delay: 0 },
    { cell: 1, phase: 'waiting', opacity: 1, delay: 0 },
    { cell: 3, phase: 'waiting', opacity: 1, delay: 0 },
    { cell: 3, phase: 'playing', opacity: 0, delay: 0 },
  ] as const)(
    'shows cell $cell at opacity $opacity after $delay s while $phase',
    ({ cell, phase, opacity, delay }) => {
      const cue = inkCueOf(cell, BOARD, phase);

      expect([cue.opacity, cue.delay]).toEqual([opacity, delay]);
    },
  );

  it.each([
    { cell: 0, phase: 'playing', moving: true },
    { cell: 2, phase: 'playing', moving: true },
    { cell: 2, phase: 'settled', moving: false },
    { cell: 1, phase: 'playing', moving: false },
  ] as const)('marks cell $cell as moving $moving while $phase', ({ cell, phase, moving }) => {
    expect(inkCueOf(cell, BOARD, phase).moving).toBe(moving);
  });

  it('fades a night word in over its own run', () => {
    expect(inkCueOf(2, BOARD, 'playing').duration).toBeCloseTo(0.24);
  });
});

describe('lineCueOf', () => {
  it.each([
    { play: 'full', phase: 'waiting', opacity: 0, y: 4, delay: 0 },
    { play: 'full', phase: 'playing', opacity: 1, y: 0, delay: 0.62 },
    { play: 'live', phase: 'playing', opacity: 1, y: 0, delay: 0.62 },
    { play: 'full', phase: 'settled', opacity: 1, y: 0, delay: 0 },
    { play: 'daily', phase: 'waiting', opacity: 1, y: 0, delay: 0 },
    { play: 'nod', phase: 'playing', opacity: 1, y: 0, delay: 0 },
    { play: 'still', phase: 'settled', opacity: 1, y: 0, delay: 0 },
  ] as const)(
    'holds the line of a $play board at $opacity, $y px while $phase',
    ({ play, phase, opacity, y, delay }) => {
      const cue = lineCueOf(play, BOARD.line, phase);

      expect([cue.opacity, cue.y, cue.delay]).toEqual([opacity, y, delay]);
    },
  );

  it.each([
    { phase: 'waiting', moving: true },
    { phase: 'playing', moving: true },
    { phase: 'settled', moving: false },
  ] as const)('marks the line as moving $moving while $phase', ({ phase, moving }) => {
    expect(lineCueOf('full', BOARD.line, phase).moving).toBe(moving);
  });

  it('shows the line at once when the board cues none', () => {
    expect(lineCueOf('full', null, 'playing').opacity).toBe(1);
  });
});
