import type { MusicSegment } from '@furria/studio/music-timeline';
import {
  anchorPlacementOf,
  finalPlacementsOf,
  finalPlacesOf,
  finalPreviewOf,
  finalSecondsAt,
  mixSecondsAt,
  offsetStartingAt,
  pendingFinalTrackOf,
} from '@furria/studio/studio-final';
import type { Studio, StudioFinalTrack, StudioStep } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const segmentOf = (
  mediaItemId: number,
  sourceStart: number,
  sourceEnd: number,
  timelineStart: number,
): MusicSegment => ({
  mediaItemId,
  audioUrl: '/n',
  peaksUrl: '/k',
  audible: true,
  sourceStart,
  sourceEnd,
  timelineStart,
  timelineEnd: timelineStart + sourceEnd - sourceStart,
  beats: [],
});

const mix = [segmentOf(1, 10, 40, 0), segmentOf(2, 0, 30, 30)];
const placed = (offsetSeconds: number, stretch = 1) => [{ fromSeconds: 0, offsetSeconds, stretch }];
const placements = { 1: placed(-5), 2: placed(40) };

const trackOf = (finalTrackId: number, version: number, adopted: boolean): StudioFinalTrack => ({
  finalTrackId,
  mediaItemId: 90 + finalTrackId,
  version,
  adopted,
  state: 'ready',
  durationSeconds: 70,
  fileName: 'Endfassung.mp3',
  firstBeatSeconds: null,
  tempoBpm: null,
  alignments: [],
  urls,
});

const stepOf = (stepId: number, start: number, end: number): StudioStep => ({
  stepId,
  name: '',
  startSeconds: start,
  endSeconds: end,
  placement: 'onTimeline',
});

