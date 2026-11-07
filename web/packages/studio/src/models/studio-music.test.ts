import type { MusicSegment } from '@furria/studio/music-timeline';
import {
  deskSegmentIndexOf,
  firstBeatAtOf,
  keptPositionOf,
  movedOrderOf,
  nudgedFirstBeatOf,
  outsideMusicOf,
  startInOrderOf,
  steppedTempoOf,
} from '@furria/studio/studio-music';
import type { Studio, StudioSong } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';

const songOf = (songId: number, position: number, firstBeat: number | null = 0.5): StudioSong => ({
  songId,
  mediaItemId: songId * 10,
  position,
  pieces: [{ startSeconds: 10, endSeconds: 70 }],
  firstBeatSeconds: firstBeat,
  tempoBpm: 120,
  state: 'ready',
  durationSeconds: 90,
  fileName: `song-${songId}.mp3`,
  urls: { normalised: '/n', preview: '/p', peaks: '/k' },
});

const segment: MusicSegment = {
  mediaItemId: 10,
  audioUrl: '/n',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 10,
  sourceEnd: 70,
  timelineStart: 30,
  timelineEnd: 90,
  beats: [{ sourceStart: 10, sourceEnd: 70, firstBeatSeconds: 0.5, tempoBpm: 120 }],
};

describe('movedOrderOf', () => {
  const songs = [songOf(3, 2), songOf(1, 0), songOf(2, 1)];

  it.each([
    [0, 2, [2, 3, 1]],
    [2, 0, [3, 1, 2]],
    [1, 0, [2, 1, 3]],
    [1, 1, null],
    [3, 0, null],
    [0, 3, null],
    [0, -1, null],
    [-1, 0, null],
  ] as const)('moves the song at %s to %s', (from, to, order) => {
    expect(movedOrderOf(songs, from, to)).toEqual(order);
  });
});

describe('startInOrderOf', () => {
  const songs = [songOf(1, 0), { ...songOf(2, 1), pieces: [{ startSeconds: 0, endSeconds: 30 }] }];

  it.each([
    [[1, 2], 2, 60],
    [[2, 1], 1, 30],
    [[2, 1], 2, 0],
  ])('in order %j song %s starts at %s', (order, songId, start) => {
    expect(startInOrderOf(songs, order, songId)).toBe(start);
  });
});

describe('keptPositionOf', () => {
  const songs = [songOf(1, 0), { ...songOf(2, 1), pieces: [{ startSeconds: 0, endSeconds: 30 }] }];
  const segments: MusicSegment[] = [
    { ...segment, timelineStart: 0, timelineEnd: 60 },
    {
      ...segment,
      mediaItemId: 20,
      sourceStart: 0,
      sourceEnd: 30,
      timelineStart: 60,
      timelineEnd: 90,
    },
  ];

  it.each([
    [[2, 1], 10, 40],
    [[2, 1], 70, 10],
    [[1, 2], 70, 70],
    [[2, 1], 95, null],
  ])('in order %j keeps %s at %s', (order, position, kept) => {
    expect(keptPositionOf(songs, segments, order, position)).toBe(kept);
  });

  it('keeps the place inside a later piece of a split song', () => {
    const split = [
      {
        ...songOf(1, 0),
        pieces: [
          { startSeconds: 10, endSeconds: 30 },
          { startSeconds: 40, endSeconds: 70 },
        ],
      },
      { ...songOf(2, 1), pieces: [{ startSeconds: 0, endSeconds: 30 }] },
    ];
    const pieces: MusicSegment[] = [
      { ...segment, sourceStart: 10, sourceEnd: 30, timelineStart: 0, timelineEnd: 20 },
      { ...segment, sourceStart: 40, sourceEnd: 70, timelineStart: 20, timelineEnd: 50 },
      {
        ...segment,
        mediaItemId: 20,
        sourceStart: 0,
        sourceEnd: 30,
        timelineStart: 50,
        timelineEnd: 80,
      },
    ];

    expect(keptPositionOf(split, pieces, [2, 1], 25)).toBe(55);
  });
});

