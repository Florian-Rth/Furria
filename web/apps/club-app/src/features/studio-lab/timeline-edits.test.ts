import type { MusicSegment } from '@furria/studio/music-timeline';
import { describe, expect, it } from 'vitest';
import type { ActStudio } from '@/features/acts/schemas';
import { timelineEdgesOf, withEdgeAt } from './timeline-edits';

const songOf = (songId: number, position: number) => ({
  songId,
  mediaItemId: songId * 10,
  position,
  startSeconds: 0,
  endSeconds: 30,
  firstBeatSeconds: null,
  tempoBpm: null,
  state: 'ready' as const,
  durationSeconds: 40,
  fileName: `song-${songId}.mp3`,
  urls: { normalised: '/n', preview: '/p', peaks: '/k' },
});

const stepOf = (stepId: number, start: number, end: number) => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: 'onTimeline' as const,
});

const studio: ActStudio = {
  music: { lengthSeconds: 60, source: 'workingMix' },
  songs: [songOf(2, 1), songOf(1, 0)],
  finalTracks: [],
  steps: [stepOf(1, 0, 10), stepOf(2, 10, 20), stepOf(3, 40, 50)],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  evenings: [],
  trainings: [],
};

const segmentOf = (mediaItemId: number, timelineStart: number): MusicSegment => ({
  mediaItemId,
  audioUrl: '/n',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 0,
  sourceEnd: 30,
  timelineStart,
  timelineEnd: timelineStart + 30,
  beats: [],
});

const segments = [segmentOf(10, 0), segmentOf(20, 30)];

describe('timelineEdgesOf', () => {
  it('lists cuts and joined step borders', () => {
    expect(timelineEdgesOf(studio, segments).map((edge) => [edge.key, edge.seconds])).toEqual([
      ['cut-1', 30],
      ['cut-2', 60],
      ['start-1', 0],
      ['join-1-2', 10],
      ['end-2', 20],
      ['start-3', 40],
      ['end-3', 50],
    ]);
  });

  it('has no cuts on a final track', () => {
    const final = { ...studio, music: { lengthSeconds: 60, source: 'finalTrack' as const } };

    expect(timelineEdgesOf(final, segments).some((edge) => edge.kind === 'cut')).toBe(false);
  });
});

describe('withEdgeAt', () => {
  const edges = timelineEdgesOf(studio, segments);
  const edgeOf = (key: string) => {
    const edge = edges.find((candidate) => candidate.key === key);
    if (edge === undefined) {
      throw new Error(key);
    }
    return edge;
  };
  const rangesOf = (changed: ActStudio) =>
    changed.steps.map((step) => [step.stepId, step.startSeconds, step.endSeconds]);

  it.each([
    [
      'join-1-2',
      12,
      [
        [1, 0, 12],
        [2, 12, 20],
        [3, 40, 50],
      ],
    ],
    [
      'join-1-2',
      25,
      [
        [1, 0, 19.5],
        [2, 19.5, 20],
        [3, 40, 50],
      ],
    ],
    [
      'join-1-2',
      -3,
      [
        [1, 0, 0.5],
        [2, 0.5, 20],
        [3, 40, 50],
      ],
    ],
    [
      'end-3',
      70,
      [
        [1, 0, 10],
        [2, 10, 20],
        [3, 40, 60],
      ],
    ],
  ])('moves border %s to %s', (key, seconds, ranges) => {
    expect(rangesOf(withEdgeAt(studio, edgeOf(key), seconds, segments))).toEqual(ranges);
  });

  it.each([
    [25, 25, -5],
    [36, 36, 6],
    [80, 40, 10],
    [0, 2, -28],
  ])('trims the first song to %s s', (seconds, end, shift) => {
    const changed = withEdgeAt(studio, edgeOf('cut-1'), seconds, segments);

    expect(changed.songs.find((song) => song.songId === 1)?.endSeconds).toBe(end);
    expect(rangesOf(changed)).toEqual([
      [1, 0, 10],
      [2, 10, 20],
      [3, 40 + shift, 50 + shift],
    ]);
  });
});
