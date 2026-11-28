import { describe, expect, it } from 'vitest';
import type { BeatSection, MusicSegment } from './music-timeline';
import {
  countAt,
  countMarksOf,
  musicSegmentsOf,
  neighbourCountOf,
  partRangeOf,
  segmentAt,
  timelineSecondsOf,
} from './music-timeline';
import type { Studio, StudioPart, StudioStep } from './studio-schemas';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const song = (
  songId: number,
  mediaItemId: number,
  position: number,
  startSeconds: number,
  endSeconds: number,
) => ({
  songId,
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
  music: { lengthSeconds: 0 },
  songs: [],
  steps: [],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  ...patch,
});

const gridOf = (firstBeatSeconds: number, tempoBpm: number): BeatSection[] => [
  { sourceStart: 0, sourceEnd: 1000, firstBeatSeconds, tempoBpm },
];

const segment = (patch: Partial<MusicSegment>): MusicSegment => ({
  songId: 1,
  mediaItemId: 1,
  audioUrl: '/a',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 10,
  sourceEnd: 30,
  timelineStart: 0,
  timelineEnd: 20,
  beats: gridOf(0.5, 120),
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
    beats: gridOf(1, 60),
  }),
];

const step = (
  stepId: number,
  startSeconds: number | null,
  endSeconds: number | null,
): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  startSeconds,
  endSeconds,
  placement: startSeconds === null ? 'cutAway' : 'onTimeline',
  endPlacement: endSeconds === null ? 'cutAway' : 'onTimeline',
  startNeedsCheck: false,
  endNeedsCheck: false,
});

describe('musicSegmentsOf', () => {
  it('plays the songs in their order, each from its own cut, the halves of one file apart', () => {
    const segments = musicSegmentsOf(
      studio({
        songs: [song(12, 3, 2, 14.5, 20), song(11, 3, 0, 2, 10), song(13, 7, 1, 0, 5)],
      }),
    );

    expect(
      segments.map((placed) => [
        placed.songId,
        placed.mediaItemId,
        placed.sourceStart,
        placed.timelineStart,
        placed.timelineEnd,
      ]),
    ).toEqual([
      [11, 3, 2, 0, 8],
      [13, 7, 0, 8, 13],
      [12, 3, 14.5, 13, 18.5],
    ]);
  });
});

describe('timelineSecondsOf', () => {
  it.each([
    [{ sourceMediaItemId: 2, seconds: 15 }, 30],
    [{ sourceMediaItemId: 1, seconds: 31 }, null],
  ])('places %o at %s', (anchor, expected) => {
    expect(timelineSecondsOf(mix, anchor)).toBe(expected);
  });

  const halvesApart = [
    segment({ songId: 1, sourceStart: 0, sourceEnd: 10, timelineStart: 0, timelineEnd: 10 }),
    segment({ songId: 3, mediaItemId: 2, timelineStart: 10, timelineEnd: 30 }),
    segment({ songId: 2, sourceStart: 10, sourceEnd: 25, timelineStart: 30, timelineEnd: 45 }),
  ];

  it.each([
    ['the shared border to the later half', 10, 30],
    ['inside the later half', 12, 32],
    ['the end of the file in the later half', 25, 45],
    ['inside the earlier half', 4, 4],
  ])('places a moment of a file split in halves apart at %s', (_, seconds, expected) => {
    expect(timelineSecondsOf(halvesApart, { sourceMediaItemId: 1, seconds })).toBe(expected);
  });
});

describe('segmentAt', () => {
  it.each([
    [19.99, 1],
    [20, 2],
  ])('plays the song of %s seconds', (seconds, expected) => {
    expect(segmentAt(mix, seconds)?.mediaItemId ?? null).toBe(expected);
  });
});

describe('countAt', () => {
  it.each([
    [0.6, { count: 5, eight: 2 }],
    [20, { count: 5, eight: 0 }],
  ])('counts %s seconds as %o', (seconds, expected) => {
    expect(countAt(mix, seconds)).toEqual(expected);
  });

  it('counts a step stored a hair before its beat as that beat', () => {
    const tempo = segment({ sourceStart: 0, sourceEnd: 60, beats: gridOf(0, 126) });

    expect(countAt([tempo], 7.619)).toEqual({ count: 1, eight: 2 });
  });

  it.each([
    ['without a beat grid', segment({ beats: [] })],
    ['before the first beat', segment({ sourceStart: 0, sourceEnd: 20, beats: gridOf(2, 120) })],
  ])('has no count %s', (_, unbeaten) => {
    expect(countAt([unbeaten], 1)).toBeNull();
  });
});

describe('countMarksOf', () => {
  it('marks every beat inside the cut on the timeline with its count', () => {
    const marks = countMarksOf([
      segment({ sourceStart: 10, sourceEnd: 12, beats: gridOf(0.5, 120) }),
      segment({
        mediaItemId: 2,
        sourceStart: 0,
        sourceEnd: 1.5,
        timelineStart: 2,
        timelineEnd: 3.5,
        beats: gridOf(0, 60),
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
    firstStepId: stepIds[0] ?? 0,
    lastStepId: stepIds.at(-1) ?? 0,
    stepIds,
    mainVideoId: null,
    adrift: false,
  });
  const steps = [step(1, 0, 8), step(2, 8, 16), step(3, null, null)];

  it.each([
    [[2, 3], { start: 8, end: 16 }],
    [[3], null],
  ])('spans steps %o as %o', (stepIds, expected) => {
    expect(partRangeOf(part(stepIds), steps)).toEqual(expected);
  });
});

const NEIGHBOUR_MARKS = [
  { seconds: 1, count: 7 },
  { seconds: 1.5, count: 8 },
  { seconds: 2, count: 1 },
  { seconds: 2.5, count: 2 },
  { seconds: 3, count: 3 },
  { seconds: 3.5, count: 1 },
];

describe('neighbourCountOf', () => {
  it.each([
    [2.2, -1, 2],
    [3.5, 1, null],
  ] as const)('from %ss towards %i lands on %s', (seconds, direction, target) => {
    expect(neighbourCountOf(NEIGHBOUR_MARKS, seconds, direction)).toBe(target);
  });
});
