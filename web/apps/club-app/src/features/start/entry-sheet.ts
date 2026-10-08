import { CALENDAR_KIND_LABELS } from '@/lib/calendar-copy';
import { toLocalIsoDay, toTimeLabel } from '@/lib/calendar-days';
import type { StartEntry, StartGroupRef, StartVenue } from './schemas';
import {
  formatCountdownMinutes,
  formatShortDate,
  formatSpokenDay,
  isEntryRunningAt,
} from './start-labels';

export type EntryOnward =
  | { kind: 'calendar'; day: string }
  | { kind: 'group'; groupId: number; name: string }
  | { kind: 'none' };

export interface EntryVenueView {
  name: string;
  lines: string[];
  holdsKey: boolean;
}

export type EntryRunning =
  | { kind: 'idle' }
  | { kind: 'openEnded' }
  | { kind: 'ending'; minutesLeft: number };

export interface EntryRuns {
  groupName: string | null;
  duty: string | null;
}

export interface EntryGroupsView {
  owner: StartGroupRef | null;
  participating: StartGroupRef[];
}

type EntryTiming = Pick<StartEntry, 'startsAt' | 'endsAt'>;

const PART_SEPARATOR = ' · ';
const SPAN_DASH = '–';
const RUNNING_WORD = 'läuft';
const NO_ONWARD: EntryOnward = { kind: 'none' };
const MS_PER_MINUTE = 60_000;

const trimmed = (value: string | null): string | null => {
  const text = value?.trim() ?? '';

  return text === '' ? null : text;
};

const isPresent = (value: string | null): value is string => value !== null;

const endLabelOf = (startsAt: string, endsAt: string): string =>
  toLocalIsoDay(endsAt) === toLocalIsoDay(startsAt)
    ? toTimeLabel(endsAt)
    : `${formatShortDate(endsAt)} ${toTimeLabel(endsAt)}`;

export const formatEntrySpan = (entry: EntryTiming): string => {
  const day = formatSpokenDay(entry.startsAt);
  const start = toTimeLabel(entry.startsAt);

  if (entry.endsAt === null) {
    return `${day}${PART_SEPARATOR}${start}`;
  }

  return `${day}${PART_SEPARATOR}${start}${SPAN_DASH}${endLabelOf(entry.startsAt, entry.endsAt)}`;
};

export const toEntryHeadline = (entry: StartEntry): string => {
  const kind = CALENDAR_KIND_LABELS[entry.kind];
  const span = formatEntrySpan(entry);

  return kind.toLowerCase() === entry.title.trim().toLowerCase()
    ? span
    : `${kind}${PART_SEPARATOR}${span}`;
};

export const entryRunningOf = (entry: EntryTiming, now: Date): EntryRunning => {
  if (!isEntryRunningAt(entry, now)) {
    return { kind: 'idle' };
  }
  if (entry.endsAt === null) {
    return { kind: 'openEnded' };
  }

  return {
    kind: 'ending',
    minutesLeft: Math.max(0, Math.ceil((Date.parse(entry.endsAt) - now.getTime()) / MS_PER_MINUTE)),
  };
};

export const toRunningNote = (entry: EntryTiming, now: Date): string | null => {
  const running = entryRunningOf(entry, now);

  if (running.kind === 'idle') {
    return null;
  }
  if (running.kind === 'openEnded') {
    return RUNNING_WORD;
  }

  return `${RUNNING_WORD}${PART_SEPARATOR}noch ${formatCountdownMinutes(running.minutesLeft)}`;
};

export const toEntryVenue = (
  venue: StartVenue | null,
  holdsKey: boolean,
): EntryVenueView | null => {
  if (venue === null) {
    return null;
  }

  const place = [trimmed(venue.zip), trimmed(venue.city)].filter(isPresent).join(' ');
  const lines = [trimmed(venue.street), trimmed(place), trimmed(venue.hint)].filter(isPresent);

  return { name: venue.name, lines, holdsKey };
};

const groupRefOf = (entry: StartEntry, groupId: number): StartGroupRef | null => {
  if (entry.ownerGroup?.groupId === groupId) {
    return entry.ownerGroup;
  }

  return entry.participatingGroups.find((group) => group.groupId === groupId) ?? null;
};

export const toEntryGroups = (entry: StartEntry): EntryGroupsView => ({
  owner: entry.ownerGroup,
  participating: entry.participatingGroups.filter(
    (group) => group.groupId !== entry.ownerGroup?.groupId,
  ),
});

export const entryRunsOf = (entry: StartEntry): EntryRuns | null => {
  const runs = entry.viewerRuns;

  if (runs === null) {
    return null;
  }

  return {
    groupName: groupRefOf(entry, runs.groupId)?.name ?? null,
    duty: trimmed(runs.function),
  };
};

export const toRunsLine = (entry: StartEntry): string | null => {
  const runs = entryRunsOf(entry);

  if (runs === null) {
    return null;
  }

  const role =
    runs.groupName === null
      ? 'Du bist Gruppen-Admin'
      : `Du bist Gruppen-Admin der Gruppe ${runs.groupName}`;

  return runs.duty === null ? role : `${role}${PART_SEPARATOR}${runs.duty}`;
};

export const toEntryOnward = (entry: StartEntry, canReadClub: boolean): EntryOnward => {
  if (canReadClub) {
    return { kind: 'calendar', day: toLocalIsoDay(entry.startsAt) };
  }

  const [groupId] = entry.viewerGroupIds;
  const group = groupId === undefined ? null : groupRefOf(entry, groupId);

  return group === null ? NO_ONWARD : { kind: 'group', groupId: group.groupId, name: group.name };
};
