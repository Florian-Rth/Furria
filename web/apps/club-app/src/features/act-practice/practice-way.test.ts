import { describe, expect, it } from 'vitest';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { OwnCue, OwnWay } from './practice-way';
import { countsBetween, cueOf, ownWayAt } from './practice-way';

const at = (
  seconds: number,
  rightMetres: number,
  backMetres: number,
  bend: TimedKeyframe['bend'] = null,
): TimedKeyframe => ({
  seconds,
  position: { rightMetres, backMetres },
  bend,
  easing: 'linear',
  facingDegrees: null,
});

const keyframes: TimedKeyframe[] = [
  at(0, 0, 0),
  at(4, 0, 0),
  at(6, 2, 0),
  at(8, 2, 2),
  at(20, 2, 2),
  at(22, 0, 2, { rightMetres: 1, backMetres: 3 }),
];

const marks: CountMark[] = Array.from({ length: 50 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('countsBetween', () => {
  it.each([
    [0, 2, 4],
    [0.1, 2, 4],
    [1.9, 2, 1],
    [2, 2, 0],
  ])('from %s to %s there are %s counts', (from, to, counts) => {
    expect(countsBetween(marks, from, to)).toBe(counts);
  });
});

describe('ownWayAt', () => {
  it('stays calm while the next move is more than one eight away', () => {
    expect(ownWayAt(keyframes, marks, 9, null)).toEqual({ phase: 'still' });
  });

  it.each([
    [2.6, 3],
    [3.9, 1],
    [0.1, 8],
  ])('at %s s the move starts in %s counts', (seconds, counts) => {
    const way = ownWayAt(keyframes, marks, seconds, null);

    expect(way.phase === 'soon' ? way.counts : null).toBe(counts);
  });

  it('shows the whole coming run to where you will stand', () => {
    expect(ownWayAt(keyframes, marks, 3, null)).toEqual({
      phase: 'soon',
      counts: 2,
      route: [
        { rightMetres: 0, backMetres: 0 },
        { rightMetres: 2, backMetres: 0 },
        { rightMetres: 2, backMetres: 2 },
      ],
    });
  });

  it('draws only what is left of the move under way', () => {
    expect(ownWayAt(keyframes, marks, 5.2, null)).toEqual({
      phase: 'now',
      fresh: false,
      route: [
        { rightMetres: 1.2000000000000002, backMetres: 0 },
        { rightMetres: 2, backMetres: 0 },
        { rightMetres: 2, backMetres: 2 },
      ],
    });
  });

  it.each([
    [4.2, true],
    [4.6, false],
    [7, false],
  ])('at %s s the move is fresh: %s', (seconds, fresh) => {
    const way = ownWayAt(keyframes, marks, seconds, null);

    expect(way.phase === 'now' ? way.fresh : null).toBe(fresh);
  });

  it('follows a bend through its curve', () => {
    const way = ownWayAt(keyframes, marks, 18, null);
    const route = way.phase === 'soon' ? way.route : [];

    expect([route.length, route[8], route.at(-1)]).toEqual([
      17,
      { rightMetres: 1, backMetres: 3 },
      { rightMetres: 0, backMetres: 2 },
    ]);
  });

  it('stays calm when the move lies beyond the repeated step', () => {
    expect(ownWayAt(keyframes, marks, 18, { start: 10, end: 20 })).toEqual({ phase: 'still' });
  });

  it('stays calm after the last move', () => {
    expect(ownWayAt(keyframes, marks, 23, null)).toEqual({ phase: 'still' });
  });

  it('looks a few seconds ahead without counts', () => {
    expect(ownWayAt(keyframes, [], 1, null).phase).toBe('soon');
    expect(ownWayAt(keyframes, [], 15, null).phase).toBe('still');
  });
});

const cueCases: [OwnWay, OwnCue | null][] = [
  [{ phase: 'still' }, null],
  [
    { phase: 'soon', counts: 3, route: [] },
    { tone: 'soon', counts: 3 },
  ],
  [{ phase: 'soon', counts: null, route: [] }, null],
  [{ phase: 'now', fresh: true, route: [] }, { tone: 'now' }],
  [{ phase: 'now', fresh: false, route: [] }, null],
];

describe('cueOf', () => {
  it.each(cueCases)('%o cues %o', (way, cue) => {
    expect(cueOf(way)).toEqual(cue);
  });
});
