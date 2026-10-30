import { describe, expect, it } from 'vitest';
import type { Studio, StudioFinalTrack, StudioSong } from '@/features/acts/schemas';
import { setupOf } from './lane-setup';

const urls = { normalised: 'a', preview: 'b', peaks: 'p' };

const emptyStudio: Studio = {
  music: { lengthSeconds: 0, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  evenings: [],
  trainings: [],
};

const song: StudioSong = {
  songId: 1,
  mediaItemId: 1,
  position: 0,
  startSeconds: 0,
  endSeconds: 60,
  firstBeatSeconds: 0,
  tempoBpm: 120,
  state: 'ready',
  durationSeconds: 60,
  fileName: 'a.mp3',
  urls,
};

const finalTrack: StudioFinalTrack = {
  finalTrackId: 1,
  mediaItemId: 2,
  version: 1,
  adopted: false,
  state: 'ready',
  durationSeconds: 60,
  fileName: 'b.mp3',
  firstBeatSeconds: null,
  tempoBpm: null,
  alignments: [],
  urls,
};

const person = { personId: 4, firstName: 'Lena', lastName: 'B', portrait: null };

const startedStudio: Studio = {
  ...emptyStudio,
  songs: [song],
  steps: [
    {
      stepId: 1,
      name: 'Einmarsch',
      description: null,
      startSeconds: 0,
      endSeconds: 8,
      placement: 'onTimeline',
    },
  ],
  spots: [
    { spotId: 1, number: 1, person },
    { spotId: 2, number: 2, person: null },
  ],
  choreography: {
    version: 1,
    tracks: [
      {
        spotId: 1,
        keyframes: [
          {
            sourceMediaItemId: 1,
            seconds: 0,
            position: { rightMetres: 0, backMetres: 0 },
            bend: null,
            easing: 'linear',
            facingDegrees: null,
          },
        ],
      },
      { spotId: 2, keyframes: [] },
    ],
  },
  finalTracks: [finalTrack],
};

describe('setupOf', () => {
  it('points an empty act at the music first', () => {
    const setup = setupOf(emptyStudio);
    expect(setup.rows.map((row) => row.state)).toEqual([
      'next',
      'open',
      'open',
      'open',
      'open',
      'open',
    ]);
    expect([setup.done, setup.started, setup.complete]).toEqual([0, false, false]);
  });

  it('counts what a started act already has', () => {
    const setup = setupOf(startedStudio);
    expect(setup.rows.map((row) => [row.key, row.state, row.amount, row.open])).toEqual([
      ['music', 'done', 1, 0],
      ['steps', 'done', 1, 0],
      ['spots', 'done', 2, 1],
      ['formation', 'done', 1, 1],
      ['video', 'next', 0, 0],
      ['final', 'open', 1, 1],
    ]);
    expect([setup.done, setup.started]).toEqual([4, true]);
  });

  it('is complete once the final file is adopted and a video exists', () => {
    const setup = setupOf({
      ...startedStudio,
      finalTracks: [{ ...finalTrack, adopted: true }],
      videos: [
        {
          videoId: 1,
          mediaItemId: 3,
          name: null,
          state: 'ready',
          durationSeconds: 10,
          startSeconds: 0,
          placement: 'onTimeline',
          outdated: false,
          urls: { video: 'v', compact: 'c', poster: 'p' },
        },
      ],
    });
    expect([setup.done, setup.complete]).toEqual([6, true]);
  });
});
