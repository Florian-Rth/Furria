import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import type { StudioChange } from './studio-changes';
import { applyChange, mergeKeyOf } from './studio-changes';
import type { StudioDocument } from './studio-document';

const lena = { personId: 7, firstName: 'Lena', lastName: 'Berg', portrait: null };

const keyframe = { sourceMediaItemId: 1, seconds: 4, position: { rightMetres: 1, backMetres: 2 } };

const document = (patch: Partial<StudioDocument>): StudioDocument => ({
  songOrder: [],
  songs: {},
  steps: {},
  parts: {},
  spotOrder: [],
  spots: {},
  tracks: {},
  videos: {},
  finalTracks: {},
  ...patch,
});

const threeSteps = document({
  steps: {
    1: { startSeconds: 0, name: 'Auftakt' },
    2: { startSeconds: 8, name: '' },
    3: { startSeconds: 16, name: '' },
  },
});

const changed = (base: StudioDocument, change: StudioChange): StudioDocument =>
  produce(base, (draft) => {
    applyChange(draft, change);
  });

const startsOf = (result: StudioDocument): Record<string, number | null> =>
  Object.fromEntries(Object.entries(result.steps).map(([id, step]) => [id, step.startSeconds]));

describe('stepMark', () => {
  it.each([
    { name: 'opens an empty timeline', base: document({}), at: 5, starts: { '-2': 0, '-1': 5 } },
    { name: 'marks at the very start alone', base: document({}), at: 0, starts: { '-1': 0 } },
    {
      name: 'splits a step',
      base: threeSteps,
      at: 12,
      starts: { 1: 0, 2: 8, 3: 16, '-1': 12 },
    },
    { name: 'refuses a border', base: threeSteps, at: 8.005, starts: { 1: 0, 2: 8, 3: 16 } },
    { name: 'refuses the music end', base: threeSteps, at: 40, starts: { 1: 0, 2: 8, 3: 16 } },
  ])('$name', ({ base, at, starts }) => {
    const result = changed(base, {
      kind: 'stepMark',
      stepId: -1,
      openingStepId: -2,
      atSeconds: at,
      lengthSeconds: 40,
    });

    expect(startsOf(result)).toEqual(starts);
  });
});

describe('stepMove', () => {
  it.each([
    { stepId: 2, at: 10, moved: 10 },
    { stepId: 2, at: 16.5, moved: 8 },
    { stepId: 2, at: 0, moved: 8 },
    { stepId: 3, at: 30, moved: 30 },
    { stepId: 1, at: 2, moved: 0 },
    { stepId: 3, at: 39.995, moved: 16 },
  ])('moves step $stepId to $at only between its neighbours', ({ stepId, at, moved }) => {
    const result = changed(threeSteps, {
      kind: 'stepMove',
      stepId,
      atSeconds: at,
      lengthSeconds: 40,
    });

    expect(result.steps[stepId]?.startSeconds).toBe(moved);
  });
});

const part = (name: string, firstStepId: number | null, lastStepId: number | null) => ({
  name,
  firstStepId,
  lastStepId,
  mainVideoId: null,
});

const rangesOf = (result: StudioDocument): Record<string, [number | null, number | null]> =>
  Object.fromEntries(
    Object.entries(result.parts).map(([id, shown]) => [id, [shown.firstStepId, shown.lastStepId]]),
  );

describe('stepMark in a part', () => {
  it('keeps the new step in the part when it splits its last step', () => {
    const base = { ...threeSteps, parts: { 10: part('A', 1, 2) } };

    const result = changed(base, {
      kind: 'stepMark',
      stepId: -1,
      openingStepId: -2,
      atSeconds: 12,
      lengthSeconds: 40,
    });

    expect(rangesOf(result)).toEqual({ 10: [1, -1] });
  });
});

describe('stepRemove', () => {
  it.each([
    { name: 'hands the part start to the next step', removed: 1, parts: { 10: [2, 3] } },
    { name: 'hands the part end to the previous step', removed: 3, parts: { 10: [1, 2] } },
    { name: 'keeps the range around a middle step', removed: 2, parts: { 10: [1, 3] } },
  ])('$name', ({ removed, parts }) => {
    const base = { ...threeSteps, parts: { 10: part('A', 1, 3) } };

    expect(rangesOf(changed(base, { kind: 'stepRemove', stepId: removed }))).toEqual(parts);
  });

  it('drops a part whose only step goes', () => {
    const base = { ...threeSteps, parts: { 10: part('A', 2, 2), 11: part('B', 3, 3) } };

    expect(Object.keys(changed(base, { kind: 'stepRemove', stepId: 2 }).parts)).toEqual(['11']);
  });

  it('leaves parts alone when a cut-away step goes', () => {
    const base = {
      ...threeSteps,
      steps: { ...threeSteps.steps, 4: { startSeconds: null, name: '' } },
      parts: { 10: part('A', 1, 3) },
    };

    expect(changed(base, { kind: 'stepRemove', stepId: 4 }).parts).toEqual(base.parts);
  });
});

