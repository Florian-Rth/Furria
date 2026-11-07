import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import { savePlanOf } from './save-plan';
import type { StudioChange } from './studio-changes';
import { applyChange } from './studio-changes';
import type { StudioDocument } from './studio-document';

const lena = { personId: 7, firstName: 'Lena', lastName: 'Berg', portrait: null };
const tom = { personId: 8, firstName: 'Tom', lastName: 'Kern', portrait: null };

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
    4: { startSeconds: 24, name: '' },
  },
  parts: { 10: { name: 'A', firstStepId: 1, lastStepId: 1, mainVideoId: null } },
  spotOrder: [31, 32],
  spots: { 31: { person: lena }, 32: { person: tom } },
  tracks: { 31: [keyframe] },
  videos: { 5: { name: null, startSeconds: null, clipStartSeconds: 0, clipEndSeconds: 30 } },
  finalTracks: {},
};

const empty: StudioDocument = { ...saved, steps: {}, parts: {} };

const planned = (from: StudioDocument, ...changes: StudioChange[]): string[] =>
  savePlanOf(
    from,
    produce(from, (draft) => {
      for (const change of changes) {
        applyChange(draft, change);
      }
    }),
  ).map((write) => {
    switch (write.kind) {
      case 'stepMove':
        return `stepMove ${write.stepId}→${write.atSeconds}`;
      case 'stepMark':
        return `stepMark ${write.stepId}@${write.atSeconds} opening ${write.openingStepId}`;
      case 'spotAssign':
        return `spotAssign ${write.spotId}=${write.personId}`;
      case 'tracks':
        return `tracks ${write.tracks.map((track) => track.spotId).join(',')}`;
      default:
        return write.kind;
    }
  });

