import { describe, expect, it } from 'vitest';
import type { TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import type { StudioSong, StudioStep } from '@/features/acts/schemas';
import type { CutEdge, TimeSpan } from './studio-edits';
import { borderMovedOf, draggedPointOf, placedTrackOf, trimmedCutOf } from './studio-edits';

const step = (stepId: number, start: number, end: number): StudioStep => ({
  stepId,
  name: `S${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: 'onTimeline',
});

const key = (seconds: number, right: number, back: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres: right, backMetres: back },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

describe('borderMovedOf', () => {
  const steps = [step(1, 0, 4), step(2, 4, 8)];
  const marks = [0, 1, 2, 3, 4, 5, 6, 7].map((seconds) => ({ seconds, count: 1 }));

  it.each([
    [2.6, 3],
    [5.2, 5],
    [0.1, 1],
    [7.9, 7],
  ])('snaps the border dragged to %s onto the count at %s', (seconds, border) => {
    expect(borderMovedOf(steps, 1, seconds, marks)).toEqual({
      1: { start: 0, end: border },
      2: { start: border, end: 8 },
    });
  });

  it('keeps both neighbours at least half a second long', () => {
    expect(borderMovedOf(steps, 1, 0.2, [])).toEqual({
      1: { start: 0, end: 0.5 },
      2: { start: 0.5, end: 8 },
    });
  });

  it('moves nothing after the last step', () => {
    expect(borderMovedOf(steps, 2, 6, marks)).toEqual({});
  });
});

describe('placedTrackOf', () => {
  const track = [key(0, 0, 6), key(5, 0, 6), key(7, -4, 2), key(13, -4, 2), key(15, 1, 1)];

  it('moves the whole hold the step border belongs to', () => {
    const placed = placedTrackOf(track, 7, { rightMetres: 3, backMetres: 3 });

    expect(placed.map((keyframe) => keyframe.position.rightMetres)).toEqual([0, 0, 3, 3, 1]);
  });

  it('moves the opening hold before the first border', () => {
    const placed = placedTrackOf(track, 0, { rightMetres: 2, backMetres: 6 });

    expect(placed.map((keyframe) => keyframe.position.rightMetres)).toEqual([2, 2, -4, -4, 1]);
  });
});

describe('draggedPointOf', () => {
  const stage = { widthMetres: 10, depthMetres: 8 };

  it.each([
    [
      { x: 0.1, y: 0.1 },
      { rightMetres: -1, backMetres: 2.75 },
    ],
    [
      { x: -1, y: 1 },
      { rightMetres: 5, backMetres: 8 },
    ],
  ])('moves a dot by %o in the dancers view', (delta, point) => {
    expect(draggedPointOf({ rightMetres: 0, backMetres: 2 }, delta, stage)).toEqual(point);
  });
});

describe('trimmedCutOf', () => {
  const songOf = (firstBeat: number | null, tempo: number | null): StudioSong => ({
    songId: 1,
    mediaItemId: 10,
    position: 0,
    startSeconds: 10.25,
    endSeconds: 70.25,
    firstBeatSeconds: firstBeat,
    tempoBpm: tempo,
    state: 'ready',
    durationSeconds: 90,
    fileName: 'marsch.mp3',
    urls: { normalised: '/n', preview: '/p', peaks: '/k' },
  });
  const segment: MusicSegment = {
    mediaItemId: 10,
    audioUrl: '/n',
    peaksUrl: '/k',
    audible: true,
    sourceStart: 10.25,
    sourceEnd: 70.25,
    timelineStart: 0,
    timelineEnd: 60,
    firstBeatSeconds: 0.25,
    tempoBpm: 120,
  };

  it.each<[string, CutEdge, number, number | null, number | null, TimeSpan]>([
    [
      'snaps the start onto the nearest count',
      'start',
      4.1,
      0.25,
      120,
      { start: 14.25, end: 70.25 },
    ],
    ['snaps the end onto the nearest count', 'end', 50.43, 0.25, 120, { start: 10.25, end: 60.75 }],
    ['keeps an untouched start on its count', 'start', 0, 0.25, 120, { start: 10.25, end: 70.25 }],
    ['keeps an untouched end on its count', 'end', 60, 0.25, 120, { start: 10.25, end: 70.25 }],
    [
      'rounds to the millisecond without a beat',
      'start',
      4.12345,
      null,
      null,
      { start: 14.373, end: 70.25 },
    ],
    ['keeps the end inside the song', 'end', 95, 0.25, 120, { start: 10.25, end: 90 }],
    ['keeps the shortest cut', 'start', 59.9, 0.25, 120, { start: 68.25, end: 70.25 }],
  ])('%s', (_, edge, seconds, firstBeat, tempo, expected) => {
    expect(trimmedCutOf(songOf(firstBeat, tempo), segment, edge, seconds)).toEqual(expected);
  });
});
