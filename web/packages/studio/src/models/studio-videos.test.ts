import type { StudioVideo } from '@furria/studio/studio-schemas';
import { clampedVideoStartOf, clipSpanOf } from '@furria/studio/studio-videos';
import { describe, expect, it } from 'vitest';

const video = (patch: Partial<StudioVideo>): StudioVideo => ({
  videoId: 4,
  mediaItemId: 40,
  name: null,
  state: 'ready',
  durationSeconds: 30,
  clipStartSeconds: 0,
  clipEndSeconds: 30,
  startSeconds: null,
  placement: 'unaligned',
  outdated: false,
  urls: { video: '/v', compact: '/c', poster: '/p', peaks: '/k' },
  ...patch,
});

describe('clampedVideoStartOf', () => {
  it.each([
    [-40, -29.95],
    [130, 119.95],
  ])('rounds and keeps %s touching the music', (start, result) => {
    expect(clampedVideoStartOf(start, { startSeconds: 0, endSeconds: 30 }, 120)).toBeCloseTo(
      result,
    );
  });
});

describe('clipSpanOf', () => {
  it.each([
    [video({ startSeconds: 5, clipStartSeconds: 2, clipEndSeconds: 8 }), { start: 7, end: 13 }],
    [video({ startSeconds: 5, clipEndSeconds: null }), null],
  ])('places the clip of %o on the music', (candidate, span) => {
    expect(clipSpanOf(candidate)).toEqual(span);
  });
});
