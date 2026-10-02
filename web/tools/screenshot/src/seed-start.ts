import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ZodType } from 'zod';
import { invitationTokenOf, mailSentSince } from './seed-mail.ts';
import type { GroupDetail, PersonSummary } from './seed-schemas.ts';
import {
  AnnouncementsSchema,
  BoardSchema,
  CalendarEntriesSchema,
  CreatedBoardOfficeSchema,
  CreatedCalendarEntrySchema,
  CreatedGroupKindSchema,
  CreatedGroupSchema,
  CreatedPersonSchema,
  CreatedRoleSchema,
  CreatedVenueSchema,
  GroupDetailSchema,
  KeyHoldingsSchema,
  LoginResponseSchema,
  MailMessageSchema,
  MailSearchSchema,
  ManagedGroupsSchema,
  PersonDetailSchema,
  PersonsSchema,
  RedemptionSchema,
  RolesSchema,
  VenuesSchema,
} from './seed-schemas.ts';
import type { SqlTweak } from './seed-sql.ts';
import { sqlDay, sqlInstant, sqlScriptOf, sqlText } from './seed-sql.ts';
import type { IsoDay, Moment } from './seed-time.ts';
import {
  addDays,
  berlinInstant,
  birthdayToday,
  daysAfter,
  floorToMinutes,
  hoursAfter,
  minutesAfter,
  momentOf,
  nextMonthDay,
  nextWeekday,
} from './seed-time.ts';

type GroupTone =
  | 'clay'
  | 'olive'
  | 'lime'
  | 'fern'
  | 'teal'
  | 'indigo'
  | 'iris'
  | 'violet'
  | 'orchid'
  | 'rose';
type EntryKind = 'training' | 'rehearsal' | 'performance' | 'meeting' | 'party' | 'other';
type EntryVisibility = 'group' | 'club' | 'public';

interface Session {
  readonly label: string;
  readonly token: string;
}

interface MembershipSpec {
  readonly startedOn: IsoDay;
  readonly endedOn: IsoDay | null;
}

interface PersonSpec {
  readonly key: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly street: string | null;
  readonly zip: string | null;
  readonly city: string | null;
  readonly birthDate: IsoDay | null;
  readonly membership: MembershipSpec | null;
}

interface PersonaSpec {
  readonly key: string;
  readonly appSinceDaysAgo: number | null;
}

interface GroupSpec {
  readonly name: string;
  readonly kind: string | null;
  readonly tone: GroupTone;
  readonly foundedYear: number;
  readonly isRecruiting: boolean;
  readonly description: string;
}

interface VenueSpec {
  readonly name: string;
  readonly street: string;
  readonly zip: string;
  readonly city: string;
  readonly hint: string | null;
}

interface GroupMembershipSpec {
  readonly person: string;
  readonly group: string;
  readonly joinedOn: IsoDay;
}

interface GroupAdminSpec {
  readonly person: string;
  readonly group: string;
  readonly function: string;
  readonly sinceOn: IsoDay;
}

interface KeyHoldingSpec {
  readonly person: string;
  readonly venue: string;
  readonly sinceOn: IsoDay;
}

interface RoleSpec {
  readonly name: string;
  readonly description: string;
  readonly permissionKeys: readonly string[];
}

interface BoardOfficeSpec {
  readonly name: string;
  readonly sortOrder: number;
  readonly impliedRole: string | null;
}

interface BoardSeatSpec {
  readonly office: string;
  readonly person: string;
  readonly sinceOn: IsoDay;
}

interface EntrySpec {
  readonly key: string;
  readonly title: string;
  readonly description: string | null;
  readonly owner: string | null;
  readonly venue: string | null;
  readonly startsAt: Date;
  readonly endsAt: Date | null;
  readonly kind: EntryKind;
  readonly visibility: EntryVisibility;
  readonly asksForResponse: boolean;
  readonly participating: readonly string[];
}

interface AnnouncementSpec {
  readonly title: string;
  readonly body: string;
  readonly validUntil: IsoDay | null;
  readonly publishedAt: Date;
}

const trimSlash = (url: string): string => url.replace(/\/$/, '');

const API_BASE = trimSlash(process.env.SEED_API ?? 'http://localhost:5100');
const MAILPIT_BASE = trimSlash(process.env.SEED_MAILPIT ?? 'http://localhost:8025');
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@furria.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Furria-Dev-Admin-1!';
const PERSONA_PASSWORD = process.env.SEED_PASSWORD ?? 'Furria-Persona-1!';
const SQL_OUT = process.env.SEED_SQL_OUT ?? path.join('out', 'seed-start.sql');
const PSQL_COMMAND = process.env.SEED_PSQL ?? null;
const MAIL_WAIT_MS = 45_000;
const MAIL_POLL_MS = 750;
const MAIL_SEARCH_LIMIT = 10;
const SLOT_MINUTES = 5;
const RUNNING_SINCE_MINUTES = 30;
const CALENDAR_LOOKBACK_DAYS = 200;
const CALENDAR_LOOKAHEAD_DAYS = 199;
const INVITATION_LIFETIME_DAYS = 14;
const REMINDER_DUE_DAYS_AGO = 6;
const LENA_PHONES = ['0171 4483 902', '0171 4483 920'] as const;
const GROSSFURRA = { zip: '99706', city: 'Großfurra' } as const;

const log = (line: string): void => {
  console.log(line);
};

const fullNameOf = (firstName: string, lastName: string): string => `${firstName} ${lastName}`;

const lookUp = <TValue>(map: ReadonlyMap<string, TValue>, key: string, what: string): TValue => {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`no ${what} "${key}"`);
  }
  return value;
};

