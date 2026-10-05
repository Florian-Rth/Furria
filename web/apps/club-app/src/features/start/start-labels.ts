import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { toLocalIsoDay, toTimeLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { calendarDaysBetween } from '@/lib/club';
import type { GroupTone } from '@/lib/group-tone';
import type { StartEntry, StartGroupRef } from './schemas';

export type StampKind =
  | 'running'
  | 'countdown'
  | 'today'
  | 'tomorrow'
  | 'weekday'
  | 'date'
  | 'ditto';

export type StampTone = 'plain' | 'live' | 'today';

export interface EntryStamp {
  kind: StampKind;
  value: string | null;
  eyebrow: string;
  tone: StampTone;
  time: string;
}

export type EntryFacet =
  | { kind: 'until'; time: string }
  | { kind: 'runs'; function: string | null }
  | { kind: 'with'; group: StartGroupRef }
  | { kind: 'venue'; name: string; holdsKey: boolean };

type EntryTiming = Pick<StartEntry, 'startsAt' | 'endsAt'>;

const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const OPEN_END_MS = 3 * MINUTES_PER_HOUR * MS_PER_MINUTE;
const COUNTDOWN_REACH_MINUTES = 6 * MINUTES_PER_HOUR;
const TOMORROW = 1;
const WEEKDAY_REACH_DAYS = 6;
const DITTO_KINDS: ReadonlySet<StampKind> = new Set(['today', 'tomorrow', 'weekday', 'date']);
const RUNNING_EYEBROW = 'LÄUFT';
const COUNTDOWN_EYEBROW = 'IN';
const TODAY_EYEBROW = 'HEUTE';
const TOMORROW_EYEBROW = 'MORGEN';
const GROUP_ADMIN_FUNCTION = 'Gruppen-Admin';
const OWED_PHRASE = 'Zu-/Absage offen';
const ANSWER_PHRASE = 'Deine Antwort';
const RUNNING_PHRASE = 'Läuft seit';
const KEY_PHRASE = 'dein Schlüssel';
const NAME_SEPARATOR = ', ';
const SPOKEN_DAY_FORMAT = 'EEEE, d. MMMM';

const pad = (value: number): string => String(value).padStart(2, '0');

const endOf = (entry: EntryTiming): number =>
  entry.endsAt === null ? Date.parse(entry.startsAt) + OPEN_END_MS : Date.parse(entry.endsAt);

export const isEntryRunningAt = (entry: EntryTiming, now: Date): boolean =>
  Date.parse(entry.startsAt) <= now.getTime() && now.getTime() < endOf(entry);

export const formatCountdownMinutes = (minutes: number): string =>
  `${Math.floor(minutes / MINUTES_PER_HOUR)}:${pad(minutes % MINUTES_PER_HOUR)}`;

export const formatShortDate = (isoInstant: string): string => {
  const moment = new Date(isoInstant);

  return `${moment.getDate()}.${moment.getMonth() + 1}.`;
};

export const formatSpokenDay = (isoInstant: string): string =>
  format(new Date(isoInstant), SPOKEN_DAY_FORMAT, { locale: de });

export const formatSpokenTime = (isoInstant: string): string => {
  const moment = new Date(isoInstant);
  const minutes = moment.getMinutes();

  return minutes === 0 ? `${moment.getHours()} Uhr` : `${moment.getHours()}:${pad(minutes)} Uhr`;
};

const dayStampOf = (startsAt: string, days: number): Omit<EntryStamp, 'time'> => {
  if (days === 0) {
    return { kind: 'today', value: null, eyebrow: TODAY_EYEBROW, tone: 'today' };
  }
  if (days === TOMORROW) {
    return { kind: 'tomorrow', value: null, eyebrow: TOMORROW_EYEBROW, tone: 'plain' };
  }
  if (days > TOMORROW && days <= WEEKDAY_REACH_DAYS) {
    const weekday = toWeekdayEyebrow(startsAt);

    return { kind: 'weekday', value: weekday, eyebrow: weekday, tone: 'plain' };
  }

  const date = formatShortDate(startsAt);

  return { kind: 'date', value: date, eyebrow: date, tone: 'plain' };
};

const isSameDay = (startsAt: string, previousStartsAt: string | null): boolean =>
  previousStartsAt !== null && toLocalIsoDay(previousStartsAt) === toLocalIsoDay(startsAt);

export const toStampOf = (
  entry: EntryTiming,
  now: Date,
  previousStartsAt: string | null,
): EntryStamp => {
  const time = toTimeLabel(entry.startsAt);

  if (isEntryRunningAt(entry, now)) {
    return { kind: 'running', value: null, eyebrow: RUNNING_EYEBROW, tone: 'live', time };
  }

  const days = calendarDaysBetween(now, new Date(entry.startsAt));
  const minutesAhead = Math.ceil((Date.parse(entry.startsAt) - now.getTime()) / MS_PER_MINUTE);

  if (days === 0 && minutesAhead > 0 && minutesAhead < COUNTDOWN_REACH_MINUTES) {
    const countdown = formatCountdownMinutes(minutesAhead);

    return {
      kind: 'countdown',
      value: countdown,
      eyebrow: `${COUNTDOWN_EYEBROW} ${countdown}`,
      tone: 'today',
      time,
    };
  }

  const dayStamp = dayStampOf(entry.startsAt, days);

  if (DITTO_KINDS.has(dayStamp.kind) && isSameDay(entry.startsAt, previousStartsAt)) {
    return { kind: 'ditto', value: null, eyebrow: '', tone: 'plain', time };
  }

  return { ...dayStamp, time };
};

export const toRunningProgress = (entry: EntryTiming, now: Date): number | null => {
  if (entry.endsAt === null) {
    return null;
  }

  const start = Date.parse(entry.startsAt);
  const span = Date.parse(entry.endsAt) - start;

  if (span <= 0) {
    return null;
  }

  return Math.min(1, Math.max(0, (now.getTime() - start) / span));
};

const namesInTitle = (title: string, name: string): boolean =>
  title.toLocaleLowerCase('de').includes(name.toLocaleLowerCase('de'));

const stateFacetOf = (entry: StartEntry): EntryFacet | null => {
  if (entry.isRunning && entry.endsAt !== null) {
    return { kind: 'until', time: toTimeLabel(entry.endsAt) };
  }
  if (entry.viewerRuns !== null) {
    return { kind: 'runs', function: entry.viewerRuns.function };
  }

  return null;
};

const withFacetsOf = (entry: StartEntry): EntryFacet[] =>
  entry.participatingGroups
    .filter(
      (group) =>
        group.groupId !== entry.ownerGroup?.groupId &&
        entry.viewerGroupIds.includes(group.groupId) &&
        !namesInTitle(entry.title, group.name),
    )
    .map((group): EntryFacet => ({ kind: 'with', group }));

export const toEntryFacets = (entry: StartEntry): EntryFacet[] => {
  const state = stateFacetOf(entry);
  const venue: EntryFacet[] =
    entry.venue === null
      ? []
      : [{ kind: 'venue', name: entry.venue.name, holdsKey: entry.viewerHoldsVenueKey }];

  return [...(state === null ? [] : [state]), ...withFacetsOf(entry), ...venue];
};

export const toEntryTick = (entry: StartEntry): GroupTone | null => {
  const owner = entry.ownerGroup;

  if (
    owner === null ||
    owner.tone === null ||
    !entry.viewerGroupIds.includes(owner.groupId) ||
    namesInTitle(entry.title, owner.name)
  ) {
    return null;
  }

  return owner.tone;
};

export const toFacetText = (facet: EntryFacet): string => {
  if (facet.kind === 'until') {
    return `bis ${facet.time}`;
  }
  if (facet.kind === 'runs') {
    return `als ${facet.function ?? GROUP_ADMIN_FUNCTION}`;
  }
  if (facet.kind === 'with') {
    return `mit ${facet.group.name}`;
  }

  return facet.name;
};

const spokenFacetOf = (facet: EntryFacet): string =>
  facet.kind === 'venue' && facet.holdsKey
    ? `${facet.name}${NAME_SEPARATOR}${KEY_PHRASE}`
    : toFacetText(facet);

const spokenWhenOf = (entry: StartEntry, now: Date): string =>
  isEntryRunningAt(entry, now)
    ? `${RUNNING_PHRASE} ${formatSpokenTime(entry.startsAt)}`
    : `${formatSpokenDay(entry.startsAt)}${NAME_SEPARATOR}${formatSpokenTime(entry.startsAt)}`;

const spokenAnswerOf = (entry: StartEntry): string[] => {
  const attendance = entry.attendance;

  if (attendance === null) {
    return [];
  }
  if (attendance.viewerAnswer !== null) {
    return [`${ANSWER_PHRASE}: ${ATTENDANCE_LABELS[attendance.viewerAnswer]}`];
  }

  return attendance.isOwed ? [OWED_PHRASE] : [];
};

const spokenOwnerOf = (entry: StartEntry): string[] => {
  const owner = entry.ownerGroup;

  return owner !== null &&
    entry.viewerGroupIds.includes(owner.groupId) &&
    !namesInTitle(entry.title, owner.name)
    ? [owner.name]
    : [];
};

export const toEntryAccessibleName = (entry: StartEntry, now: Date): string =>
  [
    spokenWhenOf(entry, now),
    entry.title,
    ...spokenOwnerOf(entry),
    ...toEntryFacets(entry).map(spokenFacetOf),
    ...spokenAnswerOf(entry),
  ].join(NAME_SEPARATOR);
