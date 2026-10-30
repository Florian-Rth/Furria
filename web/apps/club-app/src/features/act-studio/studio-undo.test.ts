import { describe, expect, it } from 'vitest';
import type { Keyframe, Studio } from '@/features/acts/schemas';
import type { StudioWrite } from './studio-undo';
import { inverseOf, restoredOrderOf } from './studio-undo';

const keyframe = (seconds: number): Keyframe => ({
  sourceMediaItemId: 11,
  seconds,
  position: { rightMetres: 0, backMetres: 1 },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const anna = { personId: 7, firstName: 'Anna', lastName: 'A', portrait: null };
const ben = { personId: 8, firstName: 'Ben', lastName: 'B', portrait: null };

const audio = {
  normalised: 'https://x/n',
  preview: 'https://x/p',
  peaks: 'https://x/k',
};

const studio: Studio = {
  music: { lengthSeconds: 60, source: 'workingMix' },
  songs: [
    {
      songId: 2,
      mediaItemId: 21,
      position: 1,
      startSeconds: 1,
      endSeconds: 30,
      firstBeatSeconds: 1.5,
      tempoBpm: 120,
      state: 'ready',
      durationSeconds: 40,
      fileName: 'b.mp3',
      urls: audio,
    },
    {
      songId: 1,
      mediaItemId: 11,
      position: 0,
      startSeconds: 0,
      endSeconds: 20,
      firstBeatSeconds: null,
      tempoBpm: null,
      state: 'ready',
      durationSeconds: 20,
      fileName: 'a.mp3',
      urls: audio,
    },
  ],
  finalTracks: [
    {
      finalTrackId: 4,
      mediaItemId: 41,
      version: 1,
      adopted: false,
      state: 'ready',
      durationSeconds: 50,
      fileName: 'final.mp3',
      firstBeatSeconds: 0.4,
      tempoBpm: 118,
      alignments: [
        { sourceMediaItemId: 11, offsetSeconds: 0.2 },
        { sourceMediaItemId: 21, offsetSeconds: 20.1 },
      ],
      urls: audio,
    },
  ],
  steps: [
    {
      stepId: 5,
      name: 'Kreis',
      description: 'eng',
      startSeconds: 4,
      endSeconds: 8,
      placement: 'onTimeline',
    },
    {
      stepId: 6,
      name: '',
      description: null,
      startSeconds: null,
      endSeconds: null,
      placement: 'cutAway',
    },
  ],
  parts: [{ partId: 9, name: 'Marsch', stepIds: [5], mainVideoId: 3, adrift: false }],
  spots: [
    { spotId: 30, number: 1, person: anna },
    { spotId: 31, number: 2, person: null },
  ],
  videos: [
    {
      videoId: 3,
      mediaItemId: 33,
      name: 'Probe',
      state: 'ready',
      durationSeconds: 10,
      startSeconds: 2,
      placement: 'onTimeline',
      outdated: false,
      urls: { video: 'https://x/v', compact: 'https://x/c', poster: 'https://x/o' },
    },
  ],
  choreography: { version: 12, tracks: [{ spotId: 30, keyframes: [keyframe(1)] }] },
  stage: null,
  evenings: [
    {
      eventId: 50,
      title: 'Herbstball',
      startsAt: '2026-10-31T19:00:00+01:00',
      appearance: {
        appearanceId: 1,
        position: 1,
        stageStartsAt: null,
        added: [],
        removedPersonIds: [],
        spotChanges: [{ spotId: 31, person: ben }],
        choreography: {
          version: 3,
          copiedFromVersion: 12,
          tracks: [{ spotId: 30, keyframes: [keyframe(2)] }],
        },
      },
    },
    {
      eventId: 51,
      title: 'Prunksitzung',
      startsAt: '2026-11-11T19:00:00+01:00',
      appearance: null,
    },
  ],
  trainings: [],
};

describe('inverseOf', () => {
  it.each<{ name: string; write: StudioWrite; created: number[]; inverse: StudioWrite | null }>([
    {
      name: 'removes an added song',
      write: { kind: 'songAdd', mediaItemId: 99 },
      created: [77],
      inverse: { kind: 'songRemove', songId: 77 },
    },
    {
      name: 'brings a removed song back at its place with its cut',
      write: { kind: 'songRemove', songId: 2 },
      created: [],
      inverse: {
        kind: 'songRestore',
        mediaItemId: 21,
        settings: { startSeconds: 1, endSeconds: 30, firstBeatSeconds: 1.5, tempoBpm: 120 },
        order: [1, 0],
      },
    },
    {
      name: 'puts the songs back in their order',
      write: { kind: 'songOrder', songIds: [2, 1] },
      created: [],
      inverse: { kind: 'songOrder', songIds: [1, 2] },
    },
    {
      name: 'restores the cut of a song',
      write: {
        kind: 'songSettings',
        songId: 1,
        settings: { startSeconds: 3, endSeconds: 20, firstBeatSeconds: null, tempoBpm: null },
      },
      created: [],
      inverse: {
        kind: 'songSettings',
        songId: 1,
        settings: { startSeconds: 0, endSeconds: 20, firstBeatSeconds: null, tempoBpm: null },
      },
    },
    {
      name: 'removes every step a mark created',
      write: { kind: 'stepsMark', atSeconds: 12 },
      created: [70, 71],
      inverse: { kind: 'stepsRemove', stepIds: [70, 71] },
    },
    {
      name: 'marks a removed step again with its texts',
      write: { kind: 'stepsRemove', stepIds: [5] },
      created: [],
      inverse: {
        kind: 'stepsRestore',
        steps: [{ atSeconds: 4, name: 'Kreis', description: 'eng' }],
      },
    },
    {
      name: 'cannot bring back a step cut away from the music',
      write: { kind: 'stepsRemove', stepIds: [6] },
      created: [],
      inverse: null,
    },
    {
      name: 'moves a step back',
      write: { kind: 'stepStart', stepId: 5, atSeconds: 6 },
      created: [],
      inverse: { kind: 'stepStart', stepId: 5, atSeconds: 4 },
    },
    {
      name: 'opens a dissolved part again with its main video',
      write: { kind: 'partRemove', partId: 9 },
      created: [],
      inverse: {
        kind: 'partRestore',
        settings: { name: 'Marsch', firstStepId: 5, mainVideoId: 3 },
      },
    },
    {
      name: 'brings a removed video back as main video of its parts',
      write: { kind: 'videoRemove', videoId: 3 },
      created: [],
      inverse: {
        kind: 'videoRestore',
        mediaItemId: 33,
        name: 'Probe',
        startSeconds: 2,
        parts: [{ partId: 9, settings: { name: 'Marsch', firstStepId: 5, mainVideoId: 3 } }],
      },
    },
    {
      name: 'puts an aligned video back to its start',
      write: { kind: 'videoAlign', videoId: 3 },
      created: [],
      inverse: { kind: 'videoStart', videoId: 3, startSeconds: 2 },
    },
    {
      name: 'restores only the offsets a tune touched',
      write: {
        kind: 'finalOffsets',
        finalTrackId: 4,
        offsets: [{ sourceMediaItemId: 21, offsetSeconds: 20.3 }],
      },
      created: [],
      inverse: {
        kind: 'finalOffsets',
        finalTrackId: 4,
        offsets: [{ sourceMediaItemId: 21, offsetSeconds: 20.1 }],
      },
    },
    {
      name: 'restores every offset a match replaced',
      write: { kind: 'finalMatch', finalTrackId: 4 },
      created: [],
      inverse: {
        kind: 'finalOffsets',
        finalTrackId: 4,
        offsets: [
          { sourceMediaItemId: 11, offsetSeconds: 0.2 },
          { sourceMediaItemId: 21, offsetSeconds: 20.1 },
        ],
      },
    },
    {
      name: 'never undoes adopting the final file',
      write: { kind: 'finalAdopt', finalTrackId: 4 },
      created: [],
      inverse: null,
    },
    {
      name: 'puts the person back on the spot she left',
      write: { kind: 'spotAssign', spotId: 31, person: anna },
      created: [],
      inverse: {
        kind: 'batch',
        writes: [
          { kind: 'spotAssign', spotId: 31, person: null },
          { kind: 'spotAssign', spotId: 30, person: anna },
        ],
      },
    },
    {
      name: 'brings a removed spot back with its person and path',
      write: { kind: 'spotRemove', spotId: 30 },
      created: [],
      inverse: { kind: 'spotRestore', person: anna, keyframes: [keyframe(1)] },
    },
    {
      name: 'restores the paths of the changed spots only',
      write: { kind: 'tracks', changes: { 30: [keyframe(5)], 31: [keyframe(6)] } },
      created: [],
      inverse: { kind: 'tracks', changes: { 30: [keyframe(1)], 31: [] } },
    },
    {
      name: 'restores the version that was current before a restore',
      write: { kind: 'restore', eventId: null, version: 4 },
      created: [],
      inverse: { kind: 'restore', eventId: null, version: 12 },
    },
    {
      name: 'restores the evening copy version before an evening restore',
      write: { kind: 'restore', eventId: 50, version: 1 },
      created: [],
      inverse: { kind: 'restore', eventId: 50, version: 3 },
    },
    {
      name: 'restores the evening person of a spot',
      write: { kind: 'eveningSpot', eventId: 50, spotId: 31, person: null },
      created: [],
      inverse: { kind: 'eveningSpot', eventId: 50, spotId: 31, person: ben },
    },
    {
      name: 'falls back to the session person when the evening kept it',
      write: { kind: 'eveningSpot', eventId: 50, spotId: 30, person: ben },
      created: [],
      inverse: { kind: 'eveningSpot', eventId: 50, spotId: 30, person: anna },
    },
    {
      name: 'restores the evening copy paths',
      write: { kind: 'eveningTracks', eventId: 50, changes: { 30: [keyframe(9)] } },
      created: [],
      inverse: { kind: 'eveningTracks', eventId: 50, changes: { 30: [keyframe(2)] } },
    },
    {
      name: 'drops the copy the first evening edit created',
      write: { kind: 'eveningTracks', eventId: 51, changes: { 30: [keyframe(9)] } },
      created: [],
      inverse: { kind: 'eveningCopyDrop', eventId: 51 },
    },
    {
      name: 'joins again an evening left without changes',
      write: { kind: 'eveningLeave', eventId: 51 },
      created: [],
      inverse: { kind: 'eveningJoin', eventId: 51 },
    },
    {
      name: 'never undoes leaving an evening that had its own changes',
      write: { kind: 'eveningLeave', eventId: 50 },
      created: [],
      inverse: null,
    },
    {
      name: 'flips an evening dancer',
      write: { kind: 'eveningDancer', eventId: 50, person: ben, dances: false },
      created: [],
      inverse: { kind: 'eveningDancer', eventId: 50, person: ben, dances: true },
    },
    {
      name: 'reverses a batch in reverse order',
      write: {
        kind: 'batch',
        writes: [
          { kind: 'stepStart', stepId: 5, atSeconds: 6 },
          { kind: 'videoStart', videoId: 3, startSeconds: 4 },
        ],
      },
      created: [],
      inverse: {
        kind: 'batch',
        writes: [
          { kind: 'videoStart', videoId: 3, startSeconds: 2 },
          { kind: 'stepStart', stepId: 5, atSeconds: 4 },
        ],
      },
    },
    {
      name: 'gives up on a write whose target is already gone',
      write: {
        kind: 'partSettings',
        partId: 404,
        settings: { name: 'x', firstStepId: 5, mainVideoId: null },
      },
      created: [],
      inverse: null,
    },
  ])('$name', ({ write, created, inverse }) => {
    expect(inverseOf(studio, write, created)).toEqual(inverse);
  });
});

describe('restoredOrderOf', () => {
  it('puts the restored song where the removed one stood', () => {
    expect(restoredOrderOf([1, 0, 3], 42)).toEqual([1, 42, 3]);
  });
});
