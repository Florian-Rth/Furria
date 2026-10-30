import { describe, expect, it } from 'vitest';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import type { Studio, StudioFinalTrack, StudioStep, StudioVideo } from '@/features/acts/schemas';
import {
  finalBeatAtOf,
  finalOffsetsOf,
  finalPlacesOf,
  finalPreviewOf,
  finalSecondsAt,
  mixSecondsAt,
  nudgedFinalBeatOf,
  offsetStartingAt,
  pendingFinalTrackOf,
  tunedOffsetOf,
  withFinalOffset,
} from './studio-final';

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
  firstBeatSeconds: null,
  tempoBpm: null,
});

const mix = [segmentOf(1, 10, 40, 0), segmentOf(2, 0, 30, 30)];
const offsets = { 1: -5, 2: 40 };

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
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: 'onTimeline',
});

const videoOf = (videoId: number, start: number): StudioVideo => ({
  videoId,
  mediaItemId: 70 + videoId,
  name: null,
  state: 'ready',
  durationSeconds: 10,
  startSeconds: start,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', compact: '/c', poster: '/p' },
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
    [[trackOf(1, 1, false)], 1],
    [[trackOf(1, 1, true), trackOf(2, 2, false)], 2],
    [[trackOf(1, 2, true), trackOf(2, 1, false)], null],
    [[trackOf(1, 1, true)], null],
  ])('picks the newer, not adopted final file of %j', (finalTracks, expected) => {
    expect(pendingFinalTrackOf(studioOf({ finalTracks }))?.finalTrackId ?? null).toBe(expected);
  });
});

describe('finalOffsetsOf', () => {
  it('keeps only the offsets of music that plays', () => {
    const track = {
      ...trackOf(1, 1, false),
      alignments: [
        { sourceMediaItemId: 1, offsetSeconds: -5 },
        { sourceMediaItemId: 7, offsetSeconds: 3 },
      ],
    };

    expect(finalOffsetsOf(track, mix)).toEqual({ 1: -5 });
  });
});

describe('position mapping', () => {
  it.each([
    [0, 5],
    [35, 45],
    [60, 70],
  ])('mix second %s lies at final second %s', (seconds, expected) => {
    expect(finalSecondsAt(mix, offsets, 70, seconds)).toBe(expected);
  });

  it('finds no final second for music the final file leaves out', () => {
    expect(finalSecondsAt(mix, { 2: 40 }, 70, 10)).toBeNull();
  });

  it.each([
    [5, 0],
    [45, 35],
    [2, null],
  ])('final second %s lies at mix second %s', (seconds, expected) => {
    expect(mixSecondsAt(mix, offsets, seconds)).toBe(expected);
  });
});

describe('finalPlacesOf', () => {
  it('places each song in the final file, clamped to its length', () => {
    expect(
      finalPlacesOf(mix, { 1: -5, 2: 45 }, 70).map((place) => [place.start, place.end]),
    ).toEqual([
      [5, 35],
      [45, 70],
    ]);
  });

  it('leaves a song unplaced when the final file ends before it begins', () => {
    expect(finalPlacesOf(mix, { 1: 60 }, 70)[0]).toMatchObject({ start: null, end: null });
  });

  it('leaves a song without offset unplaced', () => {
    expect(finalPlacesOf(mix, { 2: 40 }, 70)[0]).toMatchObject({ start: null, end: null });
  });
});

describe('offsets', () => {
  it.each([
    [1.234, 0.02, 1.254],
    [-5, -0.1, -5.1],
  ])('tunes %s by %s to %s', (offset, delta, expected) => {
    expect(tunedOffsetOf(offset, delta)).toBe(expected);
  });

  it('starts a song where the playhead stands', () => {
    expect(offsetStartingAt(segmentOf(1, 10, 40, 0), 12.5)).toBe(2.5);
  });
});

describe('finalPreviewOf', () => {
  const track = trackOf(1, 1, false);

  it('re-tiles the steps on the final file and loses those whose music is left out', () => {
    const studio = studioOf({
      steps: [stepOf(1, 0, 20), stepOf(2, 20, 35), stepOf(3, 35, 60)],
    });

    const preview = finalPreviewOf(studio, track, mix, { 1: -5 });

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

  it('keeps a video lead-in and loses videos whose music is left out', () => {
    const studio = studioOf({ videos: [videoOf(1, -2), videoOf(2, 35)] });

    const preview = finalPreviewOf(studio, track, mix, { 1: -5 });

    expect(preview.videos.map((video) => [video.startSeconds, video.placement])).toEqual([
      [3, 'onTimeline'],
      [null, 'musicMissing'],
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

    const preview = finalPreviewOf(studio, track, mix, { 1: -5 });

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

describe('final beat', () => {
  it.each([
    [12.34567, 12.346],
    [-1, 0],
    [80, 70],
  ])('puts the first one at %s as %s', (seconds, expected) => {
    expect(finalBeatAtOf(trackOf(1, 1, true), seconds)).toBe(expected);
  });

  it.each([
    [0.5, 0.02, 0.52],
    [null, 0.02, null],
  ])('nudges the first one at %s by %s to %s', (firstBeat, delta, expected) => {
    expect(nudgedFinalBeatOf({ ...trackOf(1, 1, true), firstBeatSeconds: firstBeat }, delta)).toBe(
      expected,
    );
  });
});

describe('withFinalOffset', () => {
  it('replaces the offset of the tuned song and keeps the others', () => {
    const track = {
      ...trackOf(1, 1, false),
      alignments: [
        { sourceMediaItemId: 1, offsetSeconds: -5 },
        { sourceMediaItemId: 2, offsetSeconds: 40 },
      ],
    };

    const patched = withFinalOffset(
      { studio: studioOf({ finalTracks: [track] }) },
      { finalTrackId: 1, sourceMediaItemId: 1, offsetSeconds: -4.9 },
    );

    expect(patched?.studio?.finalTracks[0]?.alignments).toEqual([
      { sourceMediaItemId: 2, offsetSeconds: 40 },
      { sourceMediaItemId: 1, offsetSeconds: -4.9 },
    ]);
  });
});
