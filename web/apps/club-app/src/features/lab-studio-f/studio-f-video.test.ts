import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { stepVideoOf } from './studio-f-video';

const video = (
  videoId: number,
  startSeconds: number,
  durationSeconds: number,
  patch: Partial<StudioVideo> = {},
): StudioVideo => ({
  videoId,
  mediaItemId: videoId + 100,
  name: null,
  state: 'ready',
  durationSeconds,
  startSeconds,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', poster: '/p' },
  ...patch,
});

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: 'Schritt',
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const parts: StudioPart[] = [
  { partId: 1, name: 'Marsch', stepIds: [1, 2], mainVideoId: 2, adrift: false },
  { partId: 2, name: 'Finale', stepIds: [3], mainVideoId: null, adrift: false },
];

describe('stepVideoOf', () => {
  it.each([
    [
      'the part video when it covers part of the step',
      [video(1, 0, 60), video(2, 5, 10)],
      step(1, 0, 8),
      2,
    ],
    [
      'the widest cover when the part video misses the step',
      [video(1, 0, 5), video(3, 4, 30), video(2, 50, 10)],
      step(2, 0, 20),
      3,
    ],
    ['nothing when no video reaches the step', [video(1, 0, 10)], step(3, 20, 30), null],
    [
      'nothing from an outdated video',
      [video(1, 0, 60, { outdated: true })],
      step(3, 20, 30),
      null,
    ],
  ])('picks %s', (_case, videos, candidate, expected) => {
    expect(stepVideoOf(videos, parts, candidate)?.videoId ?? null).toBe(expected);
  });

  it('has no video without a step', () => {
    expect(stepVideoOf([video(1, 0, 60)], parts, null)).toBeNull();
  });
});
