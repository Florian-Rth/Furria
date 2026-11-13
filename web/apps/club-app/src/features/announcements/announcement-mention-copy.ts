import type { MentionKind } from '@furria/ui/rich-text';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';

export const ANNOUNCEMENT_MENTION_SECTIONS: Readonly<Record<MentionKind, string>> = {
  group: 'Gruppen',
  person: 'Personen',
  'calendar-entry': 'Termine',
  event: 'Veranstaltungen',
  'news-post': 'Meldungen',
  album: 'Alben',
};

export const ANNOUNCEMENT_MENTION_EMPTY = 'Nichts gefunden';
export const ANNOUNCEMENT_MENTION_GONE = 'nicht mehr zu finden – erscheint als Text';

const MENTION_LOAD_ERRORS: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server – Erwähnungen fehlen gerade.',
  unexpected: 'Erwähnungen konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const announcementMentionLoadErrorOf = (error: Error | null): string | null =>
  toQueryErrorMessage(error, MENTION_LOAD_ERRORS);

export const ANNOUNCEMENT_LINK_SHEET_ID = 'announcement-link';
export const ANNOUNCEMENT_PICKER_LIST_ID = 'announcement-mention-list';
export const ANNOUNCEMENT_BODY_FIELD_ID = 'announcement-body';
