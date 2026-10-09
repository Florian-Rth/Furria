import { describe, expect, it } from 'vitest';
import {
  AUTOMATIC_COVER,
  entryWindowOf,
  toAlbumFormValues,
  toAlbumPayload,
  toAlbumUpdatePayload,
  toEntryOptions,
} from './album-form';
import type { AlbumDetails, AlbumForm } from './schemas';

const albumOf = (overrides: Partial<AlbumDetails>): AlbumDetails => ({
  albumId: 4,
  title: 'Prunksitzung',
  description: null,
  calendarEntry: null,
  sessionStartYear: null,
  publishedAt: null,
  coverMediaItemId: null,
  chosenCoverMediaItemId: null,
  photos: 0,
  videos: 0,
  uploaders: [],
  items: [],
  zipUrl: '/zip',
  ...overrides,
});

const formOf = (overrides: Partial<AlbumForm>): AlbumForm => ({
  title: 'Prunksitzung',
  description: '',
  link: 'none',
  calendarEntryId: '',
  sessionStartYear: null,
  cover: AUTOMATIC_COVER,
  ...overrides,
});

describe('entryWindowOf', () => {
  it('reaches a good year back and two weeks ahead', () => {
    expect(entryWindowOf(new Date(2026, 9, 9))).toEqual({ from: '2025-09-24', to: '2026-10-23' });
  });
});

describe('toAlbumFormValues', () => {
  it.each<[string, AlbumDetails | null, number | null, Partial<AlbumForm>]>([
    ['a new album', null, null, { link: 'entry', calendarEntryId: '' }],
    ['a new album from an entry', null, 9, { link: 'entry', calendarEntryId: '9' }],
    [
      'an album on an entry',
      albumOf({
        calendarEntry: { calendarEntryId: 3, title: 'X', startsAt: '2026-02-14T19:00:00Z' },
        sessionStartYear: 2025,
      }),
      null,
      { link: 'entry', calendarEntryId: '3', sessionStartYear: null },
    ],
    [
      'an album on a session',
      albumOf({ sessionStartYear: 2025 }),
      null,
      { link: 'session', sessionStartYear: 2025 },
    ],
    ['a free album', albumOf({}), null, { link: 'none' }],
    ['a chosen cover', albumOf({ chosenCoverMediaItemId: 12 }), null, { cover: '12' }],
  ])('%s', (_case, album, preset, expected) => {
    expect(toAlbumFormValues(album, preset)).toMatchObject(expected);
  });
});

describe('toAlbumPayload', () => {
  it.each<
    [
      string,
      Partial<AlbumForm>,
      { calendarEntryId: number | null; sessionStartYear: number | null },
    ]
  >([
    [
      'entry link',
      { link: 'entry', calendarEntryId: '7', sessionStartYear: 2024 },
      { calendarEntryId: 7, sessionStartYear: null },
    ],
    [
      'session link',
      { link: 'session', calendarEntryId: '7', sessionStartYear: 2024 },
      { calendarEntryId: null, sessionStartYear: 2024 },
    ],
    [
      'no link',
      { link: 'none', calendarEntryId: '7', sessionStartYear: 2024 },
      { calendarEntryId: null, sessionStartYear: null },
    ],
  ])('%s keeps only the chosen link', (_case, form, expected) => {
    expect(toAlbumPayload(formOf(form))).toMatchObject(expected);
  });

  it('trims the text and sends a blank description as none', () => {
    expect(toAlbumPayload(formOf({ title: '  Umzug ', description: '   ' }))).toMatchObject({
      title: 'Umzug',
      description: null,
    });
  });
});

describe('toAlbumUpdatePayload', () => {
  it.each<[string, number | null]>([
    [AUTOMATIC_COVER, null],
    ['31', 31],
  ])('cover %s', (cover, expected) => {
    expect(toAlbumUpdatePayload(formOf({ cover })).coverMediaItemId).toBe(expected);
  });
});

describe('toEntryOptions', () => {
  const entries = [
    { calendarEntryId: 1, title: 'A', startsAt: '2026-01-10T19:00:00+01:00' },
    { calendarEntryId: 2, title: 'B', startsAt: '2026-02-14T19:00:00+01:00' },
  ];

  it('lists the newest entry first', () => {
    expect(toEntryOptions(entries, null).map((option) => option.value)).toEqual(['2', '1']);
  });

  it('keeps a linked entry outside the window', () => {
    const linked = { calendarEntryId: 9, title: 'C', startsAt: '2024-11-11T11:11:00+01:00' };

    expect(toEntryOptions(entries, linked).map((option) => option.value)).toEqual(['2', '1', '9']);
  });
});
