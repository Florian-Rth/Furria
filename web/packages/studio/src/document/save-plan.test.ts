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
    1: { mediaItemId: 1, startSeconds: 0, endSeconds: 20, firstBeatSeconds: 0.5, tempoBpm: 120 },
    2: { mediaItemId: 2, startSeconds: 0, endSeconds: 20, firstBeatSeconds: null, tempoBpm: null },
  },
  steps: {
    1: { startSeconds: 0, endSeconds: 8, name: '' },
    2: { startSeconds: 8, endSeconds: 16, name: '' },
    3: { startSeconds: 16, endSeconds: 24, name: '' },
    4: { startSeconds: 24, endSeconds: 40, name: '' },
  },
  parts: { 10: { name: 'A', firstStepId: 1, lastStepId: 1, mainVideoId: null } },
  spotOrder: [31, 32],
  spots: { 31: { person: lena }, 32: { person: tom } },
  tracks: { 31: [keyframe] },
  videos: { 5: { name: null, startSeconds: null, clipStartSeconds: 0, clipEndSeconds: 30 } },
};

const empty: StudioDocument = { ...saved, steps: {}, parts: {} };

const halves: StudioDocument = {
  ...empty,
  songs: {
    1: { mediaItemId: 3, startSeconds: 0, endSeconds: 10, firstBeatSeconds: null, tempoBpm: null },
    2: { mediaItemId: 3, startSeconds: 10, endSeconds: 20, firstBeatSeconds: null, tempoBpm: null },
  },
};

const cutOf = (songId: number, startSeconds: number, endSeconds: number): StudioChange => ({
  kind: 'songSettings',
  songId,
  startSeconds,
  endSeconds,
  firstBeatSeconds: null,
  tempoBpm: null,
});

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
      case 'stepStart':
      case 'stepEnd':
        return `${write.kind} ${write.stepId}→${write.atSeconds}`;
      case 'stepAdd':
        return `stepAdd ${write.stepId} ${write.startSeconds}–${write.endSeconds}`;
      case 'spotAssign':
        return `spotAssign ${write.spotId}=${write.personId}`;
      case 'tracks':
        return `tracks ${write.tracks.map((track) => track.spotId).join(',')}`;
      case 'songSettings':
        return `songSettings ${write.songId}`;
      default:
        return write.kind;
    }
  });

describe('savePlanOf', () => {
  it('sends music first, removals before step spans and the choreography last', () => {
    expect(
      planned(
        saved,
        { kind: 'tracks', tracks: { 32: [keyframe] } },
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 20, lengthSeconds: 40 },
        { kind: 'stepMove', stepId: 3, atSeconds: 14 },
        { kind: 'stepRemove', stepId: 2 },
        { kind: 'songOrder', songIds: [2, 1] },
      ),
    ).toEqual([
      'songOrder',
      'stepRemove',
      'stepAdd -1 20–24',
      'stepEnd 1→14',
      'stepStart 3→14',
      'tracks 32',
    ]);
  });

  it.each<{ name: string; changes: StudioChange[]; writes: string[] }>([
    {
      name: 'shrinks before it grows when borders move later',
      changes: [
        { kind: 'stepMove', stepId: 3, atSeconds: 20 },
        { kind: 'stepMove', stepId: 4, atSeconds: 26 },
      ],
      writes: ['stepStart 3→20', 'stepStart 4→26', 'stepEnd 2→20', 'stepEnd 3→26'],
    },
    {
      name: 'shrinks before it grows when borders move earlier',
      changes: [
        { kind: 'stepMove', stepId: 3, atSeconds: 12 },
        { kind: 'stepMove', stepId: 2, atSeconds: 4 },
      ],
      writes: ['stepEnd 1→4', 'stepEnd 2→12', 'stepStart 2→4', 'stepStart 3→12'],
    },
    {
      name: 'splits one saved step twice, the later split first',
      changes: [
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 30, lengthSeconds: 40 },
        { kind: 'stepMark', stepId: -3, openingStepId: -4, atSeconds: 35, lengthSeconds: 40 },
      ],
      writes: ['stepAdd -3 35–40', 'stepAdd -1 30–35'],
    },
    {
      name: 'creates a step in music left without one',
      changes: [
        { kind: 'stepRemove', stepId: 1 },
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 2, lengthSeconds: 40 },
      ],
      writes: ['partRemove', 'stepRemove', 'stepAdd -1 2–8'],
    },
  ])('$name', ({ changes, writes }) => {
    expect(planned(saved, ...changes)).toEqual(writes);
  });

  it.each<{ name: string; changes: StudioChange[]; writes: string[] }>([
    {
      name: 'lets the later half of a file yield before the earlier one grows into it',
      changes: [cutOf(2, 12, 20), cutOf(1, 0, 11.5)],
      writes: ['songSettings 2', 'songSettings 1'],
    },
    {
      name: 'lets the earlier half of a file yield before the later one grows into it',
      changes: [cutOf(1, 0, 8), cutOf(2, 8, 20)],
      writes: ['songSettings 1', 'songSettings 2'],
    },
  ])('$name', ({ changes, writes }) => {
    expect(planned(halves, ...changes)).toEqual(writes);
  });

  it('moves the leading edge first when a step leaves its old span', () => {
    const tiled: StudioDocument = {
      ...saved,
      steps: {
        1: { startSeconds: 0, endSeconds: 10, name: '' },
        2: { startSeconds: 10, endSeconds: 20, name: '' },
        3: { startSeconds: 20, endSeconds: 30, name: '' },
      },
      parts: {},
    };

    expect(
      planned(
        tiled,
        { kind: 'stepMove', stepId: 2, atSeconds: 5 },
        { kind: 'stepMove', stepId: 3, atSeconds: 8 },
      ),
    ).toEqual(['stepEnd 1→5', 'stepStart 2→5', 'stepEnd 2→8', 'stepStart 3→8']);
  });

  it('opens an empty timeline with one create per step', () => {
    expect(
      planned(
        empty,
        { kind: 'stepMark', stepId: -1, openingStepId: -2, atSeconds: 8, lengthSeconds: 40 },
        { kind: 'stepMark', stepId: -3, openingStepId: -4, atSeconds: 16, lengthSeconds: 40 },
      ),
    ).toEqual(['stepAdd -2 0–8', 'stepAdd -1 8–16', 'stepAdd -3 16–40']);
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