const request = async (
  method: string,
  route: string,
  session: Session | null,
  body?: object,
): Promise<Response> => {
  const headers: Record<string, string> = {};
  if (session !== null) {
    headers.authorization = `Bearer ${session.token}`;
  }
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  const response = await fetch(`${API_BASE}/api/${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `${method} /api/${route} as ${session?.label ?? 'anonymous'} → ${response.status} ${await response.text()}`,
    );
  }
  return response;
};

const getJson = async <TResult>(
  route: string,
  session: Session,
  schema: ZodType<TResult>,
): Promise<TResult> => schema.parse(await (await request('GET', route, session)).json());

const postJson = async <TResult>(
  route: string,
  session: Session | null,
  body: object,
  schema: ZodType<TResult>,
): Promise<TResult> => schema.parse(await (await request('POST', route, session, body)).json());

const send = async (
  method: 'POST' | 'PUT',
  route: string,
  session: Session,
  body: object,
): Promise<void> => {
  await request(method, route, session, body);
};

const signIn = async (label: string, email: string, password: string): Promise<Session> => {
  const login = await postJson('auth/login', null, { email, password }, LoginResponseSchema);
  return { label, token: login.accessToken };
};

const personSpecsOf = (moment: Moment): PersonSpec[] => [
  {
    key: 'lena',
    firstName: 'Lena',
    lastName: 'Brandt',
    email: 'lena.brandt@furria.local',
    phone: LENA_PHONES[0],
    street: 'Lindenweg 4',
    ...GROSSFURRA,
    birthDate: '2007-05-14',
    membership: { startedOn: '2015-09-01', endedOn: null },
  },
  {
    key: 'frank',
    firstName: 'Frank',
    lastName: 'Weber',
    email: 'frank.weber@furria.local',
    phone: '0160 9111 1111',
    street: 'Am Anger 11',
    ...GROSSFURRA,
    birthDate: '1964-03-08',
    membership: { startedOn: '1986-09-20', endedOn: null },
  },
  {
    key: 'sabine',
    firstName: 'Sabine',
    lastName: 'Roth',
    email: 'sabine.roth@furria.local',
    phone: '0152 3388 4711',
    street: 'Feldstraße 23',
    zip: '99706',
    city: 'Kleinfurra',
    birthDate: '1983-06-21',
    membership: null,
  },
  {
    key: 'kevin',
    firstName: 'Kevin',
    lastName: 'Maurer',
    email: 'kevin.maurer@furria.local',
    phone: '0176 2299 8833',
    street: 'Bergstraße 7',
    ...GROSSFURRA,
    birthDate: '1992-02-02',
    membership: null,
  },
  {
    key: 'gerd',
    firstName: 'Gerd',
    lastName: 'Lang',
    email: 'gerd.lang@furria.local',
    phone: '03632 77 41 05',
    street: 'Kirchgasse 2',
    ...GROSSFURRA,
    birthDate: birthdayToday(moment.today, 1961),
    membership: { startedOn: '1995-03-01', endedOn: null },
  },
  {
    key: 'jana',
    firstName: 'Jana',
    lastName: 'Kühn',
    email: 'jana.kuehn@furria.local',
    phone: '0157 6612 0034',
    street: 'Schulweg 9',
    ...GROSSFURRA,
    birthDate: '2002-08-30',
    membership: { startedOn: addDays(moment.today, -7), endedOn: null },
  },
  {
    key: 'mia',
    firstName: 'Mia',
    lastName: 'Schubert',
    email: 'mia.schubert@furria.local',
    phone: '0175 4410 2290',
    street: 'Rosengasse 3',
    ...GROSSFURRA,
    birthDate: '2009-02-11',
    membership: { startedOn: '2016-09-01', endedOn: null },
  },
  {
    key: 'lea',
    firstName: 'Lea',
    lastName: 'Hoffmann',
    email: 'lea.hoffmann@furria.local',
    phone: null,
    street: 'Lindenweg 17',
    ...GROSSFURRA,
    birthDate: '2010-07-23',
    membership: { startedOn: '2017-09-01', endedOn: null },
  },
  {
    key: 'emily',
    firstName: 'Emily',
    lastName: 'Krause',
    email: null,
    phone: '0151 9020 3344',
    street: 'Teichstraße 5',
    ...GROSSFURRA,
    birthDate: '2008-12-03',
    membership: { startedOn: '2015-09-01', endedOn: null },
  },
  {
    key: 'sophie',
    firstName: 'Sophie',
    lastName: 'Wagner',
    email: 'sophie.wagner@furria.local',
    phone: '0170 5566 7788',
    street: 'Am Ring 2',
    ...GROSSFURRA,
    birthDate: '2001-04-17',
    membership: { startedOn: '2008-11-11', endedOn: null },
  },
  {
    key: 'paula',
    firstName: 'Paula',
    lastName: 'Richter',
    email: null,
    phone: null,
    street: 'Mühlweg 8',
    ...GROSSFURRA,
    birthDate: '2017-05-30',
    membership: { startedOn: '2023-09-01', endedOn: null },
  },
  {
    key: 'lina',
    firstName: 'Lina',
    lastName: 'Schmidt',
    email: null,
    phone: null,
    street: 'Gartenstraße 14',
    zip: '99706',
    city: 'Kleinfurra',
    birthDate: '2018-10-09',
    membership: { startedOn: '2024-09-01', endedOn: null },
  },
  {
    key: 'thomas',
    firstName: 'Thomas',
    lastName: 'Becker',
    email: 'thomas.becker@furria.local',
    phone: '0162 7781 0045',
    street: 'Bergstraße 21',
    ...GROSSFURRA,
    birthDate: '1985-01-19',
    membership: { startedOn: '2011-11-11', endedOn: null },
  },
  {
    key: 'dirk',
    firstName: 'Dirk',
    lastName: 'Neumann',
    email: 'dirk.neumann@furria.local',
    phone: null,
    street: null,
    zip: null,
    city: null,
    birthDate: null,
    membership: { startedOn: '2013-11-11', endedOn: null },
  },
  {
    key: 'uwe',
    firstName: 'Uwe',
    lastName: 'Zimmermann',
    email: null,
    phone: '03632 77 18 30',
    street: null,
    zip: null,
    city: null,
    birthDate: null,
    membership: null,
  },
  {
    key: 'bernd',
    firstName: 'Bernd',
    lastName: 'Schulze',
    email: 'bernd.schulze@furria.local',
    phone: '0160 3344 1100',
    street: 'Hauptstraße 30',
    ...GROSSFURRA,
    birthDate: '1968-09-05',
    membership: { startedOn: '1990-11-11', endedOn: null },
  },
  {
    key: 'klaus',
    firstName: 'Klaus',
    lastName: 'Fischer',
    email: 'klaus.fischer@furria.local',
    phone: '03632 77 22 61',
    street: 'Kirchgasse 9',
    ...GROSSFURRA,
    birthDate: null,
    membership: { startedOn: '1975-11-11', endedOn: null },
  },
  {
    key: 'juergen',
    firstName: 'Jürgen',
    lastName: 'Meyer',
    email: 'juergen.meyer@furria.local',
    phone: '0171 2200 1971',
    street: 'Am Anger 3',
    ...GROSSFURRA,
    birthDate: '1960-01-27',
    membership: { startedOn: '1982-11-11', endedOn: null },
  },
  {
    key: 'horst',
    firstName: 'Horst',
    lastName: 'Schäfer',
    email: 'horst.schaefer@furria.local',
    phone: '03632 77 10 04',
    street: 'Festplatz 4',
    ...GROSSFURRA,
    birthDate: '1952-08-14',
    membership: { startedOn: '1979-11-11', endedOn: '2025-12-31' },
  },
];

const PERSONAS: readonly PersonaSpec[] = [
  { key: 'lena', appSinceDaysAgo: 143 },
  { key: 'frank', appSinceDaysAgo: 188 },
  { key: 'sabine', appSinceDaysAgo: 121 },
  { key: 'kevin', appSinceDaysAgo: 4 },
  { key: 'gerd', appSinceDaysAgo: 167 },
  { key: 'jana', appSinceDaysAgo: null },
];

const REMINDER_DUE_KEYS: readonly string[] = ['bernd', 'sophie'];

const ANNOUNCEMENTS_SEEN_KEYS: readonly string[] = ['lena', 'gerd'];

const GROUP_KINDS: readonly string[] = ['Tanzgarde', 'Männerballett', 'Organisation'];

const GROUPS: readonly GroupSpec[] = [
  {
    name: 'Tanzgarde',
    kind: 'Tanzgarde',
    tone: 'rose',
    foundedYear: 2001,
    isRecruiting: true,
    description:
      'Gardetanz und Showtanz ab 12 Jahren. Wir trainieren zweimal die Woche in der Sporthalle Am Ring und tanzen auf allen Sitzungen.',
  },
  {
    name: 'Kindergarde',
    kind: null,
    tone: 'teal',
    foundedYear: 1996,
    isRecruiting: true,
    description:
      'Die Jüngsten im Verein: tanzen, spielen und die ersten Auftritte auf der Kinderfasching-Bühne.',
  },
  {
    name: 'Männerballett',
    kind: 'Männerballett',
    tone: 'indigo',
    foundedYear: 2011,
    isRecruiting: true,
    description:
      'Zwölf Männer, ein Fundus voller Tutus und jedes Jahr eine neue Nummer für die Prunksitzung.',
  },
  {
    name: 'Elferrat',
    kind: 'Organisation',
    tone: 'clay',
    foundedYear: 1971,
    isRecruiting: false,
    description:
      'Der Elferrat führt durch die Sitzungen, plant die Session und hält den Laden zusammen.',
  },
];

const VENUES: readonly VenueSpec[] = [
  {
    name: 'Sporthalle Am Ring',
    street: 'Am Ring 7',
    ...GROSSFURRA,
    hint: 'Eingang über den Schulhof. Hallenschuhe mitbringen, Straßenschuhe bleiben im Flur.',
  },
  { name: 'Festhalle Großfurra', street: 'Festplatz 1', ...GROSSFURRA, hint: null },
  { name: 'Vereinsraum', street: 'Hauptstraße 12', ...GROSSFURRA, hint: null },
];

const ROLES: readonly RoleSpec[] = [
  {
    name: 'Präsidium',
    description:
      'Was das Präsidentenamt braucht: Personen, Zugänge, Aushänge, Vereinsdaten, Kalender und Schlüssel.',
    permissionKeys: [
      'persons.manage',
      'accounts.manage',
      'announcements.post',
      'club.manage',
      'calendar.manage_club',
      'key_holdings.manage',
    ],
  },
];

const BOARD_OFFICES: readonly BoardOfficeSpec[] = [
  { name: 'Präsident', sortOrder: 1, impliedRole: 'Präsidium' },
  { name: 'Schatzmeister', sortOrder: 2, impliedRole: null },
];

const groupMembershipsOf = (moment: Moment): GroupMembershipSpec[] => [
  { person: 'lena', group: 'Tanzgarde', joinedOn: '2021-09-01' },
  { person: 'mia', group: 'Tanzgarde', joinedOn: '2019-09-01' },
  { person: 'lea', group: 'Tanzgarde', joinedOn: '2020-09-01' },
  { person: 'emily', group: 'Tanzgarde', joinedOn: '2018-09-01' },
  { person: 'sophie', group: 'Tanzgarde', joinedOn: '2014-09-01' },
  { person: 'paula', group: 'Kindergarde', joinedOn: '2023-09-01' },
  { person: 'lina', group: 'Kindergarde', joinedOn: '2024-09-01' },
  { person: 'kevin', group: 'Männerballett', joinedOn: addDays(moment.today, -5) },
  { person: 'thomas', group: 'Männerballett', joinedOn: '2011-10-01' },
  { person: 'dirk', group: 'Männerballett', joinedOn: '2013-10-01' },
  { person: 'uwe', group: 'Männerballett', joinedOn: '2011-10-01' },
  { person: 'frank', group: 'Elferrat', joinedOn: '1990-11-11' },
  { person: 'bernd', group: 'Elferrat', joinedOn: '2001-11-11' },
  { person: 'klaus', group: 'Elferrat', joinedOn: '1985-11-11' },
  { person: 'juergen', group: 'Elferrat', joinedOn: '1994-11-11' },
];

const GROUP_ADMINS: readonly GroupAdminSpec[] = [
  { person: 'sabine', group: 'Kindergarde', function: 'Trainerin', sinceOn: '2018-09-01' },
  { person: 'sophie', group: 'Tanzgarde', function: 'Trainerin', sinceOn: '2022-09-01' },
  { person: 'thomas', group: 'Männerballett', function: 'Trainer', sinceOn: '2015-10-01' },
  { person: 'bernd', group: 'Elferrat', function: 'Sitzungspräsident', sinceOn: '2010-11-11' },
];

const keyHoldingsOf = (moment: Moment): KeyHoldingSpec[] => [
  { person: 'lena', venue: 'Sporthalle Am Ring', sinceOn: addDays(moment.today, -2) },
  { person: 'sabine', venue: 'Sporthalle Am Ring', sinceOn: '2019-08-15' },
  { person: 'frank', venue: 'Vereinsraum', sinceOn: '2012-01-15' },
  { person: 'bernd', venue: 'Festhalle Großfurra', sinceOn: '2016-01-10' },
  { person: 'horst', venue: 'Festhalle Großfurra', sinceOn: '2004-05-01' },
];

const boardSeatsOf = (moment: Moment): BoardSeatSpec[] => [
  { office: 'Präsident', person: 'frank', sinceOn: addDays(moment.today, -3) },
  { office: 'Schatzmeister', person: 'juergen', sinceOn: '2019-03-01' },
];

const entrySpecsOf = (moment: Moment): EntrySpec[] => {
  const tomorrow = addDays(moment.today, 1);
  const runningStart = floorToMinutes(
    minutesAfter(moment.now, -RUNNING_SINCE_MINUTES),
    SLOT_MINUTES,
  );
  const generalprobeDay = addDays(moment.today, 5);
  const tuesday = nextWeekday(moment.today, 2);
  const wednesday = nextWeekday(moment.today, 3);
  const saturday = nextWeekday(moment.today, 6);
  const opening = nextMonthDay(moment.today, '11-11');
  const christmasParty = nextMonthDay(moment.today, '12-11');
  const assembly = addDays(moment.today, 21);
  const at = berlinInstant;
  return [
    {
      key: 'tanzgardeTraining',
      title: 'Training',
      description: 'Schwerpunkt: Marsch für die Sessionseröffnung, danach Hebungen.',
      owner: 'Tanzgarde',
      venue: 'Sporthalle Am Ring',
      startsAt: runningStart,
      endsAt: hoursAfter(runningStart, 2),
      kind: 'training',
      visibility: 'group',
      asksForResponse: false,
      participating: [],
    },
    {
      key: 'kindergardeTraining',
      title: 'Training',
      description: 'Bitte Turnschuhe und etwas zu trinken mitbringen.',
      owner: 'Kindergarde',
      venue: 'Sporthalle Am Ring',
      startsAt: at(tomorrow, '17:00'),
      endsAt: at(tomorrow, '18:00'),
      kind: 'training',
      visibility: 'group',
      asksForResponse: false,
      participating: [],
    },
    {
      key: 'stellprobe',
      title: 'Stellprobe',
      description: 'Erste Probe auf der großen Bühne. Gardestiefel mitbringen, Kostüm noch nicht.',
      owner: 'Tanzgarde',
      venue: 'Festhalle Großfurra',
      startsAt: at(tomorrow, '18:00'),
      endsAt: at(tomorrow, '20:00'),
      kind: 'rehearsal',
      visibility: 'group',
      asksForResponse: true,
      participating: [],
    },
    {
      key: 'generalprobe',
      title: 'Generalprobe',
      description:
        'Die ganze Sessionseröffnung einmal durch, in Kostüm, mit Elferrat und Männerballett.',
      owner: 'Tanzgarde',
      venue: 'Festhalle Großfurra',
      startsAt: at(generalprobeDay, '19:00'),
      endsAt: at(generalprobeDay, '21:30'),
      kind: 'rehearsal',
      visibility: 'group',
      asksForResponse: true,
      participating: ['Männerballett', 'Elferrat'],
    },
    {
      key: 'maennerballettTraining',
      title: 'Training',
      description: 'Neue Nummer, zweiter Teil. Tutus bleiben noch im Schrank.',
      owner: 'Männerballett',
      venue: 'Sporthalle Am Ring',
      startsAt: at(tuesday, '20:00'),
      endsAt: at(tuesday, '21:30'),
      kind: 'training',
      visibility: 'group',
      asksForResponse: true,
      participating: [],
    },
    {
      key: 'elferratSitzung',
      title: 'Elferratssitzung',
      description: 'Ablauf 11.11., Kartenvorverkauf, Helferliste für den Hallenaufbau.',
      owner: 'Elferrat',
      venue: 'Vereinsraum',
      startsAt: at(wednesday, '19:30'),
      endsAt: at(wednesday, '21:30'),
      kind: 'meeting',
      visibility: 'group',
      asksForResponse: true,
      participating: [],
    },
    {
      key: 'kostuemboerse',
      title: 'Kostümbörse',
      description: 'Zu klein gewordene Kostüme abgeben, tauschen oder für kleines Geld mitnehmen.',
      owner: null,
      venue: 'Vereinsraum',
      startsAt: at(saturday, '14:11'),
      endsAt: at(saturday, '17:00'),
      kind: 'other',
      visibility: 'club',
      asksForResponse: false,
      participating: [],
    },
    {
      key: 'mitgliederversammlung',
      title: 'Mitgliederversammlung',
      description: 'Bericht des Vorstands, Kassenbericht, Ausblick auf die Session.',
      owner: null,
      venue: 'Vereinsraum',
      startsAt: at(assembly, '19:30'),
      endsAt: at(assembly, '21:30'),
      kind: 'meeting',
      visibility: 'club',
      asksForResponse: false,
      participating: [],
    },
    {
      key: 'sessionseroeffnung',
      title: 'Sessionseröffnung',
      description: 'Schlüsselübergabe am Rathaus um 11:11, danach feiern wir in der Festhalle.',
      owner: null,
      venue: 'Festhalle Großfurra',
      startsAt: at(opening, '11:11'),
      endsAt: at(opening, '18:00'),
      kind: 'performance',
      visibility: 'public',
      asksForResponse: true,
      participating: ['Tanzgarde', 'Elferrat', 'Männerballett'],
    },
    {
      key: 'weihnachtsfeier',
      title: 'Weihnachtsfeier',
      description: 'Für alle Mitglieder und Gruppen, mit Wichteln.',
      owner: null,
      venue: 'Festhalle Großfurra',
      startsAt: at(christmasParty, '18:00'),
      endsAt: at(christmasParty, '23:00'),
      kind: 'party',
      visibility: 'club',
      asksForResponse: false,
      participating: [],
    },
  ];
};

const announcementSpecsOf = (moment: Moment): AnnouncementSpec[] => {
  const opening = nextMonthDay(moment.today, '11-11');
  return [
    {
      title: 'Kartenvorverkauf startet am 11.11.',
      body: 'Ab dem 11.11. um 11:11 gibt es die Karten für beide Prunksitzungen im Vereinsraum und online. Mitglieder können vorab bis zu vier Karten reservieren, einfach bei mir melden.',
      validUntil: opening,
      publishedAt: hoursAfter(moment.now, -3),
    },
    {
      title: 'Helfer für den Hallenaufbau gesucht',
      body: 'Für die Sessionseröffnung bauen wir am Vorabend ab 17 Uhr die Festhalle auf: Bühne, Tische, Deko. Jede Hand hilft, Brotzeit und Getränke gibt es vom Verein.',
      validUntil: addDays(opening, -1),
      publishedAt: hoursAfter(moment.now, -27),
    },
    {
      title: 'Neue Trainingszeiten Kindergarde',
      body: 'Ab sofort trainiert die Kindergarde samstags von 17 bis 18 Uhr in der Sporthalle Am Ring. Bitte die Kinder pünktlich bringen und abholen.',
      validUntil: null,
      publishedAt: hoursAfter(moment.now, -52),
    },
    {
      title: 'Danke fürs Sommerfest',
      body: 'Danke an alle, die beim Sommerfest geholfen haben! Der Erlös von 1.111 Euro geht komplett in die neuen Kostüme der Kindergarde.',
      validUntil: null,
      publishedAt: daysAfter(moment.now, -12),
    },
  ];
};

const ensureClubRecord = async (admin: Session): Promise<void> => {
  await send('PUT', 'manage/club-record/identity', admin, {
    name: 'Furrscher Carnevals Club e.V.',
    shortName: 'FCC',
    foundedYear: 1971,
  });
  await send('PUT', 'manage/club-record/contact', admin, {
    street: null,
    zip: null,
    city: null,
    email: null,
    phone: '03632 77 11 11',
    websiteUrl: null,
    instagramUrl: 'https://www.instagram.com/fcc.grossfurra',
    facebookUrl: null,
  });
  log('club record: name, short name, founded year, phone; address and e-mail left as gaps');
};

const ensureGroups = async (admin: Session): Promise<Map<string, number>> => {
  const before = await getJson('manage/groups', admin, ManagedGroupsSchema);
  const kindIds = new Map(before.kinds.map((kind) => [kind.name, kind.groupKindId]));
  for (const kind of GROUP_KINDS) {
    if (!kindIds.has(kind)) {
      const created = await postJson(
        'manage/groups/kinds',
        admin,
        { name: kind },
        CreatedGroupKindSchema,
      );
      kindIds.set(kind, created.groupKindId);
    }
  }
  const groupIds = new Map(before.groups.map((group) => [group.name, group.groupId]));
  for (const group of GROUPS) {
    const groupKindId = group.kind === null ? null : lookUp(kindIds, group.kind, 'group kind');
    if (!groupIds.has(group.name)) {
      const created = await postJson(
        'manage/groups',
        admin,
        { name: group.name, groupKindId },
        CreatedGroupSchema,
      );
      groupIds.set(group.name, created.groupId);
    }
    await send('PUT', `groups/${lookUp(groupIds, group.name, 'group')}/info`, admin, {
      description: group.description,
      isRecruiting: group.isRecruiting,
      groupKindId,
      foundedYear: group.foundedYear,
      tone: group.tone,
    });
  }
  log(`groups: ${GROUPS.map((group) => group.name).join(', ')}`);
  return groupIds;
};

const ensureVenues = async (admin: Session): Promise<Map<string, number>> => {
  const existing = await getJson('manage/venues', admin, VenuesSchema);
  const venueIds = new Map(existing.venues.map((venue) => [venue.name, venue.venueId]));
  for (const venue of VENUES) {
    const venueId = venueIds.get(venue.name);
    if (venueId === undefined) {
      const created = await postJson('manage/venues', admin, venue, CreatedVenueSchema);
      venueIds.set(venue.name, created.venueId);
    } else {
      await send('PUT', `manage/venues/${venueId}`, admin, venue);
    }
  }
  log(`venues: ${VENUES.map((venue) => venue.name).join(', ')}`);
  return venueIds;
};

const ensureRoles = async (admin: Session): Promise<Map<string, number>> => {
  const existing = await getJson('manage/roles', admin, RolesSchema);
  const roleIds = new Map(existing.roles.map((role) => [role.name, role.roleId]));
  for (const role of ROLES) {
    if (!roleIds.has(role.name)) {
      const created = await postJson(
        'manage/roles',
        admin,
        { name: role.name, description: role.description },
        CreatedRoleSchema,
      );
      roleIds.set(role.name, created.roleId);
    }
    await send('PUT', `manage/roles/${lookUp(roleIds, role.name, 'role')}/permissions`, admin, {
      permissionKeys: role.permissionKeys,
    });
  }
  log(
    `roles: ${ROLES.map((role) => `${role.name} (${role.permissionKeys.join(', ')})`).join('; ')}`,
  );
  return roleIds;
};

const ensureBoardOffices = async (
  admin: Session,
  roleIds: ReadonlyMap<string, number>,
): Promise<Map<string, number>> => {
  const existing = await getJson('manage/board', admin, BoardSchema);
  const officeIds = new Map(existing.offices.map((office) => [office.name, office.boardOfficeId]));
  for (const office of BOARD_OFFICES) {
    if (!officeIds.has(office.name)) {
      const created = await postJson(
        'manage/board/offices',
        admin,
        { name: office.name, sortOrder: office.sortOrder },
        CreatedBoardOfficeSchema,
      );
      officeIds.set(office.name, created.boardOfficeId);
    }
    const impliedRoleId =
      office.impliedRole === null ? null : lookUp(roleIds, office.impliedRole, 'role');
    await send(
      'PUT',
      `manage/board/offices/${lookUp(officeIds, office.name, 'board office')}/implied-role`,
      admin,
      { impliedRoleId },
    );
  }
  return officeIds;
};

const personBodyOf = (spec: PersonSpec): object => ({
  firstName: spec.firstName,
  lastName: spec.lastName,
  email: spec.email,
  phone: spec.phone,
  street: spec.street,
  zip: spec.zip,
  city: spec.city,
  birthDate: spec.birthDate,
  contactVisibleToMembers: spec.email !== null,
});

const listPersons = async (session: Session): Promise<Map<string, PersonSummary>> => {
  const { persons } = await getJson('manage/persons', session, PersonsSchema);
  return new Map(persons.map((person) => [fullNameOf(person.firstName, person.lastName), person]));
};

const ensurePersons = async (
  admin: Session,
  specs: readonly PersonSpec[],
): Promise<Map<string, number>> => {
  const existing = await listPersons(admin);
  const personIds = new Map<string, number>();
  for (const spec of specs) {
    const found = existing.get(fullNameOf(spec.firstName, spec.lastName));
    if (found === undefined) {
      const created = await postJson(
        'manage/persons',
        admin,
        personBodyOf(spec),
        CreatedPersonSchema,
      );
      personIds.set(spec.key, created.personId);
    } else {
      personIds.set(spec.key, found.personId);
      if (found.birthDate !== spec.birthDate) {
        await send('PUT', `manage/persons/${found.personId}`, admin, {
          firstName: found.firstName,
          lastName: found.lastName,
          email: found.email,
          phone: found.phone,
          street: found.street,
          zip: found.zip,
          city: found.city,
          birthDate: spec.birthDate,
          contactVisibleToMembers: found.contactVisibleToMembers,
        });
      }
    }
  }
  log(`persons: ${specs.length} (${PERSONAS.length} personas)`);
  return personIds;
};

const ensureMemberships = async (
  admin: Session,
  specs: readonly PersonSpec[],
  personIds: ReadonlyMap<string, number>,
): Promise<void> => {
  for (const spec of specs) {
    if (spec.membership === null) {
      continue;
    }
    const personId = lookUp(personIds, spec.key, 'person');
    const detail = await getJson(`manage/persons/${personId}`, admin, PersonDetailSchema);
    const current = detail.memberships[0];
    if (current === undefined) {
      await send('POST', `manage/persons/${personId}/memberships`, admin, spec.membership);
    } else if (
      current.startedOn !== spec.membership.startedOn ||
      current.endedOn !== spec.membership.endedOn
    ) {
      await send(
        'PUT',
        `manage/persons/${personId}/memberships/${current.membershipId}`,
        admin,
        spec.membership,
      );
    }
  }
  log('memberships: in place');
};

const groupDetailOf = (admin: Session, groupId: number): Promise<GroupDetail> =>
  getJson(`groups/${groupId}`, admin, GroupDetailSchema);

const hasPerson = (rows: readonly { readonly personId: number }[], personId: number): boolean =>
  rows.some((row) => row.personId === personId);

const ensureGroupTies = async (
  admin: Session,
  moment: Moment,
  groupIds: ReadonlyMap<string, number>,
  personIds: ReadonlyMap<string, number>,
): Promise<void> => {
  for (const tie of groupMembershipsOf(moment)) {
    const groupId = lookUp(groupIds, tie.group, 'group');
    const personId = lookUp(personIds, tie.person, 'person');
    const detail = await groupDetailOf(admin, groupId);
    if (!hasPerson(detail.members, personId) && !hasPerson(detail.pastMembers, personId)) {
      await send('POST', `groups/${groupId}/memberships`, admin, {
        personId,
        joinedOn: tie.joinedOn,
      });
    }
  }
  for (const tenure of GROUP_ADMINS) {
    const groupId = lookUp(groupIds, tenure.group, 'group');
    const personId = lookUp(personIds, tenure.person, 'person');
    const detail = await groupDetailOf(admin, groupId);
    if (!hasPerson(detail.admins, personId) && !hasPerson(detail.pastAdmins, personId)) {
      await send('POST', `groups/${groupId}/admins`, admin, {
        personId,
        function: tenure.function,
        sinceOn: tenure.sinceOn,
      });
    }
  }
  log('group memberships and admin tenures: in place');
};

const ensureKeys = async (
  admin: Session,
  moment: Moment,
  venueIds: ReadonlyMap<string, number>,
  personIds: ReadonlyMap<string, number>,
): Promise<void> => {
  const existing = await getJson('manage/keys', admin, KeyHoldingsSchema);
  for (const holding of keyHoldingsOf(moment)) {
    const venueId = lookUp(venueIds, holding.venue, 'venue');
    const personId = lookUp(personIds, holding.person, 'person');
    const isHeld = existing.venues.some(
      (venue) =>
        venue.venueId === venueId &&
        venue.holdings.some((row) => row.personId === personId && row.untilOn === null),
    );
    if (!isHeld) {
      await send('POST', 'manage/keys', admin, { venueId, personId, sinceOn: holding.sinceOn });
    }
  }
  log('keys: in place');
};

const ensureBoardSeats = async (
  admin: Session,
  moment: Moment,
  officeIds: ReadonlyMap<string, number>,
  personIds: ReadonlyMap<string, number>,
): Promise<void> => {
  const board = await getJson('manage/board', admin, BoardSchema);
  for (const seat of boardSeatsOf(moment)) {
    const boardOfficeId = lookUp(officeIds, seat.office, 'board office');
    const personId = lookUp(personIds, seat.person, 'person');
    const isSeated = board.offices.some(
      (office) => office.boardOfficeId === boardOfficeId && hasPerson(office.seats, personId),
    );
    if (!isSeated) {
      await send('POST', `manage/board/offices/${boardOfficeId}/seats`, admin, {
        personId,
        sinceOn: seat.sinceOn,
      });
    }
  }
  log('board seats: in place');
};

const pause = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const mailpitJson = async <TResult>(route: string, schema: ZodType<TResult>): Promise<TResult> => {
  const response = await fetch(`${MAILPIT_BASE}/api/v1/${route}`);
  if (!response.ok) {
    throw new Error(`Mailpit ${route} → ${response.status}`);
  }
  return schema.parse(await response.json());
};

const invitationTokenFor = async (email: string, sentAfter: Date): Promise<string> => {
  const deadline = Date.now() + MAIL_WAIT_MS;
  while (Date.now() < deadline) {
    const search = await mailpitJson(
      `search?query=${encodeURIComponent(`to:${email}`)}&limit=${MAIL_SEARCH_LIMIT}`,
      MailSearchSchema,
    );
    const mail = mailSentSince(search.messages, sentAfter);
    if (mail !== null) {
      const message = await mailpitJson(`message/${mail.ID}`, MailMessageSchema);
      const token = invitationTokenOf(message.Text);
      if (token === null) {
        throw new Error(`the invitation mail to ${email} carries no link`);
      }
      return token;
    }
    await pause(MAIL_POLL_MS);
  }
  throw new Error(`no invitation mail reached ${email} within ${MAIL_WAIT_MS / 1000} s`);
};

const inviteAndRedeem = async (admin: Session, personId: number, email: string): Promise<void> => {
  const sentAfter = new Date();
  await send('POST', `manage/persons/${personId}/invitations`, admin, {});
  const token = await invitationTokenFor(email, sentAfter);
  const redemption = await postJson(
    'auth/invitations/redeem',
    null,
    { token, password: PERSONA_PASSWORD },
    RedemptionSchema,
  );
  if (redemption.outcome !== 'redeemed') {
    throw new Error(`redeeming the invitation of ${email} ended as ${redemption.outcome}`);
  }
};

const ensureAccounts = async (
  admin: Session,
  moment: Moment,
  specs: ReadonlyMap<string, PersonSpec>,
  personIds: ReadonlyMap<string, number>,
  groupIds: ReadonlyMap<string, number>,
): Promise<void> => {
  const persons = await listPersons(admin);
  for (const persona of PERSONAS) {
    const spec = lookUp(specs, persona.key, 'person spec');
    const personId = lookUp(personIds, persona.key, 'person');
    const summary = persons.get(fullNameOf(spec.firstName, spec.lastName));
    if (summary?.accessState === 'active' || spec.email === null) {
      continue;
    }
    if (persona.key === 'sabine') {
      const kindergardeId = lookUp(groupIds, 'Kindergarde', 'group');
      const detail = await groupDetailOf(admin, kindergardeId);
      if (!hasPerson(detail.members, personId)) {
        await send('POST', `groups/${kindergardeId}/memberships`, admin, {
          personId,
          joinedOn: moment.today,
        });
      }
    }
    await inviteAndRedeem(admin, personId, spec.email);
    log(`account: ${spec.email} redeemed`);
  }
  for (const key of REMINDER_DUE_KEYS) {
    const spec = lookUp(specs, key, 'person spec');
    const summary = persons.get(fullNameOf(spec.firstName, spec.lastName));
    if (summary?.accessState === 'none') {
      await send(
        'POST',
        `manage/persons/${lookUp(personIds, key, 'person')}/invitations`,
        admin,
        {},
      );
      log(`invitation: ${spec.email} left open`);
    }
  }
};

const ensureLenaPhoneChangedByFrank = async (
  frank: Session,
  personIds: ReadonlyMap<string, number>,
): Promise<void> => {
  const lenaId = lookUp(personIds, 'lena', 'person');
  const frankId = lookUp(personIds, 'frank', 'person');
  const lena = await getJson(`manage/persons/${lenaId}`, frank, PersonDetailSchema);
  if (lena.contactChange?.changedBy.personId === frankId) {
    return;
  }
  await send('PUT', `manage/persons/${lenaId}`, frank, {
    firstName: lena.firstName,
    lastName: lena.lastName,
    email: lena.email,
    phone: lena.phone === LENA_PHONES[1] ? LENA_PHONES[0] : LENA_PHONES[1],
    street: lena.street,
    zip: lena.zip,
    city: lena.city,
    birthDate: lena.birthDate,
    contactVisibleToMembers: lena.contactVisibleToMembers,
  });
  log("contact: Frank corrected Lena's phone number");
};

const ensureAnnouncements = async (
  frank: Session,
  specs: readonly AnnouncementSpec[],
): Promise<void> => {
  const existing = await getJson('announcements', frank, AnnouncementsSchema);
  const titles = new Set(existing.announcements.map((announcement) => announcement.title));
  for (const spec of specs) {
    if (!titles.has(spec.title)) {
      await send('POST', 'announcements', frank, {
        title: spec.title,
        body: spec.body,
        validUntil: spec.validUntil,
      });
    }
  }
  log(`announcements by Frank: ${specs.map((spec) => spec.title).join(' | ')}`);
};

const entryLookupKeyOf = (title: string, ownerGroupId: number | null): string =>
  `${title}|${ownerGroupId ?? 'club'}`;

const visibleEntriesOf = async (
  routes: readonly { readonly session: Session; readonly route: string }[],
): Promise<Map<string, number>> => {
  const entryIds = new Map<string, number>();
  for (const { session, route } of routes) {
    const { entries } = await getJson(route, session, CalendarEntriesSchema);
    for (const entry of entries) {
      entryIds.set(entryLookupKeyOf(entry.title, entry.ownerGroupId), entry.calendarEntryId);
    }
  }
  return entryIds;
};

const ensureCalendar = async (
  admin: Session,
  viewers: ReadonlyMap<string, Session>,
  moment: Moment,
  groupIds: ReadonlyMap<string, number>,
  venueIds: ReadonlyMap<string, number>,
): Promise<Map<string, number>> => {
  const span = `from=${addDays(moment.today, -CALENDAR_LOOKBACK_DAYS)}&to=${addDays(moment.today, CALENDAR_LOOKAHEAD_DAYS)}`;
  const known = await visibleEntriesOf([
    { session: lookUp(viewers, 'lena', 'session'), route: `calendar?scope=all&${span}` },
    { session: lookUp(viewers, 'frank', 'session'), route: `calendar?scope=all&${span}` },
    {
      session: lookUp(viewers, 'sabine', 'session'),
      route: `groups/${lookUp(groupIds, 'Kindergarde', 'group')}/calendar?${span}`,
    },
    {
      session: lookUp(viewers, 'kevin', 'session'),
      route: `groups/${lookUp(groupIds, 'Männerballett', 'group')}/calendar?${span}`,
    },
  ]);
  const entryIds = new Map<string, number>();
  for (const spec of entrySpecsOf(moment)) {
    const ownerGroupId = spec.owner === null ? null : lookUp(groupIds, spec.owner, 'group');
    const body = {
      title: spec.title,
      description: spec.description,
      ownerGroupId,
      venueId: spec.venue === null ? null : lookUp(venueIds, spec.venue, 'venue'),
      startsAt: spec.startsAt.toISOString(),
      endsAt: spec.endsAt?.toISOString() ?? null,
      kind: spec.kind,
      visibility: spec.visibility,
      asksForResponse: spec.asksForResponse,
      participatingGroupIds: spec.participating.map((group) => lookUp(groupIds, group, 'group')),
    };
    const knownId = known.get(entryLookupKeyOf(spec.title, ownerGroupId));
    if (knownId === undefined) {
      const created = await postJson('calendar/entries', admin, body, CreatedCalendarEntrySchema);
      entryIds.set(spec.key, created.calendarEntryId);
    } else {
      await send('PUT', `calendar/entries/${knownId}`, admin, body);
      entryIds.set(spec.key, knownId);
    }
  }
  log(`calendar: ${entryIds.size} entries placed around ${moment.now.toISOString()}`);
  return entryIds;
};

const redeemedLongAgoTweak = (
  moment: Moment,
  personIds: ReadonlyMap<string, number>,
): SqlTweak => ({
  why: 'Only Jana joined the app today. Every other persona redeemed their invitation weeks ago, so only Jana gets the Willkommen greeting (appSince is the Berlin day of the latest Redeemed event).',
  statements: PERSONAS.flatMap((persona) => {
    if (persona.appSinceDaysAgo === null) {
      return [];
    }
    const personId = lookUp(personIds, persona.key, 'person');
    const redeemedAt = berlinInstant(addDays(moment.today, -persona.appSinceDaysAgo), '19:12');
    const invitedAt = daysAfter(redeemedAt, -1);
    return [
      `UPDATE account_event SET at = ${sqlInstant(redeemedAt)} WHERE person_id = ${personId} AND kind = 'Redeemed';`,
      `UPDATE account_event SET at = ${sqlInstant(invitedAt)} WHERE person_id = ${personId} AND kind = 'Invited';`,
      `UPDATE invitation SET issued_at = ${sqlInstant(invitedAt)}, expires_at = ${sqlInstant(daysAfter(invitedAt, INVITATION_LIFETIME_DAYS))}, redeemed_at = ${sqlInstant(redeemedAt)} WHERE person_id = ${personId} AND redeemed_at IS NOT NULL;`,
    ];
  }),
});

const contactChangedYesterdayTweak = (
  moment: Moment,
  personIds: ReadonlyMap<string, number>,
): SqlTweak => ({
  why: "Frank corrected Lena's phone number yesterday evening; the API stamps a contact change with the moment of the request.",
  statements: [
    `UPDATE person SET contact_changed_at = ${sqlInstant(berlinInstant(addDays(moment.today, -1), '19:42'))} WHERE id = ${lookUp(personIds, 'lena', 'person')} AND contact_changed_by_person_id = ${lookUp(personIds, 'frank', 'person')};`,
  ],
});

const announcementsSpreadTweak = (
  specs: readonly AnnouncementSpec[],
  personIds: ReadonlyMap<string, number>,
): SqlTweak => ({
  why: 'Frank published the announcements over the last days, not all in the second the seed ran; the API stamps publishedAt with the moment of the request.',
  statements: specs.map(
    (spec) =>
      `UPDATE announcement SET published_at = ${sqlInstant(spec.publishedAt)} WHERE author_person_id = ${lookUp(personIds, 'frank', 'person')} AND title = ${sqlText(spec.title)};`,
  ),
});

const relativeTiesTweak = (
  moment: Moment,
  personIds: ReadonlyMap<string, number>,
  groupIds: ReadonlyMap<string, number>,
  venueIds: ReadonlyMap<string, number>,
  officeIds: ReadonlyMap<string, number>,
): SqlTweak => ({
  why: 'Lena got her key 2 days ago, Frank took the Präsident seat 3 days ago and Kevin joined the Männerballett 5 days ago, counted from the day the seed runs. The API has no edit for these start days, so a re-run on a later day re-anchors them here.',
  statements: [
    `UPDATE key_holding SET since_on = ${sqlDay(addDays(moment.today, -2))} WHERE person_id = ${lookUp(personIds, 'lena', 'person')} AND venue_id = ${lookUp(venueIds, 'Sporthalle Am Ring', 'venue')} AND until_on IS NULL;`,
    `UPDATE board_seat SET since_on = ${sqlDay(addDays(moment.today, -3))} WHERE person_id = ${lookUp(personIds, 'frank', 'person')} AND board_office_id = ${lookUp(officeIds, 'Präsident', 'board office')} AND until_on IS NULL;`,
    `UPDATE group_membership SET joined_on = ${sqlDay(addDays(moment.today, -5))} WHERE person_id = ${lookUp(personIds, 'kevin', 'person')} AND group_id = ${lookUp(groupIds, 'Männerballett', 'group')} AND left_on IS NULL;`,
  ],
});

const reminderDueTweak = (moment: Moment, personIds: ReadonlyMap<string, number>): SqlTweak => {
  const issuedAt = daysAfter(moment.now, -REMINDER_DUE_DAYS_AGO);
  const ids = REMINDER_DUE_KEYS.map((key) => lookUp(personIds, key, 'person')).join(', ');
  return {
    why: 'Bernd and Sophie were invited last week and never redeemed, so Frank sees a reminder due (the reminder delay is 3 days).',
    statements: [
      `UPDATE invitation SET issued_at = ${sqlInstant(issuedAt)}, expires_at = ${sqlInstant(daysAfter(issuedAt, INVITATION_LIFETIME_DAYS))} WHERE person_id IN (${ids}) AND redeemed_at IS NULL AND voided_at IS NULL;`,
      `UPDATE account_event SET at = ${sqlInstant(issuedAt)} WHERE person_id IN (${ids}) AND kind = 'Invited';`,
    ],
  };
};

const sabineWithoutMembershipTweak = (
  personIds: ReadonlyMap<string, number>,
  groupIds: ReadonlyMap<string, number>,
): SqlTweak => ({
  why: 'Sabine runs the Kindergarde without being a member. An invitation needs an affiliated person, so the seed gives her a Kindergarde membership just long enough to invite her and removes it here.',
  statements: [
    `DELETE FROM group_membership WHERE person_id = ${lookUp(personIds, 'sabine', 'person')} AND group_id = ${lookUp(groupIds, 'Kindergarde', 'group')};`,
  ],
});

const applySql = (script: string, command: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const psql = spawn('sh', ['-c', command], { stdio: ['pipe', 'inherit', 'inherit'] });
    psql.on('error', reject);
    psql.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`psql exited with ${code}`));
      }
    });
    psql.stdin.end(script);
  });

const announcementsSeenTweak = (
  moment: Moment,
  specs: readonly AnnouncementSpec[],
  personIds: ReadonlyMap<string, number>,
): SqlTweak => {
  const oldest = specs.reduce(
    (first, spec) => (spec.publishedAt < first ? spec.publishedAt : first),
    moment.now,
  );
  const idsOf = (keys: readonly string[]): string =>
    keys.map((key) => lookUp(personIds, key, 'person')).join(', ');
  const unseenKeys = PERSONAS.map((persona) => persona.key).filter(
    (key) => !ANNOUNCEMENTS_SEEN_KEYS.includes(key),
  );
  return {
    why: 'Lena and Gerd have seen only the oldest announcement, every other persona none. The API only ever moves the last-seen moment forward, and opening the Aushänge sheet in a shot moves it to the newest one, so a re-run resets it here.',
    statements: [
      `UPDATE account SET last_seen_announcement_at = ${sqlInstant(minutesAfter(oldest, 1))} WHERE person_id IN (${idsOf(ANNOUNCEMENTS_SEEN_KEYS)});`,
      `UPDATE account SET last_seen_announcement_at = NULL WHERE person_id IN (${idsOf(unseenKeys)});`,
    ],
  };
};

const run = async (): Promise<void> => {
  const now = new Date();
  const moment = momentOf(now);
  log(`seeding Start for ${moment.today} (now ${now.toISOString()}) against ${API_BASE}`);

  const admin = await signIn('admin', ADMIN_EMAIL, ADMIN_PASSWORD);
  const personSpecs = personSpecsOf(moment);
  const specsByKey = new Map(personSpecs.map((spec) => [spec.key, spec]));

  await ensureClubRecord(admin);
  const groupIds = await ensureGroups(admin);
  const venueIds = await ensureVenues(admin);
  const roleIds = await ensureRoles(admin);
  const officeIds = await ensureBoardOffices(admin, roleIds);
  const personIds = await ensurePersons(admin, personSpecs);
  await ensureMemberships(admin, personSpecs, personIds);
  await ensureGroupTies(admin, moment, groupIds, personIds);
  await ensureKeys(admin, moment, venueIds, personIds);
  await ensureBoardSeats(admin, moment, officeIds, personIds);
  await ensureAccounts(admin, moment, specsByKey, personIds, groupIds);

  const viewers = new Map<string, Session>();
  for (const persona of PERSONAS) {
    const email = lookUp(specsByKey, persona.key, 'person spec').email ?? '';
    viewers.set(persona.key, await signIn(persona.key, email, PERSONA_PASSWORD));
  }
  const frank = lookUp(viewers, 'frank', 'session');

  await ensureLenaPhoneChangedByFrank(frank, personIds);
  const announcementSpecs = announcementSpecsOf(moment);
  await ensureAnnouncements(frank, announcementSpecs);
  const entryIds = await ensureCalendar(admin, viewers, moment, groupIds, venueIds);
  await send(
    'POST',
    `calendar/${lookUp(entryIds, 'generalprobe', 'entry')}/response`,
    lookUp(viewers, 'lena', 'session'),
    { answer: 'yes' },
  );
  log('answer: Lena said Zusage to the Generalprobe');
  const script = sqlScriptOf([
    redeemedLongAgoTweak(moment, personIds),
    contactChangedYesterdayTweak(moment, personIds),
    announcementsSpreadTweak(announcementSpecs, personIds),
    relativeTiesTweak(moment, personIds, groupIds, venueIds, officeIds),
    reminderDueTweak(moment, personIds),
    sabineWithoutMembershipTweak(personIds, groupIds),
    announcementsSeenTweak(moment, announcementSpecs, personIds),
  ]);
  await mkdir(path.dirname(SQL_OUT), { recursive: true });
  await writeFile(SQL_OUT, script);
  if (PSQL_COMMAND === null) {
    log(`realism SQL written to ${path.resolve(SQL_OUT)}; apply it with psql before shooting`);
  } else {
    await applySql(script, PSQL_COMMAND);
    log('realism SQL applied');
  }

  log(`\npassword for every persona: ${PERSONA_PASSWORD}`);
  for (const persona of PERSONAS) {
    const spec = lookUp(specsByKey, persona.key, 'person spec');
    log(
      `  ${persona.key.padEnd(7)} ${spec.email ?? ''} (person ${lookUp(personIds, persona.key, 'person')})`,
    );
  }
  log('calendar entries (open one with /?sheet=entry-<id>):');
  for (const [key, id] of entryIds) {
    log(`  ${key.padEnd(24)} ${id}`);
  }
};

run().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
