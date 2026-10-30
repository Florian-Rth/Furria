import { describe, expect, it } from 'vitest';
import type { Studio, StudioPart, StudioStep } from '@/features/acts/schemas';
import type { MusicSegment } from './music-timeline';
import {
  countAt,
  countMarksOf,
  musicSegmentsOf,
  partRangeOf,
  segmentAt,
  timelineSecondsOf,
} from './music-timeline';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const song = (mediaItemId: number, position: number, startSeconds: number, endSeconds: number) => ({
  songId: mediaItemId,
  mediaItemId,
  position,
  startSeconds,
  endSeconds,
  firstBeatSeconds: 0.5,
  tempoBpm: 120,
  state: 'ready' as const,
  durationSeconds: 90,
  fileName: 'song.mp3',
  urls,
});

const studio = (patch: Partial<Studio>): Studio => ({
  music: { lengthSeconds: 0, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  evenings: [],
  ...patch,
});

const segment = (patch: Partial<MusicSegment>): MusicSegment => ({
  mediaItemId: 1,
  audioUrl: '/a',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 10,
  sourceEnd: 30,
  timelineStart: 0,
  timelineEnd: 20,
  firstBeatSeconds: 0.5,
  tempoBpm: 120,
  ...patch,
});

const mix = [
  segment({}),
  segment({
    mediaItemId: 2,
    sourceStart: 5,
    sourceEnd: 15,
    timelineStart: 20,
    timelineEnd: 30,
    firstBeatSeconds: 1,
    tempoBpm: 60,
  }),
];

const step = (
  stepId: number,
  startSeconds: number | null,
  endSeconds: number | null,
): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: startSeconds === null ? 'cutAway' : 'onTimeline',
});

describe('musicSegmentsOf', () => {
  it('lays the songs back to back in their order, each cut to its start and end', () => {
    const segments = musicSegmentsOf(studio({ songs: [song(7, 1, 4, 10), song(3, 0, 10, 30)] }));

    expect(
      segments.map((placed) => [placed.mediaItemId, placed.timelineStart, placed.timelineEnd]),
    ).toEqual([
      [3, 0, 20],
      [7, 20, 26],
    ]);
  });

  it('plays only the adopted final track once one is adopted', () => {
    const track = (finalTrackId: number, adopted: boolean) => ({
      finalTrackId,
      mediaItemId: 40 + finalTrackId,
      version: finalTrackId,
      adopted,
      state: 'ready' as const,
      durationSeconds: 180,
      urls,
    });
    const segments = musicSegmentsOf(
      studio({
        music: { lengthSeconds: 180, source: 'finalTrack' },
        songs: [song(3, 0, 0, 60)],
        finalTracks: [track(1, false), track(2, true)],
      }),
    );

    expect(segments.map((placed) => [placed.mediaItemId, placed.timelineEnd])).toEqual([[42, 180]]);
  });
});

describe('timelineSecondsOf', () => {
  it.each([
    [{ sourceMediaItemId: 1, seconds: 12 }, 2],
    [{ sourceMediaItemId: 2, seconds: 15 }, 30],
    [{ sourceMediaItemId: 1, seconds: 31 }, null],
    [{ sourceMediaItemId: 9, seconds: 12 }, null],
  ])('places %o at %s', (anchor, expected) => {
    expect(timelineSecondsOf(mix, anchor)).toBe(expected);
  });
});

describe('segmentAt', () => {
  it.each([
    [0, 1],
    [19.99, 1],
    [20, 2],
    [30, null],
  ])('plays the song of %s seconds', (seconds, expected) => {
    expect(segmentAt(mix, seconds)?.mediaItemId ?? null).toBe(expected);
  });
});

describe('countAt', () => {
  it.each([
    [0, { count: 4, eight: 2 }],
    [0.6, { count: 5, eight: 2 }],
    [1, { count: 6, eight: 2 }],
    [20, { count: 5, eight: 0 }],
  ])('counts %s seconds as %o', (seconds, expected) => {
    expect(countAt(mix, seconds)).toEqual(expected);
  });

  it.each([
    ['without a beat grid', segment({ tempoBpm: null })],
    ['before the first beat', segment({ sourceStart: 0, sourceEnd: 20, firstBeatSeconds: 2 })],
  ])('has no count %s', (_, unbeaten) => {
    expect(countAt([unbeaten], 1)).toBeNull();
  });
});

describe('countMarksOf', () => {
  it('marks every beat inside the cut on the timeline with its count', () => {
    const marks = countMarksOf([
      segment({ sourceStart: 10, sourceEnd: 12, firstBeatSeconds: 0.5, tempoBpm: 120 }),
      segment({
        mediaItemId: 2,
        sourceStart: 0,
        sourceEnd: 1.5,
        timelineStart: 2,
        timelineEnd: 3.5,
        firstBeatSeconds: 0,
        tempoBpm: 60,
      }),
    ]);

    expect(marks).toEqual([
      { seconds: 0, count: 4 },
      { seconds: 0.5, count: 5 },
      { seconds: 1, count: 6 },
      { seconds: 1.5, count: 7 },
      { seconds: 2, count: 1 },
      { seconds: 3, count: 2 },
    ]);
  });
});

describe('partRangeOf', () => {
  const part = (stepIds: number[]): StudioPart => ({
    partId: 1,
    name: 'Marsch',
    stepIds,
    mainVideoId: null,
    adrift: false,
  });
  const steps = [step(1, 0, 8), step(2, 8, 16), step(3, null, null)];

  it.each([
    [[1, 2], { start: 0, end: 16 }],
    [[2, 3], { start: 8, end: 16 }],
    [[3], null],
  ])('spans steps %o as %o', (stepIds, expected) => {
    expect(partRangeOf(part(stepIds), steps)).toEqual(expected);
  });
});
