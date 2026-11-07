import type { StudioVideo } from '@furria/studio/studio-schemas';
import { soundClipOf, soundSegmentOf, videoStartOfDrag } from '@furria/studio/video-sound';
import { describe, expect, it } from 'vitest';

const video = (patch: Partial<StudioVideo>): StudioVideo => ({
  videoId: 4,
  mediaItemId: 40,
  name: null,
  state: 'ready',
  durationSeconds: 30,
  clipStartSeconds: 0,
  clipEndSeconds: 30,
  startSeconds: 10,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', compact: '/c', poster: '/p', peaks: '/k' },
  ...patch,
});

describe('soundClipOf', () => {
  it.each([
    [
      { clipStartSeconds: 4, clipEndSeconds: 20 },
      { startSeconds: 4, endSeconds: 20 },
    ],
    [
      { clipEndSeconds: null, durationSeconds: 25 },
      { startSeconds: 0, endSeconds: 25 },
    ],
    [{ clipEndSeconds: null, durationSeconds: null }, null],
  ])('takes the playing piece of %o', (patch, clip) => {
    expect(soundClipOf(video(patch))).toEqual(clip);
  });
});

describe('soundSegmentOf', () => {
  it('lays the trimmed soundtrack where the video plays against the music', () => {
    const segment = soundSegmentOf(video({}), { startSeconds: 4, endSeconds: 20 }, 10);

    expect(segment).toMatchObject({
      mediaItemId: 40,
      sourceStart: 4,
      sourceEnd: 20,
      timelineStart: 14,
      timelineEnd: 30,
    });
  });
});

describe('videoStartOfDrag', () => {
  it.each([
    [14, 10],
    [14.337, 10.35],
    [-50, -19.95],
    [200, 115.95],
  ])('turns the dragged lane start %s into the video start %s', (spanStart, start) => {
    expect(videoStartOfDrag(spanStart, { startSeconds: 4, endSeconds: 20 }, 120)).toBeCloseTo(
      start,
    );
  });
});
