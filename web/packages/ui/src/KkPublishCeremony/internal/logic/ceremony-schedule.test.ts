import { describe, expect, it } from 'vitest';
import { ceremonyCuesOf } from './ceremony-schedule';

describe('ceremonyCuesOf', () => {
  it.each([
    { elapsed: 0, strikeAt: 600 },
    { elapsed: 250, strikeAt: 350 },
    { elapsed: 600, strikeAt: 0 },
    { elapsed: 4000, strikeAt: 0 },
  ])('strikes $strikeAt ms after a publish that took $elapsed ms', ({ elapsed, strikeAt }) => {
    const [first] = ceremonyCuesOf('published', elapsed);

    expect(first).toEqual({ beat: 'strike', atMs: strikeAt });
  });

  it('plays every beat of a publish in order and finishes after the stamp has left', () => {
    const cues = ceremonyCuesOf('published', 0);

    expect(cues).toEqual([
      { beat: 'strike', atMs: 600 },
      { beat: 'cut', atMs: 1820 },
      { beat: 'stamp', atMs: 2000 },
      { beat: 'settled', atMs: 2900 },
      { beat: 'finished', atMs: 5250 },
    ]);
  });

  it.each([
    { elapsed: 0, slipAt: 600, recoverAt: 1020 },
    { elapsed: 450, slipAt: 150, recoverAt: 570 },
    { elapsed: 3000, slipAt: 0, recoverAt: 420 },
  ])(
    'slips and recovers after a failure that took $elapsed ms',
    ({ elapsed, slipAt, recoverAt }) => {
      expect(ceremonyCuesOf('failed', elapsed)).toEqual([
        { beat: 'slip', atMs: slipAt },
        { beat: 'recover', atMs: recoverAt },
      ]);
    },
  );
});
