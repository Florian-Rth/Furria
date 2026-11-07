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
    1: { startSeconds: 0, name: '' },
    2: { startSeconds: 8, name: '' },
    3: { startSeconds: 16, name: '' },
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
      write: {
        kind: 'partSettings',
        partId: 10,
        name: 'A',
        firstStepId: -1,
        lastStepId: -1,
        mainVideoId: null,
      },
      sent: {
        kind: 'partSettings',
        partId: 10,
        name: 'A',
        firstStepId: 77,
        lastStepId: 77,
        mainVideoId: null,
      },
    },
    {
      write: { kind: 'tracks', tracks: [{ spotId: -2, keyframes: [] }] },
      sent: { kind: 'tracks', baseVersion: 4, tracks: [{ spotId: 88, keyframes: [] }] },
    },
    { write: { kind: 'stepMove', stepId: -9, atSeconds: 3 }, sent: null },
    {
      write: { kind: 'spotAssign', spotId: 31, personId: 7 },
      sent: { kind: 'spotAssign', spotId: 95, personId: 7 },
    },
    { write: { kind: 'spotAssign', spotId: -9, personId: 7 }, sent: null },
  ])('resolves $write.kind', ({ write, sent }) => {
    expect(serverWriteOf(write, known, 4)).toEqual(sent);
  });
});

describe('idsLearnedFrom', () => {
  it.each<{
    name: string;
    openingStepId: number | null;
    created: number[];
    ids: number[][];
    strays: number[];
  }>([
    { name: 'a plain mark', openingStepId: null, created: [70], ids: [[-1, 70]], strays: [] },
    {
      name: 'a mark that opens the timeline',
      openingStepId: -2,
      created: [69, 70],
      ids: [
        [-1, 70],
        [-2, 69],
      ],
      strays: [],
    },
    {
      name: 'an opening nobody asked for',
      openingStepId: null,
      created: [69, 70],
      ids: [[-1, 70]],
      strays: [69],
    },
  ])('learns $name', ({ openingStepId, created, ids, strays }) => {
    const learned = idsLearnedFrom(
      { kind: 'stepMark', stepId: -1, openingStepId, atSeconds: 8 },
      { kind: 'created', ids: created },
      NO_IDS,
    );

    expect([[...learned.ids.steps], learned.strayStepIds]).toEqual([ids, strays]);
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
