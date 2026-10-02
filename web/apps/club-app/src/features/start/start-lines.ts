import type { KkDenseFacet, KkDenseLineState, KkIconName, KkLinkSearchValues } from '@furria/ui';
import type { AttendanceAnswer } from '@/features/calendar';
import { toGroupTone } from '@/features/groups';
import { toLocalIsoDay } from '@/lib/calendar-days';
import { calendarDaysBetween, sessionYearsLabelOf } from '@/lib/club';
import { toIsoDay } from '@/lib/day';
import type { GroupTone } from '@/lib/group-tone';
import { toInitials } from '@/lib/initials';
import type { PeekKind } from '@/lib/peek';
import { toPeekId } from '@/lib/peek';
import type {
  StartAnnouncement,
  StartAttendance,
  StartEntry,
  StartGroupMoment,
  StartMine,
  StartMineKind,
  StartToDo,
  ToDoKind,
} from './schemas';
import { toEntryFacets, toEntryTick, toFacetText } from './start-labels';
import { itemKeyOf } from './start-visit';

export type StartIconTone = 'muted' | 'info';

export type StartLineAnchor =
  | { kind: 'icon'; name: KkIconName; tone: StartIconTone }
  | { kind: 'number'; value: number; festive: boolean };

export type StartLineTarget =
  | { kind: 'sheet'; sheetId: string }
  | {
      kind: 'route';
      to: string;
      params: Record<string, string> | undefined;
      search: KkLinkSearchValues | undefined;
    }
  | { kind: 'none' };

export interface StartLineView {
  key: string;
  anchor: StartLineAnchor;
  tick: GroupTone | null;
  title: string;
  meta: string[];
  target: StartLineTarget;
  accessibleName: string;
  until: string;
}

export interface MineLineContext {
  today: string;
  canReadClub: boolean;
  memberSince: string | null;
}

export interface AnnouncementLineView {
  key: string;
  title: string;
  meta: string[];
  initials: string;
  portrait: string | undefined;
  accessibleName: string;
  sheetId: string;
}

export interface CountedLabel {
  one: string;
  other: string;
}

export type EntryTrailing =
  | { kind: 'ring' }
  | { kind: 'mark'; answer: AttendanceAnswer }
  | { kind: 'none' };

type MineFace = Omit<StartLineView, 'key' | 'accessibleName' | 'until'>;

const ISO_YEAR_END = 4;
const ISO_MONTH_START = 5;
const ISO_MONTH_END = 7;
const ISO_DAY_START = 8;
const YESTERDAY = 1;
const ELEVEN = 11;
const ROUND = 5;
const SINGLE = 1;
const TODAY_WORD = 'heute';
const YESTERDAY_WORD = 'gestern';
const NAME_SEPARATOR = ', ';
const GROUP_ROUTE = '/groups/$groupId';
const PROFILE_ROUTE = '/profile';
const CLUB_ROUTE = '/club';
const NO_TARGET: StartLineTarget = { kind: 'none' };
const PROFILE_TARGET: StartLineTarget = {
  kind: 'route',
  to: PROFILE_ROUTE,
  params: undefined,
  search: undefined,
};
const RING: EntryTrailing = { kind: 'ring' };
const NO_TRAILING: EntryTrailing = { kind: 'none' };

export const TO_DO_LABELS: Record<ToDoKind, CountedLabel> = {
  neverInvited: { one: 'nie eingeladen', other: 'nie eingeladen' },
  reminderDue: { one: 'Erinnerung fällig', other: 'Erinnerungen fällig' },
  inPersonOnly: { one: 'nur vor Ort einladbar', other: 'nur vor Ort einladbar' },
  birthDateUnknown: { one: 'Geburtsdatum fehlt', other: 'Geburtsdaten fehlen' },
  keyToTakeBack: { one: 'Schlüssel zurückholen', other: 'Schlüssel zurückholen' },
  clubRecordGap: { one: 'Lücke in Vereinsdaten', other: 'Lücken in Vereinsdaten' },
};

const isoPartsOf = (isoDay: string): [number, number, number] => [
  Number(isoDay.slice(0, ISO_YEAR_END)),
  Number(isoDay.slice(ISO_MONTH_START, ISO_MONTH_END)),
  Number(isoDay.slice(ISO_DAY_START)),
];

const localDayOf = (isoDay: string): Date => {
  const [year, month, day] = isoPartsOf(isoDay);

  return new Date(year, month - 1, day);
};

export const formatDayMonth = (isoDay: string): string => {
  const [, month, day] = isoPartsOf(isoDay);

  return `${day}.${month}.`;
};

export const formatFullDay = (isoDay: string): string => {
  const [year, month, day] = isoPartsOf(isoDay);

  return `${day}.${month}.${year}`;
};

