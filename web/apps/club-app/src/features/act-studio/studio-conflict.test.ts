import type { JsonBody } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { Studio, StudioSong } from '@/features/acts/schemas';
import { choreographyConflictOf, overlapRowsOf } from './studio-conflict';

const audio = { normalised: 'https://x/n', preview: 'https://x/p', peaks: 'https://x/k' };

const song = (
  songId: number,
  mediaItemId: number,
  position: number,
  start: number,
): StudioSong => ({
  songId,
  mediaItemId,
  position,
  startSeconds: start,
  endSeconds: start + 20,
  firstBeatSeconds: null,
  tempoBpm: null,
  state: 'ready',
  durationSeconds: 60,
  fileName: `${songId}.mp3`,
  urls: audio,
});

const studio: Studio = {
  music: { lengthSeconds: 40, source: 'workingMix' },
  songs: [song(1, 11, 0, 0), song(2, 21, 1, 10)],
  finalTracks: [],
  steps: [],
  parts: [],
  spots: [
    { spotId: 30, number: 2, person: null },
    { spotId: 31, number: 1, person: null },
  ],
  videos: [],
  choreography: null,
  stage: null,
  evenings: [],
  trainings: [],
};

describe('choreographyConflictOf', () => {
  it.each<{ name: string; payload: JsonBody | null; found: boolean }>([
    { name: 'a plain refusal', payload: { errors: { conflict: ['x'] } }, found: false },
    { name: 'no overlaps', payload: { overlaps: [] }, found: false },
    { name: 'nothing', payload: null, found: false },
    {
      name: 'named overlaps',
      payload: { overlaps: [{ spotId: 30, keyframes: [{ sourceMediaItemId: 11, seconds: 2 }] }] },
      found: true,
    },
  ])('finds overlaps in $name: $found', ({ payload, found }) => {
    expect(choreographyConflictOf(payload) !== null).toBe(found);
  });
});

describe('overlapRowsOf', () => {
  it('names spots by number in stage order with their timeline seconds', () => {
    const rows = overlapRowsOf(
      {
        overlaps: [
          { spotId: 99, keyframes: [{ sourceMediaItemId: 11, seconds: 1 }] },
          {
            spotId: 30,
            keyframes: [
              { sourceMediaItemId: 21, seconds: 15 },
              { sourceMediaItemId: 11, seconds: 5 },
              { sourceMediaItemId: 21, seconds: 55 },
            ],
          },
          { spotId: 31, keyframes: [{ sourceMediaItemId: 11, seconds: 3 }] },
        ],
      },
      studio,
    );

    expect(rows).toEqual([
      { spotId: 31, spotNumber: 1, seconds: [3], unplaced: 0 },
      { spotId: 30, spotNumber: 2, seconds: [5, 25], unplaced: 1 },
      { spotId: 99, spotNumber: null, seconds: [1], unplaced: 0 },
    ]);
  });
});
