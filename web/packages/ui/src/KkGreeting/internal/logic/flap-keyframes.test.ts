import { describe, expect, it } from 'vitest';
import type { FlapTrack } from './flap-keyframes';
import { flapKeyframesOf } from './flap-keyframes';
import type { FlapFace, FlapRun, FlapSchedule } from './flap-schedule';

const text = (face: string): FlapFace => ({ kind: 'text', text: face });

const scheduleOf = (runs: FlapSchedule['runs']): FlapSchedule => ({
  runs,
  tone: 'ink',
  line: null,
  burstAt: null,
  duration: Math.max(0, ...runs.map((run) => run.end)),
});

const SINGLE: FlapRun = {
  cell: 3,
  start: 120,
  end: 350,
  faces: [text('4'), text('5')],
  flips: [{ kind: 'final', at: 120, duration: 230 }],
};

const RATTLE: FlapRun = {
  cell: 0,
  start: 0,
  end: 450,
  faces: [text(''), { kind: 'deck', slot: 0 }, { kind: 'deck', slot: 1 }, text('Tag')],
  flips: [
    { kind: 'face', at: 0, duration: 110 },
    { kind: 'face', at: 110, duration: 110 },
    { kind: 'final', at: 220, duration: 230 },
  ],
};

const COUNTING: FlapRun = {
  cell: 0,
  start: 0,
  end: 450,
  faces: [text(''), text('2'), text('3')],
  flips: [
    { kind: 'face', at: 0, duration: 110 },
    { kind: 'final', at: 220, duration: 230 },
  ],
};

const STRIKE: FlapRun = {
  cell: 2,
  start: 0,
  end: 340,
  faces: [text(''), text('Furria!')],
  flips: [{ kind: 'strike', at: 0, duration: 340 }],
};

const trackOf = (run: FlapRun): FlapTrack => {
  const [track] = flapKeyframesOf(scheduleOf([run]));

  if (track === undefined) {
    throw new Error('A turn run bakes one track.');
  }

  return track;
};

const valueAt = (track: FlapTrack, values: readonly number[], at: number): number => {
  const index = track.at.findIndex((time) => time >= at);

  return values[index] ?? Number.NaN;
};

describe('flapKeyframesOf', () => {
  it('bakes one track per turning cell', () => {
    const tracks = flapKeyframesOf(scheduleOf([RATTLE, SINGLE]));

    expect(tracks.map((track) => [track.cell, track.at[0]])).toEqual([
      [0, 0],
      [3, 120],
    ]);
  });

  it.each([
    ['a single flip', SINGLE],
    ['a rattle', RATTLE],
    ['a count with a hold', COUNTING],
    ['a strike', STRIKE],
  ])('times %s strictly forward on the board clock from its start to its end', (_, run) => {
    const { at } = trackOf(run);

    expect(at[0]).toBe(run.start);
    expect(at.at(-1)).toBe(run.end);
    expect(at.slice(1).every((time, index) => time > (at[index] ?? Number.POSITIVE_INFINITY))).toBe(
      true,
    );
  });

  it.each([
    ['a single flip', SINGLE, 0],
    ['a rattle', RATTLE, 2],
    ['a count with a hold', COUNTING, 1],
  ])('rests %s on its final face with the tile gone', (_, run, face) => {
    const track = trackOf(run);

    expect(track.fall.at(-1)).toBe(-90);
    expect(track.land.at(-1)).toBe(0);
    expect(track.cover.at(-1)).toBe(1);
    expect(track.presence.at(-1)).toBe(0);
    expect(track.face.at(-1)).toBe(face);
  });

  it('starts every cell flat, blank-tiled and on its first face', () => {
    const track = trackOf(RATTLE);

    expect([
      track.fall[0],
      track.land[0],
      track.cover[0],
      track.presence[0],
      track.face[0],
    ]).toEqual([expect.closeTo(0), 90, 0, 0, 0]);
  });

  it.each([
    { at: 0, face: 0 },
    { at: 112, face: 1 },
    { at: 222, face: 2 },
  ])('turns to face $face once the flip at $at ms starts', ({ at, face }) => {
    const track = trackOf(RATTLE);

    expect(valueAt(track, track.face, at)).toBe(face);
  });

  it('keeps the tile up between the first and the last flip', () => {
    const track = trackOf(RATTLE);

    expect(valueAt(track, track.presence, 200)).toBe(1);
  });

  it('holds the landed face during a pause in a count', () => {
    const track = trackOf(COUNTING);

    expect([
      valueAt(track, track.fall, 150),
      valueAt(track, track.land, 150),
      valueAt(track, track.cover, 150),
    ]).toEqual([-90, 0, 1]);
  });

  it('lays a closing flip flat before its tile closes into the hinge', () => {
    const track = trackOf(SINGLE);
    const closing = track.land.filter(
      (_, index) => (track.at[index] ?? 0) > 200 && (track.presence[index] ?? 1) < 1,
    );

    expect(closing.length).toBeGreaterThan(0);
    expect(new Set(closing)).toEqual(new Set([0]));
  });

  it('bounces a strike a second time after it lands', () => {
    const track = trackOf(STRIKE);
    const secondBounce = track.land.filter((_, index) => (track.at[index] ?? 0) > 240);

    expect(Math.max(...secondBounce)).toBeGreaterThan(0);
  });

  it('stands an assembled board up whole before a later cell starts to turn', () => {
    const [track] = flapKeyframesOf(scheduleOf([SINGLE]), true);

    if (track === undefined) {
      throw new Error('A turn run bakes one track.');
    }

    expect([track.at[0], track.presence[0], valueAt(track, track.presence, 100)]).toEqual([
      0, 1, 1,
    ]);
    expect(valueAt(track, track.face, 100)).toBe(0);
    expect(track.presence.at(-1)).toBe(0);
  });

  it('stands a cell that turns at once on its tile from the first frame of an assembled board', () => {
    const [assembled] = flapKeyframesOf(scheduleOf([RATTLE]), true);

    expect([assembled?.at[0], assembled?.presence[0], assembled?.presence.at(-1)]).toEqual([
      0, 1, 0,
    ]);
  });
});
