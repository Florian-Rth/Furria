import { describe, expect, it } from 'vitest';
import type { FlapTrack } from './flap-keyframes';
import { flapKeyframesOf } from './flap-keyframes';
import type { FlapFace, FlapSchedule, FlapTurnRun } from './flap-schedule';

const text = (face: string): FlapFace => ({ kind: 'text', text: face });

const scheduleOf = (runs: FlapSchedule['runs']): FlapSchedule => ({
  runs,
  tone: 'ink',
  line: null,
  burstAt: null,
  duration: Math.max(0, ...runs.map((run) => run.end)),
});

const SINGLE: FlapTurnRun = {
  motion: 'flap',
  cell: 3,
  start: 120,
  end: 350,
  faces: [text('4'), text('5')],
  flips: [{ kind: 'final', at: 120, duration: 230 }],
};

const RATTLE: FlapTurnRun = {
  motion: 'flap',
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

const COUNTING: FlapTurnRun = {
  motion: 'flap',
  cell: 0,
  start: 0,
  end: 450,
  faces: [text(''), text('2'), text('3')],
  flips: [
    { kind: 'face', at: 0, duration: 110 },
    { kind: 'final', at: 220, duration: 230 },
  ],
};

const STRIKE: FlapTurnRun = {
  motion: 'flap',
  cell: 2,
  start: 0,
  end: 340,
  faces: [text(''), text('Furria!')],
  flips: [{ kind: 'strike', at: 0, duration: 340 }],
};

const TICK: FlapTurnRun = {
  motion: 'tick',
  cell: 8,
  start: 0,
  end: 180,
  faces: [text('Lena.'), text('Lena.')],
  flips: [{ kind: 'tick', at: 0, duration: 180 }],
};

const trackOf = (run: FlapTurnRun): FlapTrack => {
  const [track] = flapKeyframesOf(scheduleOf([run]));

  if (track === undefined) {
    throw new Error('A turn run bakes one track.');
  }

  return track;
};

const valueAt = (track: FlapTrack, values: readonly number[], at: number): number => {
  const index = track.times.findIndex((time) => time * track.duration >= at);

  return values[index] ?? Number.NaN;
};

describe('flapKeyframesOf', () => {
  it('bakes one track per turning cell and none for a fading one', () => {
    const tracks = flapKeyframesOf(
      scheduleOf([RATTLE, SINGLE, { motion: 'fade', cell: 5, start: 0, end: 240 }]),
    );

    expect(tracks.map((track) => [track.cell, track.delay])).toEqual([
      [0, 0],
      [3, 120],
    ]);
  });

  it.each([
    ['a single flip', SINGLE],
    ['a rattle', RATTLE],
    ['a count with a hold', COUNTING],
    ['a strike', STRIKE],
    ['a tick', TICK],
  ])('times %s strictly forward from 0 to 1', (_, run) => {
    const { times } = trackOf(run);

    expect(times[0]).toBe(0);
    expect(times.at(-1)).toBe(1);
    expect(times.slice(1).every((time, index) => time > (times[index] ?? 1))).toBe(true);
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

  it('bounces a strike a second time after it lands', () => {
    const track = trackOf(STRIKE);
    const secondBounce = track.land.filter(
      (_, index) => (track.times[index] ?? 0) * track.duration > 240,
    );

    expect(Math.max(...secondBounce)).toBeGreaterThan(0);
  });

  it('swings a tick down and back up on the same face', () => {
    const track = trackOf(TICK);

    expect(Math.min(...track.fall)).toBe(-90);
    expect(track.fall.at(-1)).toBeCloseTo(0);
    expect(new Set(track.face)).toEqual(new Set([0]));
  });

  it('stands an assembled board up whole before a later cell starts to turn', () => {
    const [track] = flapKeyframesOf(scheduleOf([SINGLE]), true);

    if (track === undefined) {
      throw new Error('A turn run bakes one track.');
    }

    expect([track.delay, track.presence[0], valueAt(track, track.presence, 100)]).toEqual([
      0, 1, 1,
    ]);
    expect(valueAt(track, track.face, 100)).toBe(0);
    expect(track.presence.at(-1)).toBe(0);
  });

  it('stands a cell that turns at once on its tile from the first frame of an assembled board', () => {
    const [assembled] = flapKeyframesOf(scheduleOf([RATTLE]), true);

    expect([assembled?.delay, assembled?.presence[0], assembled?.presence.at(-1)]).toEqual([
      0, 1, 0,
    ]);
  });
});
