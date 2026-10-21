import type { KkGroupTone, KkIconName, KkStartTileMarkKind, KkStartTileWhenTone } from '@furria/ui';
import { eventToneOf } from '@furria/ui';
import { toGroupTone } from '@/features/groups';
import type { CalendarKindKey } from '@/lib/calendar-copy';
import type { StartEntry } from './schemas';
import { toEntryFacets, toFacetText, toStampOf } from './start-labels';

export interface TileWhen {
  eyebrow: string;
  tone: KkStartTileWhenTone;
  time: string;
}

export interface AnswerTally {
  owed: number;
  answered: number;
}

const FACET_SEPARATOR = ' · ';

const KIND_ICONS: Record<CalendarKindKey, KkIconName> = {
  training: 'bolt',
  rehearsal: 'stage',
  performance: 'live',
  meeting: 'board',
  party: 'events',
  other: 'calendar',
  event: 'tickets',
};

export const entryIconOf = (entry: Pick<StartEntry, 'kind'>): KkIconName => KIND_ICONS[entry.kind];

export const entryToneOf = (entry: StartEntry): KkGroupTone => {
  if (entry.event === null && entry.ownerGroup !== null) {
    return toGroupTone(entry.ownerGroup.groupId, entry.ownerGroup.tone);
  }

  return eventToneOf(entry.calendarEntryId);
};

export const isOwed = (entry: StartEntry): boolean =>
  entry.attendance?.isOwed === true && entry.attendance.viewerAnswer === null;

export const owedEntriesOf = (entries: readonly StartEntry[]): StartEntry[] =>
  entries.filter(isOwed);

export const answerTallyOf = (entries: readonly StartEntry[]): AnswerTally => ({
  owed: entries.filter(isOwed).length,
  answered: entries.filter((entry) => entry.attendance?.viewerAnswer != null).length,
});

export const toEntryMark = (entry: StartEntry): KkStartTileMarkKind | null => {
  const answer = entry.attendance?.viewerAnswer ?? null;

  if (answer !== null) {
    return answer;
  }

  return isOwed(entry) ? 'owed' : null;
};

export const toTileWhen = (
  entry: StartEntry,
  now: Date,
  previousStartsAt: string | null,
): TileWhen => {
  const stamp = toStampOf(entry, now, previousStartsAt);

  return { eyebrow: stamp.eyebrow, tone: stamp.tone, time: stamp.time };
};

export const toEntryMetaLine = (entry: StartEntry): string | null => {
  const facets = toEntryFacets(entry).map(toFacetText);

  return facets.length === 0 ? null : facets.join(FACET_SEPARATOR);
};

export interface CalendarSplit {
  lead: StartEntry | null;
  next: StartEntry[];
  further: number;
}

export const splitCalendar = (
  entries: readonly StartEntry[],
  shownCount: number,
): CalendarSplit => {
  const shown = entries.slice(0, Math.max(0, shownCount));
  const [lead, ...next] = shown;

  return { lead: lead ?? null, next, further: entries.length - shown.length };
};
