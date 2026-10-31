import { describe, expect, it } from 'vitest';
import type { Studio, StudioFinalTrack, StudioPart, StudioStep } from '@/features/acts/schemas';
import type { BeatSection, MusicSegment } from './music-timeline';
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
  trainings: [],
  ...patch,
});

const gridOf = (firstBeatSeconds: number, tempoBpm: number): BeatSection[] => [
  { sourceStart: 0, sourceEnd: 1000, firstBeatSeconds, tempoBpm },
];

const segment = (patch: Partial<MusicSegment>): MusicSegment => ({
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
      fileName: 'Endfassung.mp3',
      firstBeatSeconds: null,
      tempoBpm: null,
      alignments: [],
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

describe('counts on an adopted final file', () => {
  const songOf = (
    mediaItemId: number,
    startSeconds: number,
    endSeconds: number,
    firstBeatSeconds: number,
    tempoBpm: number,
  ) => ({ ...song(mediaItemId, 0, startSeconds, endSeconds), firstBeatSeconds, tempoBpm });
  const finalOf = (alignments: StudioFinalTrack['alignments']): StudioFinalTrack => ({
    finalTrackId: 1,
    mediaItemId: 42,
    version: 1,
    adopted: true,
    state: 'ready',
    durationSeconds: 180,
    fileName: 'Endfassung.mp3',
    firstBeatSeconds: 0.2,
    tempoBpm: 100,
    alignments,
    urls,
  });
  const liveMix = musicSegmentsOf(
    studio({
      music: { lengthSeconds: 180, source: 'finalTrack' },
      songs: [songOf(3, 0, 60, 0.5, 120), songOf(4, 10, 70, 1, 96)],
      finalTracks: [
        finalOf([
          { sourceMediaItemId: 3, offsetSeconds: -2, stretch: 1 },
          { sourceMediaItemId: 4, offsetSeconds: 80, stretch: 0.98 },
        ]),
      ],
    }),
  );

  it.each([
    ['the first song, its intro cut away', 0, { count: 4, eight: 0 }],
    ['the first song on its own first beat', 2.5, { count: 1, eight: 1 }],
    ['the faster second song on its own first beat', 90.78, { count: 1, eight: 2 }],
    ['the gap between the songs on the file grid', 60, { count: 4, eight: 12 }],
    ['the end after the songs on the file grid', 150, { count: 2, eight: 31 }],
  ])('counts %s', (_, seconds, expected) => {
    expect(countAt(liveMix, seconds)).toEqual(expected);
  });

  it('marks the beats of the faster song at its own, stretched tempo', () => {
    const marks = countMarksOf(liveMix).filter((mark) => mark.seconds >= 90 && mark.seconds < 92);
    const gaps = marks.slice(1).map((mark, index) => mark.seconds - (marks[index]?.seconds ?? 0));

    expect(gaps.map((gap) => Math.round(gap * 10000) / 10000)).toEqual([0.6125, 0.6125]);
  });

  it('counts with the file grid alone when no song is aligned', () => {
    const plain = musicSegmentsOf(
      studio({ music: { lengthSeconds: 180, source: 'finalTrack' }, finalTracks: [finalOf([])] }),
    );

    expect(countAt(plain, 60)).toEqual({ count: 4, eight: 12 });
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
