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
    1: { startSeconds: 0, name: 'Auftakt', description: null },
    2: { startSeconds: 8, name: '', description: null },
    3: { startSeconds: 16, name: '', description: null },
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

describe('stepRemove', () => {
  it.each([
    { name: 'hands the part start to the next step', removed: 2, parts: { 10: 3 } },
    { name: 'keeps parts that start elsewhere', removed: 3, parts: { 10: 2 } },
  ])('$name', ({ removed, parts }) => {
    const base = { ...threeSteps, parts: { 10: { name: 'A', firstStepId: 2, mainVideoId: null } } };

    const result = changed(base, { kind: 'stepRemove', stepId: removed });

    expect(
      Object.fromEntries(Object.entries(result.parts).map(([id, part]) => [id, part.firstStepId])),
    ).toEqual(parts);
  });

  it('drops a part whose heir already starts another part', () => {
    const base = {
      ...threeSteps,
      parts: {
        10: { name: 'A', firstStepId: 2, mainVideoId: null },
        11: { name: 'B', firstStepId: 3, mainVideoId: null },
      },
    };

    const result = changed(base, { kind: 'stepRemove', stepId: 2 });

    expect(Object.keys(result.parts)).toEqual(['11']);
  });

  it('leaves parts alone when a cut-away step goes', () => {
    const base = {
      ...threeSteps,
      steps: { ...threeSteps.steps, 4: { startSeconds: null, name: '', description: null } },
      parts: { 10: { name: 'A', firstStepId: 1, mainVideoId: null } },
    };

    const result = changed(base, { kind: 'stepRemove', stepId: 4 });

    expect(result.parts).toEqual(base.parts);
  });
});

describe('partAdd and partSettings', () => {
  const withPart = {
    ...threeSteps,
    parts: { 10: { name: 'A', firstStepId: 2, mainVideoId: null } },
  };

  it.each([
    { firstStepId: 3, added: true },
    { firstStepId: 2, added: false },
    { firstStepId: 99, added: false },
  ])('opens a part at step $firstStepId: $added', ({ firstStepId, added }) => {
    const result = changed(withPart, { kind: 'partAdd', partId: -1, firstStepId, name: 'B' });

    expect(result.parts[-1] !== undefined).toBe(added);
  });

  it('keeps the start when the wanted step starts another part', () => {
    const base = {
      ...withPart,
      parts: { ...withPart.parts, 11: { name: 'B', firstStepId: 3, mainVideoId: null } },
    };

    const result = changed(base, {
      kind: 'partSettings',
      partId: 10,
      name: 'Neu',
      firstStepId: 3,
      mainVideoId: 4,
    });

    expect(result.parts[10]).toEqual({ name: 'Neu', firstStepId: 2, mainVideoId: 4 });
  });

  it.each([
    { partId: 11, wanted: 2, start: 2 },
    { partId: 11, wanted: 4, start: 4 },
    { partId: 11, wanted: 1, start: 3 },
    { partId: 10, wanted: 2, start: 1 },
  ])(
    'moves part $partId to step $wanted only between its neighbours',
    ({ partId, wanted, start }) => {
      const base = {
        ...threeSteps,
        steps: { ...threeSteps.steps, 4: { startSeconds: 24, name: '', description: null } },
        parts: {
          10: { name: 'A', firstStepId: 1, mainVideoId: null },
          11: { name: 'B', firstStepId: 3, mainVideoId: null },
        },
      };

      const result = changed(base, {
        kind: 'partSettings',
        partId,
        name: 'B',
        firstStepId: wanted,
        mainVideoId: null,
      });

      expect(result.parts[partId]?.firstStepId).toBe(start);
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

describe('mergeKeyOf', () => {
  it.each<{ change: StudioChange; merges: boolean }>([
    { change: { kind: 'stepMove', stepId: 1, atSeconds: 2, lengthSeconds: 40 }, merges: true },
    { change: { kind: 'videoStart', videoId: 1, startSeconds: 2 }, merges: true },
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
