import { describe, expect, it } from 'vitest';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { ShownTick } from './way-ticks';
import { spacedTicksOf, wayTicksAt } from './way-ticks';

const at = (seconds: number, rightMetres: number, backMetres: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres, backMetres },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const keyframes: TimedKeyframe[] = [
  at(0, 0, 0),
  at(4, 0, 0),
  at(6, 2, 0),
  at(8, 2, 2),
  at(20, 2, 2),
];

const marks: CountMark[] = Array.from({ length: 50 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('wayTicksAt', () => {
  it('marks every count of the coming run up to where you will stand', () => {
    const ticks = wayTicksAt(keyframes, marks, 2.6, null);

    expect(ticks.map((tick) => tick.count)).toEqual([2, 3, 4, 5, 6, 7, 8, 1]);
    expect(ticks.at(-1)?.point).toEqual({ rightMetres: 2, backMetres: 2 });
  });

  it('marks only the counts still ahead while you move', () => {
    const ticks = wayTicksAt(keyframes, marks, 6.1, null);

    expect(ticks.map((tick) => tick.seconds)).toEqual([6.5, 7, 7.5, 8]);
  });

  it('names the counts of the first eight and where you arrive', () => {
    const ticks = wayTicksAt([at(0, 0, 0), at(1, 0, 0), at(8, 6, 0)], marks, 0.5, null);

    expect(ticks.filter((tick) => tick.labelled).map((tick) => tick.seconds)).toEqual([
      1.5, 2, 2.5, 3, 3.5, 8,
    ]);
  });

  it('leaves the arrival unnamed when its count is already named in the first eight', () => {
    const ticks = wayTicksAt([at(0, 0, 0), at(1, 0, 0), at(7.5, 6, 0)], marks, 0.5, null);

    expect(ticks.at(-1)?.labelled).toBe(false);
  });

  it('marks nothing while the next move is more than one eight away', () => {
    expect(wayTicksAt(keyframes, marks, 9, null)).toEqual([]);
  });

  it('stops at the end of the repeated range', () => {
    const ticks = wayTicksAt(keyframes, marks, 3, { start: 0, end: 7 });

    expect(ticks.at(-1)?.seconds).toBe(7);
  });
});

const tick = (count: number, x: number): ShownTick => ({ key: String(count), x, y: 0, count });

describe('spacedTicksOf', () => {
  it.each([
    [
      [0, 0.1, 0.2, 0.3],
      [1, 2, 3, 4],
    ],
    [
      [0, 0.01, 0.02, 0.1],
      [1, 4],
    ],
    [[0, 0.05, 0.06], [3]],
  ])('keeps ticks at %s apart enough as counts %s', (xs, counts) => {
    const ticks = xs.map((x, index) => tick(index + 1, x));

    expect(spacedTicksOf(ticks, null, 0.08, 1).map((kept) => kept.count)).toEqual(counts);
  });

  it('keeps ticks clear of your own dot but always shows where you arrive', () => {
    const ticks = [0.05, 0.2, 0.3].map((x, index) => tick(index + 1, x));
    const near = [0.05, 0.08].map((x, index) => tick(index + 1, x));

    expect(spacedTicksOf(ticks, { x: 0, y: 0 }, 0.08, 1).map((kept) => kept.count)).toEqual([2, 3]);
    expect(spacedTicksOf(near, { x: 0, y: 0 }, 0.08, 1).map((kept) => kept.count)).toEqual([2]);
  });
});
