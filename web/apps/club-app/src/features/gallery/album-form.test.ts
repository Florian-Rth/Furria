import { describe, expect, it } from 'vitest';
import { AUTOMATIC_COVER, toAlbumPayload } from './album-form';
import type { AlbumForm } from './schemas';

const formOf = (overrides: Partial<AlbumForm>): AlbumForm => ({
  title: 'Prunksitzung',
  description: '',
  link: 'none',
  calendarEntryId: '',
  sessionStartYear: null,
  cover: AUTOMATIC_COVER,
  ...overrides,
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
  ])('%s keeps only the chosen link', (_case, form, expected) => {
    expect(toAlbumPayload(formOf(form))).toMatchObject(expected);
  });
});
