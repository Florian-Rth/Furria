import { describe, expect, it } from 'vitest';
import type { StudioVideo } from '@/features/acts/schemas';
import { nudgedShiftOf, stepClipsOf } from './studio-i-video';

const video = (videoId: number, startSeconds: number, durationSeconds: number): StudioVideo => ({
  videoId,
  mediaItemId: videoId + 10,
  name: null,
  state: 'ready',
  durationSeconds,
  startSeconds,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '', poster: '' },
});

const part = { partId: 1, name: 'Marsch', stepIds: [1], mainVideoId: 2, adrift: false };
const span = { stepId: 1, start: 10, end: 20 };

describe('stepClipsOf', () => {
  it('offers the videos covering the step, the part main video first', () => {
    const clips = stepClipsOf([video(1, 0, 15), video(2, 5, 30), video(3, 25, 5)], part, span);

    expect(clips.map((clip) => [clip.video.videoId, clip.role, clip.cover])).toEqual([
      [2, 'main', 'whole'],
      [1, 'alternative', 'partly'],
    ]);
  });

  it('skips outdated videos', () => {
    expect(stepClipsOf([{ ...video(2, 0, 30), outdated: true }], part, span)).toEqual([]);
  });
});

describe('nudgedShiftOf', () => {
  it.each([
    [0, 1, 0.04],
    [0.04, -1, 0],
    [-0.08, -1, -0.12],
  ] as const)('%d nudged %d → %d', (shift, direction, expected) => {
    expect(nudgedShiftOf(shift, direction, 0.04)).toBe(expected);
  });
});
