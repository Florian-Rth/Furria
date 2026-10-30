import { describe, expect, it } from 'vitest';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { LoopKind } from '@/features/act-practice/practice-controls';
import type { OwnCue } from '@/features/act-practice/practice-way';
import type { TwinCueTone, TwinLoopMove } from './twin-practice';
import { cueToneOf, eightAt, eightsInRangeOf, loopMoveOf, soonCountsOf } from './twin-practice';

const marks: CountMark[] = Array.from({ length: 64 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('eightsInRangeOf', () => {
  it.each([
    [{ start: 0, end: 12 }, 3],
    [{ start: 0, end: 13 }, 4],
    [{ start: 2, end: 6 }, 1],
    [{ start: 40, end: 50 }, 0],
  ])('counts the eights of %o as %s', (range, eights) => {
    expect(eightsInRangeOf(marks, range)).toBe(eights);
  });

  it('has no eights without a range', () => {
    expect(eightsInRangeOf(marks, null)).toBe(0);
  });

  it('has no eights without count marks', () => {
    expect(eightsInRangeOf([], { start: 0, end: 12 })).toBe(0);
  });
});

describe('eightAt', () => {
  const range = { start: 4, end: 16 };

  it.each([
    [3.9, 1],
    [4, 1],
    [7.5, 1],
    [8, 2],
    [11.9, 2],
    [12, 3],
    [15.9, 3],
    [20, 3],
  ])('at %s s the dancer is in eight %s of the step', (seconds, eight) => {
    expect(eightAt(marks, range, seconds)).toBe(eight);
  });

  it('is zero when the step has no counts', () => {
    expect(eightAt([], range, 6)).toBe(0);
  });
});

describe('cueToneOf', () => {
  it.each<[OwnCue | null, TwinCueTone]>([
    [null, 'still'],
    [{ tone: 'now' }, 'now'],
    [{ tone: 'soon', counts: 5 }, 'soon'],
  ])('reads %o as %s', (cue, tone) => {
    expect(cueToneOf(cue)).toBe(tone);
  });
});

describe('soonCountsOf', () => {
  it.each<[OwnCue | null, number | null]>([
    [null, null],
    [{ tone: 'now' }, null],
    [{ tone: 'soon', counts: 3 }, 3],
  ])('takes the counts until the move from %o', (cue, counts) => {
    expect(soonCountsOf(cue)).toBe(counts);
  });
});

describe('loopMoveOf', () => {
  it.each<[LoopKind, TwinLoopMove]>([
    ['off', 'step'],
    ['step', 'part'],
    ['part', 'clear'],
  ])('one press on %s goes to %s', (kind, move) => {
    expect(loopMoveOf(kind)).toBe(move);
  });
});
