import type { KkSelectOption } from '@furria/ui';
import { toIsoDay } from '@/lib/day';
import type { AlbumDetails, AlbumEntry, AlbumForm, AlbumLink } from './schemas';
import type { AlbumPayload, AlbumUpdatePayload } from './types';

export const AUTOMATIC_COVER = 'auto';

const ENTRY_DAY = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});
const ENTRY_LOOKBACK_DAYS = 380;
const ENTRY_LOOKAHEAD_DAYS = 14;

export interface EntryWindow {
  from: string;
  to: string;
}

const shiftDays = (day: Date, days: number): Date =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate() + days);

export const entryWindowOf = (today: Date): EntryWindow => ({
  from: toIsoDay(shiftDays(today, -ENTRY_LOOKBACK_DAYS)),
  to: toIsoDay(shiftDays(today, ENTRY_LOOKAHEAD_DAYS)),
});

const linkOf = (album: AlbumDetails): AlbumLink => {
  if (album.calendarEntry !== null) {
    return 'entry';
  }
  return album.sessionStartYear === null ? 'none' : 'session';
};

export const toAlbumFormValues = (
  album: AlbumDetails | null,
  presetEntryId: number | null,
): AlbumForm => {
  if (album === null) {
    return {
      title: '',
      description: '',
      link: 'entry',
      calendarEntryId: presetEntryId === null ? '' : String(presetEntryId),
      sessionStartYear: null,
      cover: AUTOMATIC_COVER,
    };
  }
  const link = linkOf(album);
  return {
    title: album.title,
    description: album.description ?? '',
    link,
    calendarEntryId:
      album.calendarEntry === null ? '' : String(album.calendarEntry.calendarEntryId),
    sessionStartYear: album.calendarEntry === null ? album.sessionStartYear : null,
    cover:
      album.chosenCoverMediaItemId === null
        ? AUTOMATIC_COVER
        : String(album.chosenCoverMediaItemId),
  };
};

export const toAlbumPayload = (form: AlbumForm): AlbumPayload => {
  const description = form.description.trim();
  return {
    title: form.title.trim(),
    description: description === '' ? null : description,
    calendarEntryId: form.link === 'entry' ? Number(form.calendarEntryId) : null,
    sessionStartYear: form.link === 'session' ? form.sessionStartYear : null,
  };
};

export const toAlbumUpdatePayload = (form: AlbumForm): AlbumUpdatePayload => ({
  ...toAlbumPayload(form),
  coverMediaItemId: form.cover === AUTOMATIC_COVER ? null : Number(form.cover),
});

interface EntryChoice {
  calendarEntryId: number;
  title: string;
  startsAt: string;
}

export const toEntryOptions = (
  entries: readonly EntryChoice[],
  linked: AlbumEntry | null,
): KkSelectOption[] => {
  const known =
    linked === null || entries.some((entry) => entry.calendarEntryId === linked.calendarEntryId)
      ? entries
      : [...entries, linked];
  return [...known]
    .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt))
    .map((entry) => ({
      value: String(entry.calendarEntryId),
      label: `${ENTRY_DAY.format(new Date(entry.startsAt))} · ${entry.title}`,
    }));
};
