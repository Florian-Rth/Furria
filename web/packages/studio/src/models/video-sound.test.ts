import type { StudioVideo } from '@furria/studio/studio-schemas';
import { soundClipOf, soundSegmentOf } from '@furria/studio/video-sound';
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
