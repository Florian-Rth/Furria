import type { ScoreStep } from '@furria/studio/score-steps';
import { describe, expect, it } from 'vitest';
import type { ActStudio } from '@/features/acts/schemas';
import { readinessOf } from './score-readiness';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const studio = (patch: Partial<ActStudio>): ActStudio => ({
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

const song = (tempoBpm: number | null) => ({
  songId: 1,
  mediaItemId: 1,
  position: 0,
  startSeconds: 0,
  endSeconds: 10,
  firstBeatSeconds: 0,
  tempoBpm,
  state: 'ready' as const,
  durationSeconds: 10,
  fileName: 'a.mp3',
  urls,
});

const finalTrack = (adopted: boolean) => ({
  finalTrackId: 1,
  mediaItemId: 9,
  version: 1,
  adopted,
  state: 'ready' as const,
  durationSeconds: 10,
  fileName: 'f.mp3',
  firstBeatSeconds: null,
  tempoBpm: null,
  alignments: [],
  urls,
});

const scoreStep = (timed: boolean, movement: boolean, video: boolean): ScoreStep => ({
  stepId: 1,
  number: 1,
  name: '',
  description: null,
  range: timed ? { start: 0, end: 1 } : null,
  partId: null,
  partIndex: null,
  counts: null,
  movement,
  video: video ? { videoId: 1, offsetSeconds: 0 } : null,
  flag: timed ? null : 'cutAway',
});

const spot = (spotId: number, filled: boolean) => ({
  spotId,
  number: spotId,
  person: filled ? { personId: spotId, firstName: 'A', lastName: 'B', portrait: null } : null,
});

const statesOf = (input: ActStudio, steps: ScoreStep[]) =>
  Object.fromEntries(
    readinessOf(input, steps).map((item) => [item.key, [item.state, item.done, item.total]]),
  );

describe('readinessOf', () => {
  it('reads an act that is half way', () => {
    expect(
      statesOf(
        studio({
          songs: [song(126), song(null)],
          finalTracks: [finalTrack(false)],
          spots: [spot(1, true), spot(2, false)],
        }),
        [
          scoreStep(true, true, true),
          scoreStep(true, false, false),
          scoreStep(false, false, false),
        ],
      ),
    ).toEqual({
      music: ['open', 1, 2],
      steps: ['open', 2, 3],
      places: ['open', 1, 2],
      movement: ['open', 1, 2],
      video: ['open', 1, 2],
      final: ['open', 0, 1],
    });
  });

  it('reads a finished act', () => {
    expect(
      statesOf(
        studio({ songs: [song(126)], finalTracks: [finalTrack(true)], spots: [spot(1, true)] }),
        [scoreStep(true, true, true)],
      ),
    ).toEqual({
      music: ['done', 1, 1],
      steps: ['done', 1, 1],
      places: ['done', 1, 1],
      movement: ['done', 1, 1],
      video: ['done', 1, 1],
      final: ['done', 1, 1],
    });
  });

  it('reads an empty act as empty everywhere', () => {
    expect(readinessOf(studio({}), []).every((item) => item.state === 'empty')).toBe(true);
  });
});
