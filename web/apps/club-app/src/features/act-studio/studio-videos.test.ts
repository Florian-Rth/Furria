import { describe, expect, it } from 'vitest';
import type { Studio, StudioVideo } from '@/features/acts/schemas';
import {
  clampedVideoStartOf,
  needsAlignment,
  videoShelfOf,
  withoutVideo,
  withVideoStart,
} from './studio-videos';

const video = (patch: Partial<StudioVideo>): StudioVideo => ({
  videoId: 4,
  mediaItemId: 40,
  name: null,
  state: 'ready',
  durationSeconds: 30,
  startSeconds: null,
  placement: 'unaligned',
  outdated: false,
  urls: { video: '/v', compact: '/c', poster: '/p' },
  ...patch,
});

const studio = (videos: StudioVideo[]): { studio: Studio } => ({
  studio: {
    music: { lengthSeconds: 120, source: 'workingMix' },
    songs: [],
    finalTracks: [],
    steps: [],
    parts: [{ partId: 1, name: 'Marsch', stepIds: [], mainVideoId: 4, adrift: false }],
    spots: [],
    videos,
    choreography: null,
    stage: null,
    evenings: [],
    trainings: [],
  },
});

describe('clampedVideoStartOf', () => {
  it.each([
    [12.337, 12.35],
    [-3.21, -3.2],
    [-40, -29.95],
    [130, 119.95],
  ])('rounds and keeps %s touching the music', (start, result) => {
    expect(clampedVideoStartOf(start, 30, 120)).toBeCloseTo(result);
  });
});

describe('videoShelfOf', () => {
  it.each([
    [video({ state: 'processing' }), 'waiting'],
    [video({ state: 'failed' }), 'failed'],
    [video({}), 'unplaced'],
    [video({ placement: 'cutAway' }), 'unplaced'],
    [video({ placement: 'onTimeline', startSeconds: -2 }), 'placed'],
  ])('sorts the video onto its shelf', (candidate, shelf) => {
    expect(videoShelfOf(candidate)).toBe(shelf);
  });
});

describe('needsAlignment', () => {
  it.each([
    [video({}), true],
    [video({ state: 'processing' }), false],
    [video({ placement: 'onTimeline', startSeconds: 4 }), false],
    [video({ placement: 'musicMissing' }), false],
  ])('asks for an automatic place only once the unaligned video is ready', (candidate, asks) => {
    expect(needsAlignment(candidate)).toBe(asks);
  });
});

describe('optimistic video patches', () => {
  it('places the video on the music', () => {
    const placed = withVideoStart(studio([video({})]), { videoId: 4, startSeconds: 7.5 });

    expect(placed?.studio.videos[0]).toMatchObject({ startSeconds: 7.5, placement: 'onTimeline' });
  });

  it('frees the part whose main video is removed', () => {
    const removed = withoutVideo(studio([video({})]), 4);

    expect([removed?.studio.videos.length, removed?.studio.parts[0]?.mainVideoId]).toEqual([
      0,
      null,
    ]);
  });
});
