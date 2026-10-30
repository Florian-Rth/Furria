import { describe, expect, it } from 'vitest';
import type { CastPerson } from '@/features/running-order/schemas';
import {
  actPageModeOf,
  canChangeCoEditors,
  coEditorCandidatesOf,
  studioOverviewOf,
} from './act-studio';
import type { CoEditor, Studio } from './schemas';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const song = (songId: number) => ({
  songId,
  mediaItemId: songId,
  position: songId,
  startSeconds: 0,
  endSeconds: 60,
  firstBeatSeconds: null,
  tempoBpm: null,
  state: 'ready' as const,
  durationSeconds: 60,
  fileName: `song-${songId}.mp3`,
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

const spot = (spotId: number, personId: number | null) => ({
  spotId,
  number: spotId,
  person:
    personId === null ? null : { personId, firstName: 'Anna', lastName: 'Narr', portrait: null },
});

describe('studioOverviewOf', () => {
  it('has no music while neither a song nor an adopted final track exists', () => {
    const unadopted = {
      finalTrackId: 1,
      mediaItemId: 9,
      version: 1,
      adopted: false,
      state: 'ready' as const,
      durationSeconds: 120,
      fileName: 'Endfassung.mp3',
      firstBeatSeconds: null,
      tempoBpm: null,
      alignments: [],
      urls,
    };

    expect(studioOverviewOf(studio({ finalTracks: [unadopted] }), 1).hasMusic).toBe(false);
  });

  it('has music once a song is in the working mix', () => {
    const overview = studioOverviewOf(
      studio({ songs: [song(1), song(2)], music: { lengthSeconds: 120, source: 'workingMix' } }),
      1,
    );

    expect([overview.hasMusic, overview.songs, overview.playsFinalTrack]).toEqual([true, 2, false]);
  });

  it('finds the viewer’s own spot and counts the open ones', () => {
    const overview = studioOverviewOf(
      studio({ spots: [spot(1, 4), spot(2, 7), spot(3, null)] }),
      7,
    );

    expect([overview.ownSpot, overview.spotsOpen]).toEqual([2, 1]);
  });

  it.each<[number | null]>([[null], [99]])('knows no own spot for viewer %s', (viewerId) => {
    expect(studioOverviewOf(studio({ spots: [spot(1, 4)] }), viewerId).ownSpot).toBeNull();
  });

  it('counts steps off the timeline and outdated videos', () => {
    const step = (stepId: number, placement: 'onTimeline' | 'cutAway' | 'musicMissing') => ({
      stepId,
      name: `Schritt ${stepId}`,
      description: null,
      startSeconds: null,
      endSeconds: null,
      placement,
    });
    const video = (videoId: number, outdated: boolean) => ({
      videoId,
      mediaItemId: videoId,
      name: null,
      state: 'ready' as const,
      durationSeconds: 30,
      startSeconds: 0,
      placement: 'onTimeline' as const,
      outdated,
      urls: { video: '/v', compact: '/c', poster: '/p' },
    });
    const overview = studioOverviewOf(
      studio({
        steps: [step(1, 'onTimeline'), step(2, 'cutAway'), step(3, 'musicMissing')],
        videos: [video(1, true), video(2, false)],
      }),
      null,
    );

    expect([
      overview.steps,
      overview.stepsAdrift,
      overview.videos,
      overview.videosOutdated,
    ]).toEqual([3, 2, 2, 1]);
  });
});

describe('coEditorCandidatesOf', () => {
  it('offers the present cast members who do not co-edit yet', () => {
    const member = (personId: number, absent = false): CastPerson => ({
      personId,
      firstName: `P${personId}`,
      lastName: 'Narr',
      portrait: null,
      absent,
    });
    const coEditor: CoEditor = {
      personId: 2,
      firstName: 'P2',
      lastName: 'Narr',
      portrait: null,
      grantedAt: '2026-10-01T10:00:00+02:00',
    };

    expect(
      coEditorCandidatesOf([member(1), member(2), member(3), member(4, true)], [coEditor]).map(
        (person) => person.personId,
      ),
    ).toEqual([1, 3]);
  });
});

describe('canChangeCoEditors', () => {
  it.each<[boolean, boolean, boolean, boolean]>([
    [true, false, false, true],
    [false, false, false, false],
    [true, true, false, false],
    [true, false, true, false],
  ])('grant %s, closed %s, archived %s → %s', (canGrant, closed, archived, expected) => {
    expect(canChangeCoEditors(canGrant, { closed, archived })).toBe(expected);
  });
});

describe('actPageModeOf', () => {
  const playable = studio({
    songs: [song(1)],
    music: { lengthSeconds: 60, source: 'workingMix' },
  });
  const processing = studio({
    songs: [{ ...song(1), state: 'processing' as const }],
    music: { lengthSeconds: 60, source: 'workingMix' },
  });

  it.each([
    ['practises a studio with music that plays', playable, false, {}, 'practice'],
    ['shows the details when the viewer sees no studio', null, false, {}, 'details'],
    ['shows the details while no music is ready', processing, false, {}, 'details'],
    ['opens the studio to an editor while no music is ready', processing, true, {}, 'practice'],
    [
      'shows the details when asked for them',
      playable,
      true,
      { view: 'details' as const },
      'details',
    ],
    [
      'shows the details while the settings are open',
      playable,
      false,
      { settings: true },
      'details',
    ],
    ['expects practice while the studio loads', undefined, false, {}, 'practice'],
    [
      'runs a training on music that plays',
      playable,
      false,
      { view: 'training' as const },
      'training',
    ],
    [
      'expects the training while loading',
      undefined,
      false,
      { view: 'training' as const },
      'training',
    ],
    [
      'shows the details for a training without music',
      processing,
      true,
      { view: 'training' as const },
      'details',
    ],
    [
      'expects the details while loading when asked',
      undefined,
      false,
      { view: 'details' as const },
      'details',
    ],
  ])('%s', (_case, shown, canEditStudio, search, expected) => {
    expect(actPageModeOf(shown, canEditStudio, search)).toBe(expected);
  });
});