describe('steppedTempoOf', () => {
  it.each([
    [126.4, 0.1, 126.5],
    [126.4, -1, 125.4],
    [40.05, -0.1, 40],
    [299.5, 1, 300],
  ])('steps %s by %s', (tempo, delta, stepped) => {
    expect(steppedTempoOf(tempo, delta)).toBe(stepped);
  });
});

describe('firstBeatAtOf', () => {
  it.each([
    [30, 10],
    [42.3456, 22.346],
    [200, 90],
  ])('puts the 1 at timeline %s on source %s', (seconds, source) => {
    expect(firstBeatAtOf(songOf(1, 0), segment, seconds)).toBe(source);
  });
});

describe('nudgedFirstBeatOf', () => {
  it.each([
    [0.5, 0.02, 0.52],
    [0.01, -0.02, 0],
    [89.99, 0.02, 90],
    [null, 0.02, null],
  ])('nudges %s by %s', (firstBeat, delta, nudged) => {
    expect(nudgedFirstBeatOf(songOf(1, 0, firstBeat), delta)).toBe(nudged);
  });
});

describe('outsideMusicOf', () => {
  it('counts what lies outside the cut music', () => {
    const studio: Studio = {
      music: { lengthSeconds: 60, source: 'workingMix' },
      songs: [songOf(1, 0)],
      finalTracks: [],
      steps: [
        {
          stepId: 1,
          name: 'A',
          startSeconds: 0,
          endSeconds: 10,
          placement: 'onTimeline',
        },
        {
          stepId: 2,
          name: 'B',
          startSeconds: null,
          endSeconds: null,
          placement: 'cutAway',
        },
      ],
      parts: [],
      spots: [],
      videos: [
        {
          videoId: 1,
          mediaItemId: 50,
          name: null,
          state: 'ready',
          durationSeconds: 20,
          clipStartSeconds: 0,
          clipEndSeconds: 20,
          startSeconds: null,
          placement: 'musicMissing',
          outdated: false,
          urls: { video: '/v', compact: '/c', poster: '/p', peaks: '/k' },
        },
        {
          videoId: 2,
          mediaItemId: 51,
          name: null,
          state: 'ready',
          durationSeconds: 20,
          clipStartSeconds: 0,
          clipEndSeconds: 20,
          startSeconds: null,
          placement: 'unaligned',
          outdated: false,
          urls: { video: '/v', compact: '/c', poster: '/p', peaks: '/k' },
        },
      ],
      choreography: {
        version: 1,
        tracks: [
          {
            spotId: 1,
            keyframes: [
              {
                sourceMediaItemId: 10,
                seconds: 20,
                position: { rightMetres: 0, backMetres: 1 },
                bend: null,
                easing: 'linear',
                facingDegrees: null,
              },
              {
                sourceMediaItemId: 10,
                seconds: 80,
                position: { rightMetres: 0, backMetres: 1 },
                bend: null,
                easing: 'linear',
                facingDegrees: null,
              },
            ],
          },
        ],
      },
      stage: null,
    };

    expect(outsideMusicOf(studio, [segment])).toEqual({ steps: 1, videos: 1, keyframes: 1 });
  });
});

describe('deskSegmentIndexOf', () => {
  const pieceOf = (
    mediaItemId: number,
    timelineStart: number,
    timelineEnd: number,
  ): MusicSegment => ({
    ...segment,
    mediaItemId,
    sourceStart: timelineStart + 100,
    sourceEnd: timelineEnd + 100,
    timelineStart,
    timelineEnd,
  });
  const segments = [pieceOf(10, 0, 5), pieceOf(10, 5, 9), pieceOf(20, 9, 15)];

  it.each([
    ['the piece under the playhead', 10, 3, null, 0],
    ['the next piece on a shared edge', 10, 5, null, 1],
    ['the held piece on its own end', 10, 5, 100, 0],
    ['the piece under the playhead over a held piece elsewhere', 10, 7, 100, 1],
    ['the last piece of the song at its end', 10, 9, null, 1],
    ['the first piece of a song the playhead is outside of', 20, 3, null, 2],
    ['nothing for a song without pieces', 30, 3, null, -1],
  ])('picks %s', (_, mediaItemId, seconds, heldStart, expected) => {
    expect(deskSegmentIndexOf(segments, mediaItemId, seconds, heldStart)).toBe(expected);
  });
});
