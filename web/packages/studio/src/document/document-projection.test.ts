import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import type { Studio } from '../models/studio-schemas';
import { documentOf, studioOf } from './document-projection';
import type { StudioChange } from './studio-changes';
import { applyChange } from './studio-changes';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const song = (songId: number, position: number, startSeconds: number, endSeconds: number) => ({
  songId,
  mediaItemId: songId,
  position,
  pieces: [{ startSeconds, endSeconds }],
  firstBeatSeconds: 0.5,
  tempoBpm: 120,
  state: 'ready' as const,
  durationSeconds: 90,
  fileName: 'song.mp3',
  urls,
});

const step = (stepId: number, startSeconds: number, endSeconds: number) => ({
  stepId,
  name: '',
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline' as const,
});

const base: Studio = {
  music: { lengthSeconds: 30, source: 'workingMix' },
  songs: [song(1, 0, 10, 30), song(2, 1, 0, 10)],
  finalTracks: [],
  steps: [step(11, 0, 8), step(12, 8, 16), step(13, 16, 30)],
  parts: [
    { partId: 21, name: 'A', stepIds: [11], mainVideoId: null, adrift: false },
    { partId: 22, name: 'B', stepIds: [12, 13], mainVideoId: null, adrift: false },
  ],
  spots: [
    { spotId: 31, number: 1, person: null },
    { spotId: 32, number: 2, person: null },
  ],
  videos: [],
  choreography: { version: 4, tracks: [{ spotId: 32, keyframes: [] }] },
  stage: null,
};

const projected = (...changes: StudioChange[]): Studio =>
  studioOf(
    base,
    produce(documentOf(base), (draft) => {
      for (const change of changes) {
        applyChange(draft, change);
      }
    }),
  );

describe('studioOf', () => {
  it('gives back the studio it was made from', () => {
    expect(projected()).toEqual(base);
  });

  it('lets a marked step join the part it splits', () => {
    const studio = projected({
      kind: 'stepMark',
      stepId: -1,
      openingStepId: -2,
      atSeconds: 20,
      lengthSeconds: 40,
    });

    expect([
      studio.steps.map((known) => [known.stepId, known.startSeconds, known.endSeconds]),
      studio.parts.map((part) => part.stepIds),
    ]).toEqual([
      [
        [11, 0, 8],
        [12, 8, 16],
        [13, 16, 20],
        [-1, 20, 30],
      ],
      [[11], [12, 13, -1]],
    ]);
  });

  it('hands the steps of a removed part to the part before', () => {
    const studio = projected({ kind: 'partRemove', partId: 22 });

    expect(studio.parts.map((part) => [part.partId, part.stepIds])).toEqual([[21, [11, 12, 13]]]);
  });

  it('starts the timeline at zero after the first step is removed', () => {
    const studio = projected({ kind: 'stepRemove', stepId: 11 });

    expect(studio.steps.map((known) => [known.stepId, known.startSeconds])).toEqual([
      [12, 0],
      [13, 16],
    ]);
  });

  it('numbers spots by their order after a removal', () => {
    const studio = projected({ kind: 'spotRemove', spotId: 31 }, { kind: 'spotAdd', spotId: -1 });

    expect([
      studio.spots.map((spot) => [spot.spotId, spot.number]),
      studio.choreography?.tracks.map((track) => track.spotId),
    ]).toEqual([
      [
        [32, 1],
        [-1, 2],
      ],
      [32],
    ]);
  });

  it('follows song cuts and order with the music length and positions', () => {
    const studio = projected(
      {
        kind: 'songSettings',
        songId: 1,
        pieces: [{ startSeconds: 10, endSeconds: 20 }],
        firstBeatSeconds: 0.5,
        tempoBpm: 120,
      },
      { kind: 'songOrder', songIds: [2, 1] },
    );

    expect([
      studio.music.lengthSeconds,
      studio.songs.map((known) => [known.songId, known.position]),
      studio.steps.at(-1)?.endSeconds,
    ]).toEqual([
      20,
      [
        [1, 1],
        [2, 0],
      ],
      20,
    ]);
  });
});