const studioOf = (patch: Partial<Studio>): Studio => ({
  music: { lengthSeconds: 60, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  ...patch,
});

describe('pendingFinalTrackOf', () => {
  it.each([
    [[trackOf(1, 1, true), trackOf(2, 2, false)], 2],
    [[trackOf(1, 2, true), trackOf(2, 1, false)], null],
  ])('picks the newer, not adopted final file of %j', (finalTracks, expected) => {
    expect(pendingFinalTrackOf(studioOf({ finalTracks }))?.finalTrackId ?? null).toBe(expected);
  });
});

describe('finalPlacementsOf', () => {
  it('keeps only the placements of music that plays', () => {
    const track = {
      ...trackOf(1, 1, false),
      alignments: [
        { sourceMediaItemId: 1, fromSeconds: 0, offsetSeconds: -5, stretch: 1 },
        { sourceMediaItemId: 7, fromSeconds: 0, offsetSeconds: 3, stretch: 1 },
      ],
    };

    expect(finalPlacementsOf(track, mix)).toEqual({ 1: placed(-5) });
  });
});

describe('pieces placed apart', () => {
  const pieces = [segmentOf(1, 10, 20, 0), segmentOf(1, 30, 40, 10)];
  const apart = {
    1: [
      { fromSeconds: 10, offsetSeconds: -10, stretch: 1 },
      { fromSeconds: 30, offsetSeconds: 20, stretch: 1 },
    ],
  };

  it.each([
    [5, 5],
    [15, 55],
  ])('mix second %s lies at final second %s', (seconds, expected) => {
    expect(finalSecondsAt(pieces, apart, 70, seconds)).toBe(expected);
  });

  it('places each piece by its own entry', () => {
    expect(finalPlacesOf(pieces, apart, 70).map((place) => [place.start, place.end])).toEqual([
      [0, 10],
      [50, 60],
    ]);
  });

  it.each([
    [{ sourceMediaItemId: 1, seconds: 25 }, -10],
    [{ sourceMediaItemId: 1, seconds: 45 }, 20],
    [{ sourceMediaItemId: 2, seconds: 5 }, null],
  ])('places the anchor %o by the entry with offset %s', (anchor, offset) => {
    expect(anchorPlacementOf(apart, pieces, anchor)?.offsetSeconds ?? null).toBe(offset);
  });
});

describe('position mapping', () => {
  it.each([
    [0, 5],
    [60, 70],
  ])('mix second %s lies at final second %s', (seconds, expected) => {
    expect(finalSecondsAt(mix, placements, 70, seconds)).toBe(expected);
  });

  it('finds no final second for music the final file leaves out', () => {
    expect(finalSecondsAt(mix, { 2: placed(40) }, 70, 10)).toBeNull();
  });

  it.each([
    [45, 35],
    [2, null],
  ])('final second %s lies at mix second %s', (seconds, expected) => {
    expect(mixSecondsAt(mix, placements, seconds)).toBe(expected);
  });

  it.each([
    [5, 4.7],
    [20, 19.4],
  ])('maps mix second %s of a song played faster to final second %s', (seconds, expected) => {
    expect(finalSecondsAt(mix, { 1: placed(-10, 0.98), 2: placed(40) }, 70, seconds)).toBeCloseTo(
      expected,
    );
  });

  it('maps a final second of a song played faster back to its mix second', () => {
    expect(mixSecondsAt(mix, { 1: placed(-10, 0.98) }, 19.4)).toBeCloseTo(20);
  });
});

describe('finalPlacesOf', () => {
  it('places each song in the final file, clamped to its length', () => {
    expect(
      finalPlacesOf(mix, { 1: placed(-5), 2: placed(45) }, 70).map((place) => [
        place.start,
        place.end,
      ]),
    ).toEqual([
      [5, 35],
      [45, 70],
    ]);
  });

  it('places a song played faster over its shorter span', () => {
    expect(
      finalPlacesOf(mix, { 1: placed(-10, 0.98) }, 70).map((place) => [place.start, place.end]),
    ).toEqual([
      [0, -10 + 40 * 0.98],
      [null, null],
    ]);
  });
});

describe('offsets', () => {
  it('starts a song where the playhead stands', () => {
    expect(offsetStartingAt(segmentOf(1, 10, 40, 0), 12.5, 1)).toBe(2.5);
    expect(offsetStartingAt(segmentOf(1, 10, 40, 0), 12.5, 0.98)).toBe(2.7);
  });
});

describe('finalPreviewOf', () => {
  const track = trackOf(1, 1, false);

  it('re-tiles the steps on the final file and loses those whose music is left out', () => {
    const studio = studioOf({
      steps: [stepOf(1, 0, 20), stepOf(2, 20, 35), stepOf(3, 35, 60)],
    });

    const preview = finalPreviewOf(studio, track, mix, { 1: placed(-5) });

    expect(
      preview.steps.map((step) => [
        step.stepId,
        step.startSeconds,
        step.endSeconds,
        step.placement,
      ]),
    ).toEqual([
      [1, 0, 25, 'onTimeline'],
      [2, 25, 70, 'onTimeline'],
      [3, null, null, 'musicMissing'],
    ]);
  });

  it('moves keyframes onto the final file and plays it', () => {
    const keyframe = {
      position: { rightMetres: 0, backMetres: 1 },
      bend: null,
      easing: 'linear' as const,
      facingDegrees: null,
    };
    const studio = studioOf({
      finalTracks: [track],
      choreography: {
        version: 1,
        tracks: [
          {
            spotId: 1,
            keyframes: [
              { ...keyframe, sourceMediaItemId: 1, seconds: 12 },
              { ...keyframe, sourceMediaItemId: 2, seconds: 3 },
            ],
          },
        ],
      },
    });

    const preview = finalPreviewOf(studio, track, mix, { 1: placed(-5) });

    expect(
      preview.choreography?.tracks[0]?.keyframes.map((moved) => [
        moved.sourceMediaItemId,
        moved.seconds,
      ]),
    ).toEqual([
      [91, 7],
      [2, 3],
    ]);
    expect([preview.music, preview.finalTracks[0]?.adopted]).toEqual([
      { lengthSeconds: 70, source: 'finalTrack' },
      true,
    ]);
  });
});
