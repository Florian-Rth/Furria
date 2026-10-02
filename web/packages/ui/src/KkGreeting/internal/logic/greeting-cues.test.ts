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
    { cell: 0, phase: 'playing', opacity: 0, delay: 0 },
    { cell: 0, phase: 'settled', opacity: 1, delay: 0 },
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
    { cell: 0, phase: 'waiting', stance: 'veiled' },
    { cell: 0, phase: 'playing', stance: 'moving' },
    { cell: 2, phase: 'waiting', stance: 'veiled' },
    { cell: 2, phase: 'playing', stance: 'moving' },
    { cell: 2, phase: 'settled', stance: 'resting' },
    { cell: 1, phase: 'waiting', stance: 'resting' },
    { cell: 1, phase: 'playing', stance: 'resting' },
    { cell: 3, phase: 'waiting', stance: 'resting' },
  ] as const)('holds cell $cell $stance while $phase', ({ cell, phase, stance }) => {
    expect(inkCueOf(cell, BOARD, phase).stance).toBe(stance);
  });

  it.each([
    { phase: 'waiting', stance: 'veiled', delay: 0 },
    { phase: 'playing', stance: 'moving', delay: 0.45 },
    { phase: 'settled', stance: 'resting', delay: 0 },
  ] as const)(
    'prints a mark bound to cell 0 with its digit while $phase',
    ({ phase, stance, delay }) => {
      const cue = inkCueOf(1, BOARD, phase, 0);

      expect([cue.stance, cue.delay]).toEqual([stance, delay]);
    },
  );

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
    { phase: 'waiting', stance: 'moving' },
    { phase: 'playing', stance: 'moving' },
    { phase: 'settled', stance: 'resting' },
  ] as const)('holds the line $stance while $phase', ({ phase, stance }) => {
    expect(lineCueOf('full', BOARD.line, phase).stance).toBe(stance);
  });

  it('shows the line at once when the board cues none', () => {
    expect(lineCueOf('full', null, 'playing').opacity).toBe(1);
  });
});
