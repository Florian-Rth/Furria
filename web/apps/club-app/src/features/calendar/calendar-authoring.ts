import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { CalendarEntryKind } from '@/features/club/schemas';
import type { MyGroupSummary } from '@/features/group-hub/schemas';
import { toDayNumberLabel, toTimeSpanLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type {
  CalendarCollision,
  CalendarEntry,
  CalendarEntryAudience,
  CalendarEntryForm,
} from './schemas';

export const CLUB_OWNER_ID = 'club';
export const NO_VENUE_ID = '';

const CLUB_OWNER_OPTION_LABEL = 'Verein';
const TRAINING_TITLE = 'Training';
const DEFAULT_START_TIME = '19:00';
const DEFAULT_END_TIME = '21:00';
const ONE_COLLISION = 1;
const ARCHIVED_SUFFIX = ' — archiviert';
const PARTICIPANTS_EMPTY = 'Keine weiteren Gruppen verfügbar.';
const PARTICIPANTS_UNAVAILABLE = 'Die Gruppen konnten nicht geladen werden.';

export const AUTHORED_KINDS: readonly CalendarEntryKind[] = ['plain', 'training', 'trip'];

const AUDIENCE_ORDER: readonly CalendarEntryAudience[] = ['club', 'groups', 'people'];

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
  audience: CalendarEntryAudience;
  audienceGroupIds: number[];
  audiencePersonIds: number[];
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

export interface CalendarParticipantChoice extends CalendarParticipantGroup {
  isArchived: boolean;
}

export const toParticipatingGroupChoices = (
  pool: CalendarParticipantPool,
  held: readonly CalendarParticipantGroup[],
  ownerId: string,
): CalendarParticipantChoice[] => {
  const running = pool.state === 'ready' ? pool.groups : [];
  const offered = running
    .filter((group) => toOwnerId(group.groupId) !== ownerId)
    .map((group) => ({ ...group, isArchived: false }));
  const listed = new Set(offered.map((choice) => choice.groupId));
  const kept = held
    .filter((group) => toOwnerId(group.groupId) !== ownerId && !listed.has(group.groupId))
    .map((group) => ({ ...group, isArchived: pool.state === 'ready' }));

  return [...offered, ...kept].sort((left, right) => left.name.localeCompare(right.name, 'de'));
};

export const toParticipatingGroupOptions = (
  pool: CalendarParticipantPool,
  held: readonly CalendarParticipantGroup[],
  ownerId: string,
): KkSelectOption[] =>
  toParticipatingGroupChoices(pool, held, ownerId).map((choice) => ({
    value: toOwnerId(choice.groupId),
    label: choice.isArchived ? `${choice.name}${ARCHIVED_SUFFIX}` : choice.name,
  }));

export const toParticipatingGroupIds = (values: readonly string[], ownerId: string): number[] => [
  ...new Set(values.filter((value) => value !== ownerId).map((value) => Number(value))),
];

export const toParticipationKeptForOwner = (values: readonly string[], ownerId: string): string[] =>
  values.filter((value) => value !== ownerId);

export const toToggledParticipation = (values: readonly string[], value: string): string[] =>
  values.includes(value) ? values.filter((held) => held !== value) : [...values, value];

export interface CalendarEntryOwnership {
  ownerGroupId: number | null;
  kind: CalendarEntryKind;
}

export interface CalendarEntryLink {
  to: '/calendar/$calendarEntryId';
  params: { calendarEntryId: string };
}

export const toEntryLink = (
  entry: CalendarEntryOwnership & { calendarEntryId: number },
  owned: boolean,
): CalendarEntryLink | null =>
  entry.kind === 'event' || !owned
    ? null
    : {
        to: '/calendar/$calendarEntryId',
        params: { calendarEntryId: String(entry.calendarEntryId) },
      };

export const opensEntrySheet = (entry: { kind: CalendarEntryKind }): boolean =>
  entry.kind === 'event';

export const mayOwnCalendarEntry = (
  options: readonly CalendarOwnerOption[],
  entry: CalendarEntryOwnership,
): boolean =>
  entry.kind !== 'event' && options.some((option) => option.ownerGroupId === entry.ownerGroupId);

export const toDefaultAudience = (ownerId: string): CalendarEntryAudience =>
  ownerId === CLUB_OWNER_ID ? 'club' : 'groups';

type AudienceChoice = Pick<CalendarEntryForm, 'audience' | 'audienceGroupIds'>;

const followsTheOwner = (form: Pick<CalendarEntryForm, 'audienceGroupIds' | 'ownerId'>): boolean =>
  form.audienceGroupIds.length === 0 ||
  (form.audienceGroupIds.length === 1 && form.audienceGroupIds[0] === form.ownerId);

export const toAudienceAfterOwnerChange = (
  form: Pick<CalendarEntryForm, 'audience' | 'audienceGroupIds' | 'ownerId'>,
  nextOwnerId: string,
): AudienceChoice => {
  const kept = { audience: form.audience, audienceGroupIds: form.audienceGroupIds };

  if (form.audience === 'club') {
    return form.ownerId === CLUB_OWNER_ID
      ? { audience: toDefaultAudience(nextOwnerId), audienceGroupIds: [] }
      : kept;
  }
  if (form.audience !== 'groups' || !followsTheOwner(form)) {
    return kept;
  }

  return nextOwnerId === CLUB_OWNER_ID && form.ownerId !== CLUB_OWNER_ID
    ? { audience: 'groups', audienceGroupIds: [form.ownerId] }
    : { audience: 'groups', audienceGroupIds: [] };
};

export const toOfferedAudiences = (
  form: Pick<CalendarEntryForm, 'audienceGroupIds' | 'ownerId'>,
  heldAudience: CalendarEntryAudience | null,
): CalendarEntryAudience[] =>
  AUDIENCE_ORDER.filter(
    (audience) =>
      audience === 'club' ||
      audience === heldAudience ||
      (audience === 'groups' &&
        (form.ownerId !== CLUB_OWNER_ID || form.audienceGroupIds.length > 0)),
  );

export const toAudienceGroupIds = (
  form: Pick<CalendarEntryForm, 'audience' | 'audienceGroupIds' | 'ownerId'>,
): number[] => {
  if (form.audience !== 'groups') {
    return [];
  }
  if (form.audienceGroupIds.length > 0) {
    return form.audienceGroupIds.map((groupId) => Number(groupId));
  }

  return form.ownerId === CLUB_OWNER_ID ? [] : [Number(form.ownerId)];
};

export const toAudiencePersonIds = (
  form: Pick<CalendarEntryForm, 'audience' | 'audiencePersonIds'>,
): number[] =>
  form.audience === 'people' ? form.audiencePersonIds.map((personId) => Number(personId)) : [];

export const toCalendarKind = (value: string): CalendarEntryKind =>
  AUTHORED_KINDS.find((known) => known === value) ?? 'plain';

export const toCalendarAudience = (value: string): CalendarEntryAudience | null =>
  AUDIENCE_ORDER.find((known) => known === value) ?? null;

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
    audience: form.audience,
    audienceGroupIds: toAudienceGroupIds(form),
    audiencePersonIds: toAudiencePersonIds(form),
    asksForResponse: form.asksForResponse,
    participatingGroupIds: toParticipatingGroupIds(form.participatingGroupIds, form.ownerId),
  };
};