export const formatPastDay = (isoDay: string, today: string): string => {
  const day = localDayOf(isoDay);
  const daysAgo = calendarDaysBetween(day, localDayOf(today));

  if (daysAgo === 0) {
    return TODAY_WORD;
  }
  if (daysAgo === YESTERDAY) {
    return YESTERDAY_WORD;
  }

  return formatDayMonth(isoDay);
};

const yearsBefore = (isoDay: string, years: number): string => {
  const [year] = isoPartsOf(isoDay);

  return `${String(year - years).padStart(ISO_YEAR_END, '0')}${isoDay.slice(ISO_YEAR_END)}`;
};

export const isRoundYears = (value: number): boolean =>
  value > 0 && (value % ROUND === 0 || value % ELEVEN === 0);

const iconAnchor = (name: KkIconName, tone: StartIconTone = 'muted'): StartLineAnchor => ({
  kind: 'icon',
  name,
  tone,
});

const numberAnchor = (value: number): StartLineAnchor => ({
  kind: 'number',
  value,
  festive: isRoundYears(value),
});

const sheetTarget = (kind: PeekKind, subjectId: number | null): StartLineTarget =>
  subjectId === null ? NO_TARGET : { kind: 'sheet', sheetId: toPeekId(kind, subjectId) };

const groupTarget = (groupId: number | null): StartLineTarget =>
  groupId === null
    ? NO_TARGET
    : { kind: 'route', to: GROUP_ROUTE, params: { groupId: String(groupId) }, search: undefined };

const venueTarget = (venueId: number | null, canReadClub: boolean): StartLineTarget =>
  venueId === null || !canReadClub
    ? NO_TARGET
    : {
        kind: 'route',
        to: CLUB_ROUTE,
        params: undefined,
        search: { sheet: toPeekId('venue', venueId) },
      };

const groupTickOf = (mine: StartMine): GroupTone | null =>
  mine.subjectId === null ? null : toGroupTone(mine.subjectId, mine.groupTone);

const newSince = (mine: StartMine, context: MineLineContext): string =>
  `neu seit ${formatPastDay(mine.on, context.today)}`;

const nameOf = (mine: StartMine): string => mine.name ?? '';

const MINE_FACES: Record<StartMineKind, (mine: StartMine, context: MineLineContext) => MineFace> = {
  newRole: (mine, context) => ({
    anchor: iconAnchor('role'),
    tick: null,
    title: `Rolle ${nameOf(mine)}`,
    meta: [newSince(mine, context)],
    target: sheetTarget('role', mine.subjectId),
  }),
  newBoardSeat: (mine, context) => ({
    anchor: iconAnchor('board'),
    tick: null,
    title: `Vorstand: ${nameOf(mine)}`,
    meta: [newSince(mine, context)],
    target: sheetTarget('office', mine.subjectId),
  }),
  newGroupAdmin: (mine, context) => ({
    anchor: iconAnchor('group'),
    tick: groupTickOf(mine),
    title: `Gruppen-Admin ${nameOf(mine)}`,
    meta: [...(mine.function === null ? [] : [mine.function]), newSince(mine, context)],
    target: groupTarget(mine.subjectId),
  }),
  newGroupMembership: (mine, context) => ({
    anchor: iconAnchor('group'),
    tick: groupTickOf(mine),
    title: `Gruppe ${nameOf(mine)}`,
    meta: [newSince(mine, context)],
    target: groupTarget(mine.subjectId),
  }),
  newKey: (mine, context) => ({
    anchor: iconAnchor('key'),
    tick: null,
    title: `Schlüssel ${nameOf(mine)}`,
    meta: [newSince(mine, context)],
    target: venueTarget(mine.subjectId, context.canReadClub),
  }),
  contactChangedByOther: (mine, context) => ({
    anchor: iconAnchor('info', 'info'),
    tick: null,
    title: 'Kontaktdaten geändert',
    meta: [
      ...(mine.changedBy === null ? [] : [`von ${mine.changedBy.firstName}`]),
      formatPastDay(mine.on, context.today),
    ],
    target: PROFILE_TARGET,
  }),
  membershipEnding: (mine) => ({
    anchor: iconAnchor('info', 'info'),
    tick: null,
    title: 'Mitgliedschaft endet',
    meta: [`am ${formatDayMonth(mine.on)}`],
    target: PROFILE_TARGET,
  }),
  membershipPaused: (mine) => ({
    anchor: iconAnchor('info', 'info'),
    tick: null,
    title: 'Mitgliedschaft ruht',
    meta:
      mine.sessionStartYear === null
        ? []
        : [`Session ${sessionYearsLabelOf(mine.sessionStartYear)}`],
    target: PROFILE_TARGET,
  }),
  milestone: (mine, context) => {
    const years = mine.years ?? 0;
    const joinedOn = context.memberSince ?? yearsBefore(mine.on, years);

    return {
      anchor: numberAnchor(years),
      tick: null,
      title: years === SINGLE ? 'Jahr seit deinem Beitritt' : 'Jahre seit deinem Beitritt',
      meta: [`Beitritt am ${formatFullDay(joinedOn)}`],
      target: PROFILE_TARGET,
    };
  },
};

