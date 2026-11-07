import { describe, expect, it } from 'vitest';
import type { Studio } from '../models/studio-schemas';
import { localStudioOf, NO_IDS, serverStudioOf, withLearnedId } from './id-map';

const local: Studio = {
  music: { lengthSeconds: 30, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [
    {
      stepId: 11,
      name: '',
      startSeconds: 0,
      endSeconds: 8,
      placement: 'onTimeline',
    },
    {
      stepId: -1,
      name: '',
      startSeconds: 8,
      endSeconds: 30,
      placement: 'onTimeline',
    },
  ],
  parts: [
    {
      partId: -2,
      name: 'A',
      firstStepId: 11,
      lastStepId: -1,
      stepIds: [11, -1],
      mainVideoId: null,
      adrift: false,
    },
  ],
  spots: [{ spotId: -3, number: 1, person: null }],
  videos: [],
  choreography: { version: 4, tracks: [{ spotId: -3, keyframes: [] }] },
  stage: null,
};

const ids = withLearnedId(
  withLearnedId(withLearnedId(NO_IDS, 'steps', -1, 77), 'parts', -2, 88),
  'spots',
  -3,
  99,
);

describe('serverStudioOf', () => {
  it('names every learned item by its server id', () => {
    const server = serverStudioOf(local, ids);

    expect({
      steps: server.steps.map((step) => step.stepId),
      parts: server.parts.map((part) => [part.partId, ...part.stepIds]),
      spots: server.spots.map((spot) => spot.spotId),
      tracks: server.choreography?.tracks.map((track) => track.spotId),
    }).toEqual({ steps: [11, 77], parts: [[88, 11, 77]], spots: [99], tracks: [99] });
  });

  it('is undone by localStudioOf', () => {
    expect(localStudioOf(serverStudioOf(local, ids), ids)).toEqual(local);
  });
});
