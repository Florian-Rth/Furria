import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import type { StudioChange } from './studio-changes';
import { applyChange, mergeKeyOf } from './studio-changes';
import type { DocumentPart, StudioDocument } from './studio-document';

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
  ...patch,
});

const threeSteps = document({
  steps: {
    1: {
      startSeconds: 0,
      endSeconds: 8,
      name: 'Auftakt',
      startNeedsCheck: false,
      endNeedsCheck: false,
    },
    2: { startSeconds: 8, endSeconds: 16, name: '', startNeedsCheck: false, endNeedsCheck: false },
    3: { startSeconds: 16, endSeconds: 40, name: '', startNeedsCheck: false, endNeedsCheck: false },
  },
});

const gapped = document({
  steps: {
    1: { startSeconds: 2, endSeconds: 8, name: '', startNeedsCheck: false, endNeedsCheck: false },
    3: { startSeconds: 16, endSeconds: 30, name: '', startNeedsCheck: false, endNeedsCheck: false },
  },
});

const changed = (base: StudioDocument, change: StudioChange): StudioDocument =>
  produce(base, (draft) => {
    applyChange(draft, change);
  });

const spansOf = (result: StudioDocument): Record<string, [number | null, number | null]> =>
  Object.fromEntries(
    Object.entries(result.steps).map(([id, step]) => [id, [step.startSeconds, step.endSeconds]]),
  );

describe('stepMark', () => {
  it.each<{ name: string; base: StudioDocument; at: number; spans: Record<string, number[]> }>([
    {
      name: 'opens an empty timeline',
      base: document({}),
      at: 5,
      spans: { '-2': [0, 5], '-1': [5, 40] },
    },
    {
      name: 'covers all music from its start',
      base: document({}),
      at: 0,
      spans: { '-1': [0, 40] },
    },
    {
      name: 'splits a step',
      base: threeSteps,
      at: 12,
      spans: { 1: [0, 8], 2: [8, 12], 3: [16, 40], '-1': [12, 16] },
    },
    {
      name: 'refuses a border',
      base: threeSteps,
      at: 8.005,
      spans: { 1: [0, 8], 2: [8, 16], 3: [16, 40] },
    },
    {
      name: 'fills a gap up to the next step',
      base: gapped,
      at: 10,
      spans: { 1: [2, 8], 3: [16, 30], '-1': [10, 16] },
    },
    {
      name: 'fills the music after the last step',
      base: gapped,
      at: 32,
      spans: { 1: [2, 8], 3: [16, 30], '-1': [32, 40] },
    },
    {
      name: 'refuses a step shorter than the border tolerance at the music end',
      base: gapped,
      at: 39.995,
      spans: { 1: [2, 8], 3: [16, 30] },
    },
    {
      name: 'refuses a mark right before the end of a step with a gap after it',
      base: gapped,
      at: 29.995,
      spans: { 1: [2, 8], 3: [16, 30] },
    },
    {
      name: 'fills the music before the first step',
      base: gapped,
      at: 0.5,
      spans: { 1: [2, 8], 3: [16, 30], '-1': [0.5, 2] },
    },
  ])('$name', ({ base, at, spans }) => {
    const result = changed(base, {
      kind: 'stepMark',
      stepId: -1,
      openingStepId: -2,
      atSeconds: at,
      lengthSeconds: 40,
    });

    expect(spansOf(result)).toEqual(spans);
  });
});

describe('stepMove', () => {
  it.each<{ name: string; base: StudioDocument; stepId: number; at: number; spans: object }>([
    {
      name: 'takes the touching step before along',
      base: threeSteps,
      stepId: 2,
      at: 10,
      spans: { 1: [0, 10], 2: [10, 16], 3: [16, 40] },
    },
    {
      name: 'stays before its own end',
      base: threeSteps,
      stepId: 2,
      at: 16.5,
      spans: { 1: [0, 8], 2: [8, 16], 3: [16, 40] },
    },
    {
      name: 'stays after the start of the touching step before',
      base: threeSteps,
      stepId: 2,
      at: 0.005,
      spans: { 1: [0, 8], 2: [8, 16], 3: [16, 40] },
    },
    {
      name: 'moves the first step away from the music start',
      base: threeSteps,
      stepId: 1,
      at: 2,
      spans: { 1: [2, 8], 2: [8, 16], 3: [16, 40] },
    },
    {
      name: 'leaves the step before a gap alone',
      base: gapped,
      stepId: 3,
      at: 12,
      spans: { 1: [2, 8], 3: [12, 30] },
    },
    {
      name: 'does not overlap the step before a gap',
      base: gapped,
      stepId: 3,
      at: 7,
      spans: { 1: [2, 8], 3: [16, 30] },
    },
    {
      name: 'closes a gap up to the step before',
      base: gapped,
      stepId: 3,
      at: 8,
      spans: { 1: [2, 8], 3: [8, 30] },
    },
  ])('$name', ({ base, stepId, at, spans }) => {
    expect(spansOf(changed(base, { kind: 'stepMove', stepId, atSeconds: at }))).toEqual(spans);
  });
});

