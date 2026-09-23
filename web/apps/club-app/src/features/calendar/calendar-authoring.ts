import type { KkSelectOption } from '@furria/ui';
import type { CalendarEntryKind } from '@/features/club';
import type { MyGroupSummary } from '@/features/group-hub';
import { toDayNumberLabel, toTimeSpanLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type {
  CalendarCollision,
  CalendarEntry,
  CalendarEntryForm,
  CalendarEntryVisibility,
} from './schemas';

export const CLUB_OWNER_ID = 'club';
export const NO_VENUE_ID = '';

const CLUB_OWNER_OPTION_LABEL = 'Verein';
const MINUTES_PER_STEP = 15;
const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_HOUR = 60;
const DEFAULT_START_TIME = '19:00';
const DEFAULT_END_TIME = '21:00';
const ONE_COLLISION = 1;
const ARCHIVED_SUFFIX = ' — archiviert';
const PARTICIPANTS_EMPTY = 'Keine weiteren Gruppen verfügbar.';
const PARTICIPANTS_UNAVAILABLE =
  'Die Gruppen konnten nicht geladen werden. Bereits zugeordnete Gruppen bleiben erhalten.';

const KIND_ORDER: readonly CalendarEntryKind[] = [
  'training',
  'rehearsal',
  'performance',
  'meeting',
  'party',
  'other',
];

const VISIBILITY_ORDER: readonly CalendarEntryVisibility[] = ['group', 'club', 'public'];

export interface CalendarParticipantGroup {
  groupId: number;
  name: string;
}

export interface CalendarOwnerOption {
  id: string;
  ownerGroupId: number | null;
  label: string;
}

export interface CalendarEntryPayload {
  title: string;
  description: string | null;
  ownerGroupId: number | null;
  venueId: number | null;
  startsAt: string;
  endsAt: string | null;
  kind: CalendarEntryKind;
  visibility: CalendarEntryVisibility;
  asksForResponse: boolean;
  participatingGroupIds: number[];
}

export interface CalendarDayTime {
  day: string;
  time: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export const toOwnerId = (ownerGroupId: number | null): string =>
  ownerGroupId === null ? CLUB_OWNER_ID : String(ownerGroupId);

export const toOwnerOptions = (
  groups: readonly MyGroupSummary[],
  managesClubCalendar: boolean,
): CalendarOwnerOption[] => {
  const administered = groups
    .filter((group) => group.isAdmin)
    .map((group) => ({
      id: toOwnerId(group.groupId),
      ownerGroupId: group.groupId,
      label: group.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'de'));

  if (!managesClubCalendar) {
    return administered;
  }

  return [
    { id: CLUB_OWNER_ID, ownerGroupId: null, label: CLUB_OWNER_OPTION_LABEL },
    ...administered,
  ];
};

export type CalendarParticipantPool =
  | { readonly state: 'failed' }
  | { readonly state: 'ready'; readonly groups: readonly CalendarParticipantGroup[] };

export const toParticipantPool = (
  groups: readonly CalendarParticipantGroup[] | undefined,
): CalendarParticipantPool =>
  groups === undefined ? { state: 'failed' } : { state: 'ready', groups };

export const toParticipantsEmptyLabel = (pool: CalendarParticipantPool): string =>
  pool.state === 'failed' ? PARTICIPANTS_UNAVAILABLE : PARTICIPANTS_EMPTY;

export const toParticipatingGroupOptions = (
  pool: CalendarParticipantPool,
  held: readonly CalendarParticipantGroup[],
  ownerId: string,
): KkSelectOption[] => {
  const running = pool.state === 'ready' ? pool.groups : [];
  const offered = running
    .filter((group) => toOwnerId(group.groupId) !== ownerId)
    .map((group) => ({ value: toOwnerId(group.groupId), label: group.name }));
  const listed = new Set(offered.map((option) => option.value));
  const kept = held
    .filter(
      (group) => toOwnerId(group.groupId) !== ownerId && !listed.has(toOwnerId(group.groupId)),
    )
    .map((group) => ({
      value: toOwnerId(group.groupId),
      label: pool.state === 'ready' ? `${group.name}${ARCHIVED_SUFFIX}` : group.name,
    }));

  return [...offered, ...kept].sort((left, right) => left.label.localeCompare(right.label, 'de'));
};

export const toParticipatingGroupIds = (values: readonly string[], ownerId: string): number[] => [
  ...new Set(values.filter((value) => value !== ownerId).map((value) => Number(value))),
];

export const toParticipationKeptForOwner = (values: readonly string[], ownerId: string): string[] =>
  values.filter((value) => value !== ownerId);

export const toToggledParticipation = (values: readonly string[], value: string): string[] =>
  values.includes(value) ? values.filter((held) => held !== value) : [...values, value];

export const mayOwnCalendarEntry = (
  options: readonly CalendarOwnerOption[],
  ownerGroupId: number | null,
): boolean => options.some((option) => option.ownerGroupId === ownerGroupId);

export const toDefaultVisibility = (
  ownerGroupId: number | null,
  kind: CalendarEntryKind,
): CalendarEntryVisibility => {
  if (ownerGroupId === null) {
    return 'club';
  }

  return kind === 'training' ? 'club' : 'group';
};

export const toCalendarKind = (value: string): CalendarEntryKind =>
  KIND_ORDER.find((known) => known === value) ?? 'other';

export const toCalendarVisibility = (value: string): CalendarEntryVisibility =>
  VISIBILITY_ORDER.find((known) => known === value) ?? 'club';

export const toTimeChoices = (): string[] => {
  const choices: string[] = [];

  for (let minutes = 0; minutes < MINUTES_PER_DAY; minutes += MINUTES_PER_STEP) {
    choices.push(
      `${pad(Math.floor(minutes / MINUTES_PER_HOUR))}:${pad(minutes % MINUTES_PER_HOUR)}`,
    );
  }

  return choices;
};

export const toInstant = (isoDay: string, time: string): string =>
  new Date(
    Number(isoDay.slice(0, 4)),
    Number(isoDay.slice(5, 7)) - 1,
    Number(isoDay.slice(8, 10)),
    Number(time.slice(0, 2)),
    Number(time.slice(3, 5)),
  ).toISOString();

export const toDayTime = (isoInstant: string): CalendarDayTime => {
  const moment = new Date(isoInstant);

  return {
    day: toIsoDay(moment),
    time: `${pad(moment.getHours())}:${pad(moment.getMinutes())}`,
  };
};

export const toEntryPayload = (form: CalendarEntryForm): CalendarEntryPayload => {
  const description = form.description.trim();
  const endDay = form.endDay;

  return {
    title: form.title.trim(),
    description: description === '' ? null : description,
    ownerGroupId: form.ownerId === CLUB_OWNER_ID ? null : Number(form.ownerId),
    venueId: form.venueId === NO_VENUE_ID ? null : Number(form.venueId),
    startsAt: toInstant(form.startDay, form.startTime),
    endsAt: endDay === '' ? null : toInstant(endDay, form.endTime),
    kind: form.kind,
    visibility: form.visibility,
    asksForResponse: form.asksForResponse,
    participatingGroupIds: toParticipatingGroupIds(form.participatingGroupIds, form.ownerId),
  };
};

export const toEntryFormValues = (
  entry: CalendarEntry | null,
  options: readonly CalendarOwnerOption[],
  today: Date,
): CalendarEntryForm => {
  if (entry === null) {
    const ownerId = options[0]?.id ?? CLUB_OWNER_ID;
    const ownerGroupId = options[0]?.ownerGroupId ?? null;
    const startDay = toIsoDay(today);

    return {
      title: '',
      description: '',
      ownerId,
      venueId: NO_VENUE_ID,
      kind: 'meeting',
      visibility: toDefaultVisibility(ownerGroupId, 'meeting'),
      startDay,
      startTime: DEFAULT_START_TIME,
      endDay: startDay,
      endTime: DEFAULT_END_TIME,
      asksForResponse: false,
      participatingGroupIds: [],
    };
  }

  const start = toDayTime(entry.startsAt);
  const end = entry.endsAt === null ? null : toDayTime(entry.endsAt);

  return {
    title: entry.title,
    description: entry.description ?? '',
    ownerId: toOwnerId(entry.ownerGroupId),
    venueId: entry.venueId === null ? NO_VENUE_ID : String(entry.venueId),
    kind: entry.kind,
    visibility: entry.visibility,
    startDay: start.day,
    startTime: start.time,
    endDay: end?.day ?? '',
    endTime: end?.time ?? DEFAULT_END_TIME,
    asksForResponse: entry.asksForResponse,
    participatingGroupIds: entry.participatingGroups.map((group) => toOwnerId(group.groupId)),
  };
};

const atInstant = (moment: CalendarDayTime): number =>
  Date.parse(toInstant(moment.day, moment.time));

export const toEndKeptInStep = (
  previousStart: CalendarDayTime,
  nextStart: CalendarDayTime,
  end: CalendarDayTime,
): CalendarDayTime => {
  const endsAt = atInstant(end);
  const startsAt = atInstant(nextStart);

  if (endsAt >= startsAt) {
    return end;
  }

  const span = Math.max(endsAt - atInstant(previousStart), 0);

  return toDayTime(new Date(startsAt + span).toISOString());
};

export const toCollisionName = (collision: CalendarCollision): string =>
  `„${collision.title}“ (${toDayNumberLabel(collision.startsAt)} ${toTimeSpanLabel(collision.startsAt, collision.endsAt)})`;

export const toCollisionSentence = (names: readonly string[]): string | null => {
  if (names.length === 0) {
    return null;
  }
  if (names.length === ONE_COLLISION) {
    return `Der Ort ist zur selben Zeit bereits durch ${names[0]} belegt. Der Termin wurde trotzdem gespeichert.`;
  }

  return `Der Ort ist zur selben Zeit bereits durch ${names.join(', ')} belegt. Der Termin wurde trotzdem gespeichert.`;
};

const CALENDAR_ENTRY_ID_PATTERN = /^[1-9]\d*$/;

export const toCalendarEntryIdParam = (raw: string): number | null =>
  CALENDAR_ENTRY_ID_PATTERN.test(raw) ? Number(raw) : null;

export interface EntryWriteNotice {
  tone: 'success' | 'info';
  message: string;
}

export const toEntryWriteNotice = (
  baseMessage: string,
  collisions: readonly CalendarCollision[],
): EntryWriteNotice => {
  const sentence = toCollisionSentence(collisions.map(toCollisionName));

  return sentence === null
    ? { tone: 'success', message: baseMessage }
    : { tone: 'info', message: `${baseMessage} ${sentence}` };
};

export const findCalendarEntry = (
  entries: readonly CalendarEntry[],
  calendarEntryId: number | null,
): CalendarEntry | null => {
  if (calendarEntryId === null) {
    return null;
  }

  return entries.find((entry) => entry.calendarEntryId === calendarEntryId) ?? null;
};