export interface CalendarEntryDraft {
  ownerGroupId: number | null;
  kind: CalendarEntryKind | null;
  startTime: string | null;
  endTime: string | null;
  venueId: number | null;
  returnGroupId: number | null;
}

export const NO_DRAFT: CalendarEntryDraft = {
  ownerGroupId: null,
  kind: null,
  startTime: null,
  endTime: null,
  venueId: null,
  returnGroupId: null,
};

export interface CalendarEntryDraftInput {
  group?: number;
  kind?: string;
  start?: string;
  end?: string;
  venue?: number;
  back?: string;
}

export const toEntryDraft = (search: CalendarEntryDraftInput): CalendarEntryDraft => ({
  ownerGroupId: search.group ?? null,
  kind: AUTHORED_KINDS.find((known) => known === search.kind) ?? null,
  startTime: search.start ?? null,
  endTime: search.end ?? null,
  venueId: search.venue ?? null,
  returnGroupId: search.back === 'group' ? (search.group ?? null) : null,
});

export interface CalendarEntryLanding {
  to: string;
  params?: Record<string, number>;
  search?: Record<string, string>;
  mark: { kind: string; id: number };
}

const ENTRY_LANDING_KIND = 'calendar-entry';

export const toEntryLanding = (
  calendarEntryId: number,
  landedDay: string,
  draft: CalendarEntryDraft,
): CalendarEntryLanding => {
  const mark = { kind: ENTRY_LANDING_KIND, id: calendarEntryId };

  if (draft.returnGroupId === null) {
    return { to: '/calendar', search: { day: landedDay }, mark };
  }

  return { to: '/groups/$groupId', params: { groupId: draft.returnGroupId }, mark };
};

const nextDayOf = (isoDay: string): string =>
  toIsoDay(
    new Date(
      Number(isoDay.slice(0, 4)),
      Number(isoDay.slice(5, 7)) - 1,
      Number(isoDay.slice(8, 10)) + 1,
    ),
  );

const toDraftedFormValues = (
  options: readonly CalendarOwnerOption[],
  startDay: string,
  draft: CalendarEntryDraft,
): CalendarEntryForm => {
  const owner =
    options.find(
      (option) => option.ownerGroupId === draft.ownerGroupId && draft.ownerGroupId !== null,
    ) ?? options[0];
  const ownerId = owner?.id ?? CLUB_OWNER_ID;
  const kind = draft.kind ?? 'plain';
  const startTime = draft.startTime ?? DEFAULT_START_TIME;
  const endTime = draft.endTime ?? DEFAULT_END_TIME;

  return {
    title: draft.kind === 'training' ? TRAINING_TITLE : '',
    description: '',
    ownerId,
    venueId: draft.venueId === null ? NO_VENUE_ID : String(draft.venueId),
    kind,
    audience: toDefaultAudience(ownerId),
    audienceGroupIds: [],
    audiencePersonIds: [],
    startDay,
    startTime,
    endDay: endTime > startTime ? startDay : nextDayOf(startDay),
    endTime,
    asksForResponse: false,
    participatingGroupIds: [],
  };
};

export const toEntryFormValues = (
  entry: CalendarEntry | null,
  options: readonly CalendarOwnerOption[],
  startDay: string,
  draft: CalendarEntryDraft,
): CalendarEntryForm => {
  if (entry === null) {
    return toDraftedFormValues(options, startDay, draft);
  }

  const start = toDayTime(entry.startsAt);
  const end = entry.endsAt === null ? null : toDayTime(entry.endsAt);

  return {
    title: entry.title,
    description: entry.description ?? '',
    ownerId: toOwnerId(entry.ownerGroupId),
    venueId: entry.venueId === null ? NO_VENUE_ID : String(entry.venueId),
    kind: entry.kind,
    audience: entry.audience,
    audienceGroupIds: entry.audienceGroups.map((group) => String(group.groupId)),
    audiencePersonIds: entry.audiencePeople.map((person) => String(person.personId)),
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