describe('savePlanOf', () => {
  it('plans nothing for an unchanged document', () => {
    expect(planned(saved)).toEqual([]);
  });

  it('sends music first, removals before moves, marks after moves and the choreography last', () => {
    expect(
      planned(
        saved,
        { kind: 'tracks', tracks: { 32: [keyframe] } },
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 20, lengthSeconds: 40 },
        { kind: 'stepMove', stepId: 3, atSeconds: 14, lengthSeconds: 40 },
        { kind: 'stepRemove', stepId: 2 },
        { kind: 'songOrder', songIds: [2, 1] },
      ),
    ).toEqual([
      'songOrder',
      'stepRemove',
      'stepMove 3→14',
      'stepMark -1@20 opening null',
      'tracks 32',
    ]);
  });

  it('moves later steps from the back and earlier steps from the front', () => {
    expect(
      planned(
        saved,
        { kind: 'stepMove', stepId: 3, atSeconds: 20, lengthSeconds: 40 },
        { kind: 'stepMove', stepId: 4, atSeconds: 26, lengthSeconds: 40 },
      ),
    ).toEqual(['stepMove 4→26', 'stepMove 3→20']);
    expect(
      planned(
        saved,
        { kind: 'stepMove', stepId: 3, atSeconds: 12, lengthSeconds: 40 },
        { kind: 'stepMove', stepId: 2, atSeconds: 4, lengthSeconds: 40 },
      ),
    ).toEqual(['stepMove 2→4', 'stepMove 3→12']);
  });

  it('lets the first mark on an empty timeline open it', () => {
    expect(
      planned(
        empty,
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 8, lengthSeconds: 40 },
        { kind: 'stepMark', stepId: -3, openingStepId: -4, atSeconds: 16, lengthSeconds: 40 },
      ),
    ).toEqual(['stepMark -1@8 opening -2', 'stepMark -3@16 opening null']);
  });

  it('names a new step and opens a part on it with its main video', () => {
    expect(
      planned(
        saved,
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 20, lengthSeconds: 40 },
        { kind: 'stepName', stepId: -1, name: 'Sprung' },
        { kind: 'partAdd', partId: -3, firstStepId: -1, lastStepId: -1, name: 'B' },
        {
          kind: 'partSettings',
          partId: -3,
          name: 'B',
          firstStepId: -1,
          lastStepId: -1,
          mainVideoId: 5,
        },
      ),
    ).toEqual(['stepMark -1@20 opening null', 'stepName', 'partAdd', 'partSettings']);
  });

  it('shrinks parts before others grow into the freed steps', () => {
    const withParts: StudioDocument = {
      ...saved,
      parts: {
        10: { name: 'A', firstStepId: 1, lastStepId: 1, mainVideoId: null },
        11: { name: 'B', firstStepId: 2, lastStepId: 3, mainVideoId: null },
      },
    };

    expect(
      savePlanOf(withParts, {
        ...withParts,
        parts: {
          10: { name: 'A', firstStepId: 1, lastStepId: 2, mainVideoId: null },
          11: { name: 'B', firstStepId: 3, lastStepId: 3, mainVideoId: null },
          12: { name: 'C', firstStepId: 4, lastStepId: 4, mainVideoId: null },
        },
      }).map((write) =>
        write.kind === 'partSettings' || write.kind === 'partAdd'
          ? `${write.kind} ${write.partId}`
          : null,
      ),
    ).toEqual(['partSettings 11', 'partAdd 12', 'partSettings 10']);
  });

  it('swaps two holders with one assignment each', () => {
    expect(
      planned(
        saved,
        { kind: 'spotAssign', spotId: 31, person: tom },
        { kind: 'spotAssign', spotId: 32, person: lena },
      ),
    ).toEqual(['spotAssign 31=8', 'spotAssign 32=7']);
  });

  it('removes a spot without saving its track and adds new spots before their holders', () => {
    expect(
      planned(
        saved,
        { kind: 'spotRemove', spotId: 31 },
        { kind: 'spotAdd', spotId: -1 },
        { kind: 'spotAssign', spotId: -1, person: lena },
        { kind: 'tracks', tracks: { [-1]: [keyframe] } },
      ),
    ).toEqual(['spotRemove', 'spotAdd', 'spotAssign -1=7', 'tracks -1']);
  });

  it('saves only the final alignment of the piece that moved', () => {
    const aligned: StudioDocument = {
      ...saved,
      finalTracks: {
        40: {
          firstBeatSeconds: null,
          tempoBpm: null,
          alignments: {
            1: [
              { fromSeconds: 0, offsetSeconds: 2, stretch: 1 },
              { fromSeconds: 20, offsetSeconds: 5, stretch: 1 },
            ],
          },
        },
      },
    };
    const target = produce(aligned, (draft) => {
      applyChange(draft, {
        kind: 'finalOffset',
        finalTrackId: 40,
        sourceMediaItemId: 1,
        fromSeconds: 20,
        untilSeconds: 30,
        offsetSeconds: 6,
        stretch: 1,
      });
    });

    expect(savePlanOf(aligned, target)).toEqual([
      {
        kind: 'finalOffset',
        finalTrackId: 40,
        sourceMediaItemId: 1,
        fromSeconds: 20,
        offsetSeconds: 6,
        stretch: 1,
      },
    ]);
  });

  it.each<[string, StudioChange[], string[]]>([
    [
      'clips a video',
      [{ kind: 'videoClip', videoId: 5, startSeconds: 2, endSeconds: 12 }],
      ['videoClip'],
    ],
    [
      'saves a clip cut back to where it was',
      [
        { kind: 'videoClip', videoId: 5, startSeconds: 2, endSeconds: 12 },
        { kind: 'videoClip', videoId: 5, startSeconds: 0, endSeconds: 30 },
      ],
      [],
    ],
    [
      'saves a split song',
      [
        {
          kind: 'songSettings',
          songId: 1,
          pieces: [
            { startSeconds: 0, endSeconds: 8 },
            { startSeconds: 8, endSeconds: 20 },
          ],
          firstBeatSeconds: 0.5,
          tempoBpm: 120,
        },
      ],
      ['songSettings'],
    ],
  ])('%s', (_, changes, writes) => {
    expect(planned(saved, ...changes)).toEqual(writes);
  });

  it('sends nothing for edits undone before saving', () => {
    expect(
      planned(
        saved,
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 20, lengthSeconds: 40 },
        { kind: 'stepRemove', stepId: -1 },
        { kind: 'videoName', videoId: 5, name: 'Probe' },
        { kind: 'videoName', videoId: 5, name: null },
      ),
    ).toEqual([]);
  });
});
