import { describe, expect, it } from 'vitest';
import type { CastPerson } from '@/features/running-order/schemas';
import { actPageModeOf, canChangeCoEditors, coEditorCandidatesOf } from './act-studio';
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

  const member = { canEditStudio: false, seesDetails: false };
  const editor = { canEditStudio: true, seesDetails: true };
  const play = { view: 'play' as const };

  it.each([
    ['lands on the act card', playable, member, {}, 'card'],
    ['lands an editor on the act card too', playable, editor, {}, 'card'],
    ['practises a studio with music that plays', playable, member, play, 'practice'],
    ['falls back to the card when the viewer sees no studio', null, member, play, 'card'],
    ['falls back to the card while no music is ready', processing, member, play, 'card'],
    ['opens the studio to an editor while no music is ready', processing, editor, play, 'practice'],
    ['expects practice while the studio loads', undefined, member, play, 'practice'],
    ['shows the details to an editor', playable, editor, { view: 'details' as const }, 'details'],
    ['keeps a cast member on the card', playable, member, { view: 'details' as const }, 'card'],
    [
      'shows the details while the settings are open',
      playable,
      editor,
      { settings: true },
      'details',
    ],
    [
      'runs a training on music that plays',
      playable,
      member,
      { view: 'training' as const },
      'training',
    ],
    [
      'expects the training while loading',
      undefined,
      member,
      { view: 'training' as const },
      'training',
    ],
    [
      'falls back to the card for a training without music',
      processing,
      editor,
      { view: 'training' as const },
      'card',
    ],
    [
      'expects the details while loading when asked',
      undefined,
      member,
      { view: 'details' as const },
      'details',
    ],
  ])('%s', (_case, shown, viewer, search, expected) => {
    expect(actPageModeOf(shown, viewer, search)).toBe(expected);
  });
});
