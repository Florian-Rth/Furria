import { describe, expect, it } from 'vitest';
import type { FlapSchedule } from './flap-schedule';
import { cueShareAt, inkCueOf, lineCueOf } from './greeting-cues';

const BOARD: FlapSchedule = {
  runs: [
    {
      cell: 0,
      start: 0,
      end: 450,
      faces: [
        { kind: 'text', text: '' },
        { kind: 'text', text: 'Tag' },
      ],
      flips: [{ kind: 'final', at: 0, duration: 230 }],
    },
  ],
  tone: 'ink',
  line: { at: 620, duration: 160 },
  burstAt: null,
  duration: 960,
};

describe('inkCueOf', () => {
  it.each([
    { cell: 0, phase: 'playing', clock: 960, share: 0 },
    { cell: 0, phase: 'settled', clock: 0, share: 1 },
    { cell: 1, phase: 'waiting', clock: 0, share: 1 },
  ] as const)(
    'shows $share of cell $cell at $clock ms on the clock while $phase',
    ({ cell, phase, clock, share }) => {
      expect(cueShareAt(inkCueOf(cell, BOARD, phase), clock)).toBe(share);
    },
  );

  it.each([
    { cell: 0, phase: 'waiting', stance: 'veiled' },
    { cell: 0, phase: 'playing', stance: 'moving' },
    { cell: 1, phase: 'waiting', stance: 'resting' },
    { cell: 1, phase: 'playing', stance: 'resting' },
  ] as const)('holds cell $cell $stance while $phase', ({ cell, phase, stance }) => {
    expect(inkCueOf(cell, BOARD, phase).stance).toBe(stance);
  });

  it.each([
    { phase: 'waiting', stance: 'veiled', clock: 449, share: 1 },
    { phase: 'playing', stance: 'moving', clock: 449, share: 0 },
    { phase: 'playing', stance: 'moving', clock: 450, share: 1 },
    { phase: 'settled', stance: 'resting', clock: 449, share: 1 },
  ] as const)(
    'prints a mark bound to cell 0 with its digit at $clock ms while $phase',
    ({ phase, stance, clock, share }) => {
      const cue = inkCueOf(1, BOARD, phase, 0);

      expect([cue.stance, cueShareAt(cue, clock)]).toEqual([stance, share]);
    },
  );
});

describe('lineCueOf', () => {
  it.each([
    { phase: 'waiting', clock: 960, share: 0 },
    { phase: 'playing', clock: 619, share: 0 },
    { phase: 'playing', clock: 700, share: 0.5 },
    { phase: 'playing', clock: 780, share: 1 },
    { phase: 'settled', clock: 0, share: 1 },
  ] as const)('shows $share of the line at $clock ms while $phase', ({ phase, clock, share }) => {
    expect(cueShareAt(lineCueOf(BOARD.line, phase), clock)).toBe(share);
  });

  it.each([
    { phase: 'waiting', stance: 'moving' },
    { phase: 'playing', stance: 'moving' },
    { phase: 'settled', stance: 'resting' },
  ] as const)('holds the line $stance while $phase', ({ phase, stance }) => {
    expect(lineCueOf(BOARD.line, phase).stance).toBe(stance);
  });

  it('shows the line at once when the board cues none', () => {
    expect(cueShareAt(lineCueOf(null, 'playing'), 0)).toBe(1);
  });
});