const spokenLeadOf = (face: Pick<MineFace, 'anchor' | 'title'>): string =>
  face.anchor.kind === 'number' ? `${face.anchor.value} ${face.title}` : face.title;

const spokenNameOf = (face: Pick<MineFace, 'anchor' | 'title' | 'meta'>): string =>
  [spokenLeadOf(face), ...face.meta].join(NAME_SEPARATOR);

export const toMineLine = (mine: StartMine, context: MineLineContext): StartLineView => {
  const face = MINE_FACES[mine.kind](mine, context);

  return {
    ...face,
    key: itemKeyOf({ panel: 'mine', ...mine }),
    accessibleName: spokenNameOf(face),
    until: mine.until,
  };
};

export const toGroupMomentLine = (moment: StartGroupMoment): StartLineView => {
  const face: MineFace = {
    anchor: numberAnchor(moment.years),
    tick: toGroupTone(moment.groupId, moment.tone),
    title: `Jahre ${moment.name}`,
    meta: [`gegründet ${moment.foundedYear}`],
    target: groupTarget(moment.groupId),
  };

  return {
    ...face,
    key: itemKeyOf({ panel: 'groups', ...moment }),
    accessibleName: spokenNameOf(face),
    until: moment.until,
  };
};

export const toAnnouncementLine = (
  announcement: StartAnnouncement,
  now: Date,
): AnnouncementLineView => {
  const { author } = announcement;
  const day = formatPastDay(toLocalIsoDay(announcement.publishedAt), toIsoDay(now));
  const office = author.officeName === null ? [] : [author.officeName];
  const byline = `von ${author.firstName} ${author.lastName}`;

  return {
    key: itemKeyOf({ panel: 'announcements', ...announcement }),
    title: announcement.title,
    meta: [day, ...office],
    initials: toInitials(author.firstName, author.lastName),
    portrait: author.portraitUrl ?? undefined,
    accessibleName: [announcement.title, day, byline, ...office].join(NAME_SEPARATOR),
    sheetId: toPeekId('start-announcements', announcement.announcementId),
  };
};

export const toToDoLabel = (toDo: StartToDo): string => {
  const label = TO_DO_LABELS[toDo.kind];

  return toDo.count === SINGLE ? label.one : label.other;
};

export const toFootLabel = (hidden: number): string => `+${hidden} weitere`;

export const toFacets = (texts: readonly string[]): KkDenseFacet[] =>
  texts.map((text) => ({ text }));

const BYLINE_SEPARATOR = ' · ';

export const toAnnouncementByline = (announcement: StartAnnouncement, now: Date): string => {
  const { author, validUntil } = announcement;

  return [
    `${author.firstName} ${author.lastName}`,
    ...(author.officeName === null ? [] : [author.officeName]),
    formatPastDay(toLocalIsoDay(announcement.publishedAt), toIsoDay(now)),
    ...(validUntil === null ? [] : [`gültig bis ${formatDayMonth(validUntil)}`]),
  ].join(BYLINE_SEPARATOR);
};

const venueFacetOf = (holdsKey: boolean, text: string): KkDenseFacet =>
  holdsKey ? { text, icon: 'key', truncates: true } : { text, truncates: true };

export const toEntryMeta = (entry: StartEntry): KkDenseFacet[] =>
  toEntryFacets(entry).map((facet) =>
    facet.kind === 'venue'
      ? venueFacetOf(facet.holdsKey, toFacetText(facet))
      : { text: toFacetText(facet) },
  );

export const toCalendarTick = (entry: StartEntry): GroupTone | null => {
  const owner = entry.ownerGroup;

  if (owner === null) {
    return toEntryTick(entry);
  }

  return toEntryTick({
    ...entry,
    ownerGroup: { ...owner, tone: toGroupTone(owner.groupId, owner.tone) },
  });
};

export const toEntryTrailing = (attendance: StartAttendance | null): EntryTrailing => {
  if (attendance === null) {
    return NO_TRAILING;
  }
  if (attendance.viewerAnswer !== null) {
    return { kind: 'mark', answer: attendance.viewerAnswer };
  }

  return attendance.isOwed ? RING : NO_TRAILING;
};

export const toEntryLineState = (running: boolean, dimmed: boolean): KkDenseLineState => {
  if (dimmed) {
    return 'dimmed';
  }

  return running ? 'live' : 'plain';
};

export const toAnnouncementLineState = (read: boolean, dimmed: boolean): KkDenseLineState => {
  if (read) {
    return 'read';
  }

  return dimmed ? 'dimmed' : 'plain';
};
