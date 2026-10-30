import { describe, expect, it } from 'vitest';
import type { Studio } from '@/features/acts/schemas';
import { setupProgressOf } from './setup-progress';

const urls = { normalised: '/a', preview: '/b', peaks: '/c' };

const empty: Studio = {
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

const song = {
  songId: 1,
  mediaItemId: 10,
  position: 0,
  startSeconds: 0,
  endSeconds: 30,
  firstBeatSeconds: 0,
  tempoBpm: 120,
  state: 'ready' as const,
  durationSeconds: 30,
  fileName: 'a.mp3',
  urls,
};

const finalTrack = (adopted: boolean) => ({
  finalTrackId: 1,
  mediaItemId: 11,
  version: 1,
  adopted,
  state: 'ready' as const,
  durationSeconds: 30,
  fileName: 'final.mp3',
  firstBeatSeconds: 0,
  tempoBpm: 120,
  alignments: [],
  urls,
});

const step = {
  stepId: 1,
  name: 'Einmarsch',
  description: null,
  startSeconds: 0,
  endSeconds: 8,
  placement: 'onTimeline' as const,
};

const spot = { spotId: 1, number: 1, person: null };

const keyframe = {
  sourceMediaItemId: 10,
  seconds: 0,
  position: { rightMetres: 0, backMetres: 2 },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
};

describe('setupProgressOf', () => {
  it('opens only music and places on an empty act', () => {
    const progress = setupProgressOf(empty);

    expect(progress.items.map((item) => item.state)).toEqual([
      'open',
      'locked',
      'open',
      'locked',
      'locked',
      'locked',
    ]);
    expect([progress.done, progress.next, progress.started]).toEqual([0, 'music', false]);
  });

  it('unlocks steps, video and final once music is there', () => {
    const progress = setupProgressOf({ ...empty, songs: [song] });

    expect(progress.items.map((item) => item.state)).toEqual([
      'done',
      'open',
      'open',
      'locked',
      'open',
      'open',
    ]);
    expect([progress.done, progress.next, progress.started]).toEqual([1, 'steps', true]);
  });

  it('waits on a final file that is not adopted yet', () => {
    const progress = setupProgressOf({
      ...empty,
      songs: [song],
      steps: [step],
      spots: [spot],
      choreography: { version: 1, tracks: [{ spotId: 1, keyframes: [keyframe] }] },
      videos: [
        {
          videoId: 1,
          mediaItemId: 12,
          name: null,
          state: 'ready',
          durationSeconds: 10,
          startSeconds: 0,
          placement: 'onTimeline',
          outdated: false,
          urls: { video: '/v', compact: '/c', poster: '/p' },
        },
      ],
      finalTracks: [finalTrack(false)],
    });

    expect(progress.items.at(-1)?.state).toBe('waiting');
    expect([progress.done, progress.next]).toEqual([5, 'final']);
  });

  it('counts an adopted final file as music and as done', () => {
    const progress = setupProgressOf({ ...empty, finalTracks: [finalTrack(true)] });

    expect([progress.items[0]?.state, progress.items[5]?.state]).toEqual(['done', 'done']);
  });
});
