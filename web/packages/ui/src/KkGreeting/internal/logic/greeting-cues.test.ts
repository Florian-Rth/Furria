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
        { kind: 'text', text: 'x' },
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
    { cell: 0, boundTo: null, phase: 'waiting', clock: 0, stance: 'veiled', share: 1 },
    { cell: 0, boundTo: null, phase: 'playing', clock: 960, stance: 'moving', share: 0 },
    { cell: 0, boundTo: null, phase: 'settled', clock: 0, stance: 'resting', share: 1 },
    { cell: 1, boundTo: null, phase: 'playing', clock: 0, stance: 'resting', share: 1 },
    { cell: 1, boundTo: 0, phase: 'waiting', clock: 449, stance: 'veiled', share: 1 },
    { cell: 1, boundTo: 0, phase: 'playing', clock: 449, stance: 'moving', share: 0 },
    { cell: 1, boundTo: 0, phase: 'playing', clock: 450, stance: 'moving', share: 1 },
    { cell: 1, boundTo: 0, phase: 'settled', clock: 449, stance: 'resting', share: 1 },
  ] as const)(
    'holds cell $cell (bound to $boundTo) $stance at $share by $clock ms while $phase',
    ({ cell, boundTo, phase, clock, stance, share }) => {
      const cue = inkCueOf(cell, BOARD, phase, boundTo);

      expect([cue.stance, cueShareAt(cue, clock)]).toEqual([stance, share]);
    },
  );
});

describe('lineCueOf', () => {
  it.each([
    { phase: 'waiting', clock: 960, share: 0 },
    { phase: 'playing', clock: 619, share: 0 },
    { phase: 'playing', clock: 700, share: 0.5 },
    { phase: 'settled', clock: 0, share: 1 },
  ] as const)('shows $share of the line at $clock ms while $phase', ({ phase, clock, share }) => {
    expect(cueShareAt(lineCueOf(BOARD.line, phase), clock)).toBe(share);
  });

  it('shows the line at once when the board cues none', () => {
    expect(cueShareAt(lineCueOf(null, 'playing'), 0)).toBe(1);
  });
});
