import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import type { IdMap } from './id-map';
import { NO_IDS, withLearnedId } from './id-map';
import { sameValue } from './same-value';
import type { SaveWrite } from './save-plan';
import { savePlanOf } from './save-plan';
import type { ServerWrite } from './save-port';
import { idsLearnedFrom, savedAfter, serverWriteOf } from './save-run';
import type { StudioChange } from './studio-changes';
import { applyChange } from './studio-changes';
import type { StudioDocument } from './studio-document';

const lena = { personId: 7, firstName: 'Lena', lastName: 'Berg', portrait: null };

const keyframe = {
  sourceMediaItemId: 1,
  seconds: 4,
  position: { rightMetres: 1, backMetres: 2 },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
};

const saved: StudioDocument = {
  songOrder: [1, 2],
  songs: {
    1: { mediaItemId: 1, startSeconds: 0, endSeconds: 20, firstBeatSeconds: 0.5, tempoBpm: 120 },
    2: { mediaItemId: 2, startSeconds: 0, endSeconds: 20, firstBeatSeconds: null, tempoBpm: null },
  },
  steps: {
    1: { startSeconds: 0, endSeconds: 8, name: '', startNeedsCheck: false, endNeedsCheck: false },
    2: { startSeconds: 8, endSeconds: 16, name: '', startNeedsCheck: false, endNeedsCheck: false },
    3: { startSeconds: 16, endSeconds: 40, name: '', startNeedsCheck: false, endNeedsCheck: false },
  },
  parts: { 10: { name: 'A', firstStepId: 2, lastStepId: 2, mainVideoId: null } },
  spotOrder: [31, 32],
  spots: { 31: { person: lena }, 32: { person: null } },
  tracks: { 31: [keyframe] },
  videos: { 5: { name: null, startSeconds: null, clipStartSeconds: 0, clipEndSeconds: 30 } },
};

const known: IdMap = withLearnedId(
  withLearnedId(withLearnedId(NO_IDS, 'steps', -1, 77), 'spots', -2, 88),
  'spots',
  31,
  95,
);

describe('serverWriteOf', () => {
  it.each<{ write: SaveWrite; sent: ServerWrite | null }>([
    {
      write: { kind: 'stepName', stepId: -1, name: 'A' },
      sent: { kind: 'stepName', stepId: 77, name: 'A' },
    },
    {
      write: { kind: 'tracks', tracks: [{ spotId: -2, keyframes: [] }] },
      sent: { kind: 'tracks', baseVersion: 4, tracks: [{ spotId: 88, keyframes: [] }] },
    },
    { write: { kind: 'stepStart', stepId: -9, atSeconds: 3 }, sent: null },
    {
      write: { kind: 'stepEnd', stepId: -1, atSeconds: 9 },
      sent: { kind: 'stepEnd', stepId: 77, atSeconds: 9 },
    },
  ])('resolves $write.kind', ({ write, sent }) => {
    expect(serverWriteOf(write, known, 4)).toEqual(sent);
  });
});

describe('idsLearnedFrom', () => {
  it.each<{ name: string; write: SaveWrite; steps: number[][] }>([
    {
      name: 'the id of a created step',
      write: { kind: 'stepAdd', stepId: -1, startSeconds: 8, endSeconds: 16 },
      steps: [[-1, 70]],
    },
    { name: 'nothing from a rename', write: { kind: 'stepName', stepId: 3, name: 'A' }, steps: [] },
  ])('learns $name', ({ write, steps }) => {
    const learned = idsLearnedFrom(write, { kind: 'created', ids: [70] }, NO_IDS);

    expect([...learned.steps]).toEqual(steps);
  });
});

describe('savedAfter a split', () => {
  it('ends the split step where the created step starts, as the server does', () => {
    const split = savedAfter(saved, saved, {
      kind: 'stepAdd',
      stepId: -1,
      startSeconds: 30,
      endSeconds: 40,
    });

    expect([split.steps[3], split.steps[-1]]).toEqual([
      { startSeconds: 16, endSeconds: 30, name: '', startNeedsCheck: false, endNeedsCheck: false },
      { startSeconds: 30, endSeconds: 40, name: '', startNeedsCheck: false, endNeedsCheck: false },
    ]);
  });
});

describe('savedAfter on flagged borders', () => {
  const flagged = produce(saved, (draft) => {
    for (const step of Object.values(draft.steps)) {
      step.startNeedsCheck = true;
      step.endNeedsCheck = true;
    }
  });

  const checksOf = (result: StudioDocument): Record<string, [boolean, boolean]> =>
    Object.fromEntries(
      Object.entries(result.steps).map(([id, step]) => [
        id,
        [step.startNeedsCheck, step.endNeedsCheck],
      ]),
    );

  it.each<{ name: string; write: SaveWrite; checks: Record<string, [boolean, boolean]> }>([
    {
      name: 'a split gives the old end flag to the created step',
      write: { kind: 'stepAdd', stepId: -1, startSeconds: 30, endSeconds: 40 },
      checks: { 1: [true, true], 2: [true, true], 3: [true, false], '-1': [false, true] },
    },
    {
      name: 'a moved start is checked',
      write: { kind: 'stepStart', stepId: 2, atSeconds: 9 },
      checks: { 1: [true, true], 2: [false, true], 3: [true, true] },
    },
    {
      name: 'a moved end is checked',
      write: { kind: 'stepEnd', stepId: 2, atSeconds: 15 },
      checks: { 1: [true, true], 2: [true, false], 3: [true, true] },
    },
  ])('$name', ({ write, checks }) => {
    expect(checksOf(savedAfter(flagged, flagged, write))).toEqual(checks);
  });
});

describe('savedAfter', () => {
  const target = produce(saved, (draft) => {
    const changes: StudioChange[] = [
      { kind: 'songOrder', songIds: [2, 1] },
      {
        kind: 'songSettings',
        songId: 1,
        startSeconds: 2,
        endSeconds: 18,
        firstBeatSeconds: 1,
        tempoBpm: 100,
      },
      { kind: 'stepRemove', stepId: 2 },
      { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 12, lengthSeconds: 40 },
      { kind: 'stepName', stepId: -1, name: 'Sprung' },
      { kind: 'partAdd', partId: -3, firstStepId: -1, lastStepId: -1, name: 'B' },
      { kind: 'spotRemove', spotId: 31 },
      { kind: 'spotAdd', spotId: -4 },
      { kind: 'spotAssign', spotId: -4, person: lena },
      { kind: 'tracks', tracks: { [-4]: [keyframe] } },
      { kind: 'videoStart', videoId: 5, startSeconds: 3 },
      { kind: 'videoClip', videoId: 5, startSeconds: 1, endSeconds: 9 },
    ];
    for (const change of changes) {
      applyChange(draft, change);
    }
  });

  it('reaches the target once every planned write is done', () => {
    const reached = savePlanOf(saved, target).reduce(
      (document, write) => savedAfter(document, target, write),
      saved,
    );

    expect(sameValue(reached, target)).toBe(true);
  });

  it('leaves the rest unsaved when a save stops halfway', () => {
    const plan = savePlanOf(saved, target);
    const middle = Math.floor(plan.length / 2);
    const halfway = plan
      .slice(0, middle)
      .reduce((document, write) => savedAfter(document, target, write), saved);

    expect(savePlanOf(halfway, target)).toEqual(plan.slice(middle));
  });
});
