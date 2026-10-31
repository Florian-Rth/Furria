import { describe, expect, it } from 'vitest';
import type { Studio, StudioStep, StudioVideo } from '@/features/acts/schemas';
import type { TakeGroup } from './studio-videos';
import {
  clampedVideoStartOf,
  needsAlignment,
  takeGroupsOf,
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

describe('takeGroupsOf', () => {
  const placedVideo = (videoId: number, startSeconds: number): StudioVideo =>
    video({ videoId, startSeconds, durationSeconds: 10, placement: 'onTimeline' });
  const stepOf = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
    stepId,
    name: '',
    description: null,
    startSeconds,
    endSeconds,
    placement: 'onTimeline',
  });
  const steps = [stepOf(1, 0, 20), stepOf(2, 20, 60)];
  const takes = [placedVideo(1, 2), placedVideo(2, 5), placedVideo(3, 45)];
  const groupIdsOf = (groups: TakeGroup[]): [number | null, number[]][] =>
    groups.map((group) => [group.part?.partId ?? null, group.takes.map((take) => take.videoId)]);

  it('lists every placed video in one group when the act has no parts', () => {
    expect(groupIdsOf(takeGroupsOf([], steps, takes))).toEqual([[null, [1, 2, 3]]]);
  });

  it('puts the main video first and gathers videos outside every part', () => {
    const parts = [{ partId: 7, name: 'Marsch', stepIds: [1], mainVideoId: 2, adrift: false }];

    expect(groupIdsOf(takeGroupsOf(parts, steps, takes))).toEqual([
      [7, [2, 1]],
      [null, [3]],
    ]);
  });
});