describe('stepRemove spans', () => {
  it.each<{ name: string; base: StudioDocument; removed: number; spans: object }>([
    {
      name: 'lets the touching step before take over',
      base: threeSteps,
      removed: 2,
      spans: { 1: [0, 16], 3: [16, 40] },
    },
    {
      name: 'leaves music without a step where the first step was',
      base: threeSteps,
      removed: 1,
      spans: { 2: [8, 16], 3: [16, 40] },
    },
    {
      name: 'leaves a gap where no step touches',
      base: gapped,
      removed: 3,
      spans: { 1: [2, 8] },
    },
  ])('$name', ({ base, removed, spans }) => {
    expect(spansOf(changed(base, { kind: 'stepRemove', stepId: removed }))).toEqual(spans);
  });
});

const part = (
  name: string,
  firstStepId: number | null,
  lastStepId: number | null,
): DocumentPart => ({
  name,
  firstStepId,
  lastStepId,
  mainVideoId: null,
});

const rangesOf = (result: StudioDocument): Record<string, [number | null, number | null]> =>
  Object.fromEntries(
    Object.entries(result.parts).map(([id, shown]) => [id, [shown.firstStepId, shown.lastStepId]]),
  );

describe('borders to check', () => {
  const unchecked = document({
    steps: {
      1: { startSeconds: 0, endSeconds: 8, name: '', startNeedsCheck: true, endNeedsCheck: true },
      2: { startSeconds: 8, endSeconds: 16, name: '', startNeedsCheck: true, endNeedsCheck: true },
    },
  });

  const checksOf = (result: StudioDocument): Record<string, [boolean, boolean]> =>
    Object.fromEntries(
      Object.entries(result.steps).map(([id, step]) => [
        id,
        [step.startNeedsCheck, step.endNeedsCheck],
      ]),
    );

  it.each<{ name: string; change: StudioChange; checks: Record<string, [boolean, boolean]> }>([
    {
      name: 'a moved border clears the flags of both touching steps',
      change: { kind: 'stepMove', stepId: 2, atSeconds: 9 },
      checks: { 1: [true, false], 2: [false, true] },
    },
    {
      name: 'a moved first start clears only its own flag',
      change: { kind: 'stepMove', stepId: 1, atSeconds: 1 },
      checks: { 1: [false, true], 2: [true, true] },
    },
    {
      name: 'a refused move keeps the flags',
      change: { kind: 'stepMove', stepId: 2, atSeconds: 20 },
      checks: { 1: [true, true], 2: [true, true] },
    },
    {
      name: 'a move onto the same spot keeps the flags',
      change: { kind: 'stepMove', stepId: 2, atSeconds: 8 },
      checks: { 1: [true, true], 2: [true, true] },
    },
    {
      name: 'a split keeps the old end to check on the new step',
      change: { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 4, lengthSeconds: 16 },
      checks: { 1: [true, false], 2: [true, true], '-1': [false, true] },
    },
    {
      name: 'a removed step leaves the grown end checked',
      change: { kind: 'stepRemove', stepId: 2 },
      checks: { 1: [true, false] },
    },
  ])('$name', ({ change, checks }) => {
    expect(checksOf(changed(unchecked, change))).toEqual(checks);
  });
});

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
  ])('$name', ({ removed, parts }) => {
    const base = { ...threeSteps, parts: { 10: part('A', 1, 3) } };

    expect(rangesOf(changed(base, { kind: 'stepRemove', stepId: removed }))).toEqual(parts);
  });

  it('drops a part whose only step goes', () => {
    const base = { ...threeSteps, parts: { 10: part('A', 2, 2), 11: part('B', 3, 3) } };

    expect(Object.keys(changed(base, { kind: 'stepRemove', stepId: 2 }).parts)).toEqual(['11']);
  });
});

describe('partAdd and partSettings', () => {
  const withPart = { ...threeSteps, parts: { 10: part('A', 2, 2) } };

  it.each([
    { firstStepId: 3, lastStepId: 3, added: true },
    { firstStepId: 1, lastStepId: 2, added: false },
    { firstStepId: 3, lastStepId: 1, added: false },
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
    { change: { kind: 'stepMove', stepId: 1, atSeconds: 2 }, merges: true },
    { change: { kind: 'stepRemove', stepId: 1 }, merges: false },
  ])('$change.kind merges: $merges', ({ change, merges }) => {
    expect(mergeKeyOf(change) !== null).toBe(merges);
  });

  it('merges tracks of the same spots regardless of their order', () => {
    expect(mergeKeyOf({ kind: 'tracks', tracks: { 2: [], 1: [] } })).toBe(
      mergeKeyOf({ kind: 'tracks', tracks: { 1: [], 2: [] } }),
    );
  });
});
