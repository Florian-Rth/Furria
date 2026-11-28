import type { MusicSegment } from '@furria/studio/music-timeline';
import {
  firstBeatAtOf,
  keptPositionOf,
  movedOrderOf,
  nudgedFirstBeatOf,
  outsideMusicOf,
  songRoomOf,
  startInOrderOf,
  steppedTempoOf,
} from '@furria/studio/studio-music';
import type { Studio, StudioSong } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';

const songOf = (songId: number, position: number, firstBeat: number | null = 0.5): StudioSong => ({
  songId,
  mediaItemId: songId * 10,
  position,
  startSeconds: 10,
  endSeconds: 70,
  firstBeatSeconds: firstBeat,
  tempoBpm: 120,
  state: 'ready',
  durationSeconds: 90,
  fileName: `song-${songId}.mp3`,
  urls: { normalised: '/n', preview: '/p', peaks: '/k' },
});

const segment: MusicSegment = {
  songId: 1,
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
    [1, 1, null],
    [0, 3, null],
  ] as const)('moves the song at %s to %s', (from, to, order) => {
    expect(movedOrderOf(songs, from, to)).toEqual(order);
  });
});

describe('startInOrderOf', () => {
  const songs = [songOf(1, 0), { ...songOf(2, 1), startSeconds: 0, endSeconds: 30 }];

  it.each([
    [[2, 1], 1, 30],
    [[2, 1], 2, 0],
  ])('in order %j song %s starts at %s', (order, songId, start) => {
    expect(startInOrderOf(songs, order, songId)).toBe(start);
  });
});

describe('keptPositionOf', () => {
  const songs = [
    songOf(1, 0),
    { ...songOf(2, 1), startSeconds: 0, endSeconds: 30 },
    { ...songOf(3, 2), mediaItemId: 10, startSeconds: 75, endSeconds: 85 },
  ];
  const segments: MusicSegment[] = [
    { ...segment, timelineStart: 0, timelineEnd: 60 },
    {
      ...segment,
      songId: 2,
      mediaItemId: 20,
      sourceStart: 0,
      sourceEnd: 30,
      timelineStart: 60,
      timelineEnd: 90,
    },
    {
      ...segment,
      songId: 3,
      sourceStart: 75,
      sourceEnd: 85,
      timelineStart: 90,
      timelineEnd: 100,
    },
  ];

  it.each([
    [[2, 1, 3], 70, 10],
    [[3, 2, 1], 95, 5],
    [[2, 1, 3], 105, null],
  ])('in order %j keeps %s at %s', (order, position, kept) => {
    expect(keptPositionOf(songs, segments, order, position)).toBe(kept);
  });
});

describe('songRoomOf', () => {
  const half = (songId: number, startSeconds: number, endSeconds: number): StudioSong => ({
    ...songOf(songId, songId),
    mediaItemId: 10,
    startSeconds,
    endSeconds,
  });
  const songs = [half(1, 5, 20), half(2, 30, 50), half(3, 60, 80), songOf(4, 3)];

  it.each([
    [1, { lowest: 0, highest: 30 }],
    [2, { lowest: 20, highest: 60 }],
    [3, { lowest: 50, highest: 90 }],
  ])('lets song %s reach %o of its file', (songId, expected) => {
    const song = songs.find((candidate) => candidate.songId === songId);

    expect(song === undefined ? null : songRoomOf(songs, song)).toEqual(expected);
  });
});

describe('steppedTempoOf', () => {
  it.each([
    [40.05, -0.1, 40],
    [299.5, 1, 300],
  ])('steps %s by %s', (tempo, delta, stepped) => {
    expect(steppedTempoOf(tempo, delta)).toBe(stepped);
  });
});

describe('firstBeatAtOf', () => {
  it.each([
    [42.3456, 22.346],
    [200, 90],
  ])('puts the 1 at timeline %s on source %s', (seconds, source) => {
    expect(firstBeatAtOf(songOf(1, 0), segment, seconds)).toBe(source);
  });
});

describe('nudgedFirstBeatOf', () => {
  it.each([
    [0.01, -0.02, 0],
    [89.99, 0.02, 90],
  ])('nudges %s by %s', (firstBeat, delta, nudged) => {
    expect(nudgedFirstBeatOf(songOf(1, 0, firstBeat), delta)).toBe(nudged);
  });
});

describe('outsideMusicOf', () => {
  it('counts what lies outside the cut music', () => {
    const studio: Studio = {
      music: { lengthSeconds: 60 },
      songs: [songOf(1, 0)],
      steps: [
        {
          stepId: 1,
          name: 'A',
          startSeconds: 0,
          endSeconds: 10,
          placement: 'onTimeline',
          endPlacement: 'onTimeline',
        },
        {
          stepId: 2,
          name: 'B',
          startSeconds: null,
          endSeconds: null,
          placement: 'cutAway',
          endPlacement: 'onTimeline',
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