describe('partAdd and partSettings', () => {
  const withPart = { ...threeSteps, parts: { 10: part('A', 2, 2) } };

  it.each([
    { firstStepId: 3, lastStepId: 3, added: true },
    { firstStepId: 1, lastStepId: 1, added: true },
    { firstStepId: 1, lastStepId: 2, added: false },
    { firstStepId: 3, lastStepId: 1, added: false },
    { firstStepId: 99, lastStepId: 99, added: false },
  ])('opens a part on $firstStepId–$lastStepId: $added', ({ firstStepId, lastStepId, added }) => {
    const result = changed(withPart, {
      kind: 'partAdd',
      partId: -1,
      firstStepId,
      lastStepId,
      name: 'B',
    });

    expect(result.parts[-1] !== undefined).toBe(added);
  });

  it.each([
    { firstStepId: 1, lastStepId: 2, range: [1, 2] },
    { firstStepId: 2, lastStepId: 3, range: [2, 2] },
    { firstStepId: 3, lastStepId: 2, range: [2, 2] },
  ])(
    'moves the range to $firstStepId–$lastStepId only without overlap',
    ({ firstStepId, lastStepId, range }) => {
      const base = { ...withPart, parts: { ...withPart.parts, 11: part('B', 3, 3) } };

      const result = changed(base, {
        kind: 'partSettings',
        partId: 10,
        name: 'Neu',
        firstStepId,
        lastStepId,
        mainVideoId: 4,
      });

      expect(result.parts[10]).toEqual({
        name: 'Neu',
        firstStepId: range[0],
        lastStepId: range[1],
        mainVideoId: 4,
      });
    },
  );
});

describe('spots', () => {
  const twoSpots = document({
    spotOrder: [1, 2],
    spots: { 1: { person: lena }, 2: { person: null } },
    tracks: { 1: [{ ...keyframe, bend: null, easing: 'linear', facingDegrees: null }] },
  });

  it('moves a person off the spot they held', () => {
    const result = changed(twoSpots, { kind: 'spotAssign', spotId: 2, person: lena });

    expect([result.spots[1]?.person?.personId, result.spots[2]?.person?.personId]).toEqual([
      undefined,
      7,
    ]);
  });

  it('removes the spot with its track and its place in the order', () => {
    const result = changed(twoSpots, { kind: 'spotRemove', spotId: 1 });

    expect([result.spotOrder, Object.keys(result.tracks)]).toEqual([[2], []]);
  });

  it('ignores tracks of unknown spots', () => {
    const result = changed(twoSpots, { kind: 'tracks', tracks: { 2: [], 9: [] } });

    expect(Object.keys(result.tracks)).toEqual(['1', '2']);
  });
});

describe('songOrder', () => {
  it('keeps every known song and drops unknown ones', () => {
    const base = document({ songOrder: [1, 2, 3] });

    const result = changed(base, { kind: 'songOrder', songIds: [3, 9, 1] });

    expect(result.songOrder).toEqual([3, 1, 2]);
  });
});

describe('finalOffset', () => {
  const aligned = document({
    finalTracks: {
      40: {
        firstBeatSeconds: null,
        tempoBpm: null,
        alignments: {
          1: [
            { fromSeconds: 0, offsetSeconds: 2, stretch: 1 },
            { fromSeconds: 20, offsetSeconds: 5, stretch: 1 },
            { fromSeconds: 30, offsetSeconds: 9, stretch: 1 },
          ],
        },
      },
    },
  });

  it.each<[string, number, number, number[]]>([
    ['replaces the entry of the piece', 20, 30, [0, 20, 30]],
    ['drops older entries inside the piece', 10, 35, [0, 10]],
    ['adds an entry for a fresh piece', 12, 18, [0, 12, 20, 30]],
  ])('%s', (_, fromSeconds, untilSeconds, froms) => {
    const result = changed(aligned, {
      kind: 'finalOffset',
      finalTrackId: 40,
      sourceMediaItemId: 1,
      fromSeconds,
      untilSeconds,
      offsetSeconds: 7,
      stretch: 1,
    });

    expect(result.finalTracks[40]?.alignments[1]?.map((entry) => entry.fromSeconds)).toEqual(froms);
  });
});

describe('videoClip', () => {
  it('cuts the clip of a known video and ignores unknown ones', () => {
    const base = document({
      videos: { 5: { name: null, startSeconds: 3, clipStartSeconds: 0, clipEndSeconds: 30 } },
    });

    const result = changed(
      changed(base, { kind: 'videoClip', videoId: 5, startSeconds: 2.5, endSeconds: 12.25 }),
      { kind: 'videoClip', videoId: 9, startSeconds: 1, endSeconds: 2 },
    );

    expect(result.videos).toEqual({
      5: { name: null, startSeconds: 3, clipStartSeconds: 2.5, clipEndSeconds: 12.25 },
    });
  });
});

describe('mergeKeyOf', () => {
  it.each<{ change: StudioChange; merges: boolean }>([
    { change: { kind: 'stepMove', stepId: 1, atSeconds: 2, lengthSeconds: 40 }, merges: true },
    { change: { kind: 'videoStart', videoId: 1, startSeconds: 2 }, merges: true },
    { change: { kind: 'videoClip', videoId: 1, startSeconds: 0, endSeconds: 2 }, merges: true },
    { change: { kind: 'stepName', stepId: 1, name: 'Wel' }, merges: true },
    { change: { kind: 'videoName', videoId: 1, name: 'Probe' }, merges: true },
    { change: { kind: 'tracks', tracks: { 2: [], 1: [] } }, merges: true },
    { change: { kind: 'stepRemove', stepId: 1 }, merges: false },
    { change: { kind: 'spotAdd', spotId: -1 }, merges: false },
  ])('$change.kind merges: $merges', ({ change, merges }) => {
    expect(mergeKeyOf(change) !== null).toBe(merges);
  });

  it('merges tracks of the same spots regardless of their order', () => {
    expect(mergeKeyOf({ kind: 'tracks', tracks: { 2: [], 1: [] } })).toBe(
      mergeKeyOf({ kind: 'tracks', tracks: { 1: [], 2: [] } }),
    );
  });
});
