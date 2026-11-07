import { describe, expect, it } from 'vitest';
import type { CastPerson } from '@/features/running-order/schemas';
import type { ActScreenAccess, ActStudioScreen } from './act-studio';
import { actScreenAccessOf, canChangeCoEditors, coEditorCandidatesOf } from './act-studio';
import type { ActStudio, CoEditor } from './schemas';

const urls = { normalised: '/n', preview: '/p', peaks: '/k' };

const song = (songId: number) => ({
  songId,
  mediaItemId: songId,
  position: songId,
  pieces: [{ startSeconds: 0, endSeconds: 60 }],
  firstBeatSeconds: null,
  tempoBpm: null,
  state: 'ready' as const,
  durationSeconds: 60,
  fileName: `song-${songId}.mp3`,
  urls,
});

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

describe('actScreenAccessOf', () => {
  const playable = studio({
    songs: [song(1)],
    music: { lengthSeconds: 60, source: 'workingMix' },
  });
  const processing = studio({
    songs: [{ ...song(1), state: 'processing' as const }],
    music: { lengthSeconds: 60, source: 'workingMix' },
  });

  it.each<[string, ActStudio | null, boolean, ActStudioScreen, ActScreenAccess]>([
    ['practises a studio with music that plays', playable, false, 'practice', 'open'],
    ['sends a viewer without a studio to the hub', null, true, 'practice', 'hub'],
    ['sends a member to the hub while no music is ready', processing, false, 'practice', 'hub'],
    ['opens the studio to an editor while no music is ready', processing, true, 'practice', 'open'],
    ['opens the edit page to an editor', processing, true, 'edit', 'open'],
    ['turns a member asking to edit to practising', playable, false, 'edit', 'practice'],
    ['sends a member asking to edit silent music to the hub', processing, false, 'edit', 'hub'],
    ['runs a training on music that plays', playable, false, 'training', 'open'],
    ['sends a training without music to the hub', processing, true, 'training', 'hub'],
  ])('%s', (_case, shown, canEditStudio, screen, expected) => {
    expect(actScreenAccessOf(shown, canEditStudio, screen)).toBe(expected);
  });
});
