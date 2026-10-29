import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { videoAt, videoCorrectionOf, videoSecondsAt } from './video-sync';

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

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: 'Schritt',
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
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

describe('videoAt', () => {
  const steps = [step(1, 0, 20), step(2, 20, 40)];
  const parts: StudioPart[] = [
    { partId: 1, name: 'Marsch', stepIds: [1], mainVideoId: 2, adrift: false },
    { partId: 2, name: 'Polka', stepIds: [2], mainVideoId: null, adrift: false },
  ];
  const videos = [
    video(1, { startSeconds: 0, durationSeconds: 40 }),
    video(2, { startSeconds: 5 }),
  ];

  it.each([
    [2, 1],
    [6, 2],
    [25, 1],
    [45, null],
  ])('shows at %s seconds video %s, the main video of the part first', (seconds, expected) => {
    expect(videoAt(videos, parts, steps, seconds)?.videoId ?? null).toBe(expected);
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
