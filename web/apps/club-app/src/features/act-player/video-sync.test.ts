import { describe, expect, it } from 'vitest';
import type { StudioVideo } from '@/features/acts/schemas';
import { videoCorrectionOf, videoSecondsAt } from './video-sync';

const video = (videoId: number, patch: Partial<StudioVideo> = {}): StudioVideo => ({
  videoId,
  mediaItemId: videoId,
  name: null,
  state: 'ready',
  durationSeconds: 20,
  startSeconds: 10,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', poster: '/p' },
  ...patch,
});

describe('videoSecondsAt', () => {
  it.each([
    [video(1), 15, 5],
    [video(1), 9, null],
    [video(1), 30, null],
    [video(1, { outdated: true }), 15, null],
    [video(1, { placement: 'unaligned', startSeconds: null }), 15, null],
  ])('shows %o at %s seconds of the music at %s', (shown, seconds, expected) => {
    expect(videoSecondsAt(shown, seconds)).toBe(expected);
  });
});

describe('videoCorrectionOf', () => {
  it('jumps to the music when the video is far off', () => {
    expect(videoCorrectionOf(10, 10.5, 1)).toEqual({ kind: 'seek', seconds: 10.5 });
  });

  it.each([
    [10, 10.01, 0.75, 0.75],
    [10, 10.1, 1, 1.05],
    [10, 9.8, 1, 0.92],
  ])(
    'follows the music from %s to %s at rate %s by playing at %s',
    (actual, target, rate, expected) => {
      const correction = videoCorrectionOf(actual, target, rate);

      expect(correction.kind === 'nudge' ? correction.playbackRate : null).toBeCloseTo(expected);
    },
  );
});
