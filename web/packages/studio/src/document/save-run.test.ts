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
    1: { pieces: [{ startSeconds: 0, endSeconds: 20 }], firstBeatSeconds: 0.5, tempoBpm: 120 },
    2: { pieces: [{ startSeconds: 0, endSeconds: 20 }], firstBeatSeconds: null, tempoBpm: null },
  },
  steps: {
    1: { startSeconds: 0, endSeconds: 8, name: '' },
    2: { startSeconds: 8, endSeconds: 16, name: '' },
    3: { startSeconds: 16, endSeconds: 40, name: '' },
  },
  parts: { 10: { name: 'A', firstStepId: 2, lastStepId: 2, mainVideoId: null } },
  spotOrder: [31, 32],
  spots: { 31: { person: lena }, 32: { person: null } },
  tracks: { 31: [keyframe] },
  videos: { 5: { name: null, startSeconds: null, clipStartSeconds: 0, clipEndSeconds: 30 } },
  finalTracks: {
    40: {
      firstBeatSeconds: null,
      tempoBpm: null,
      alignments: { 1: [{ fromSeconds: 0, offsetSeconds: 0, stretch: 1 }] },
    },
  },
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
      { startSeconds: 16, endSeconds: 30, name: '' },
      { startSeconds: 30, endSeconds: 40, name: '' },
    ]);
  });
});

describe('savedAfter', () => {
  const target = produce(saved, (draft) => {
    const changes: StudioChange[] = [
      { kind: 'songOrder', songIds: [2, 1] },
      {
        kind: 'songSettings',
        songId: 1,
        pieces: [{ startSeconds: 2, endSeconds: 18 }],
        firstBeatSeconds: 1,
        tempoBpm: 100,
      },
      {
        kind: 'finalOffset',
        finalTrackId: 40,
        sourceMediaItemId: 1,
        fromSeconds: 0,
        untilSeconds: 20,
        offsetSeconds: 0.4,
        stretch: 1,
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
      {
        kind: 'finalOffset',
        finalTrackId: 40,
        sourceMediaItemId: 1,
        fromSeconds: 10,
        untilSeconds: 20,
        offsetSeconds: 3,
        stretch: 1,
      },
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
