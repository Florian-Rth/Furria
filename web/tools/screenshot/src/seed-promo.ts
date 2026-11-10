import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Session } from './seed-api.ts';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_BASE,
  applySql,
  fullNameOf,
  getJson,
  getJsonOrNull,
  inviteAndRedeem,
  log,
  lookUp,
  PERSONA_PASSWORD,
  PSQL_COMMAND,
  pause,
  postJson,
  putJson,
  send,
  signIn,
  uploadMedia,
} from './seed-api.ts';
import { carnivalMarch } from './seed-march.ts';
import type { PosterPalette } from './seed-poster.ts';
import { posterPng } from './seed-poster.ts';
import type { EventSummary, RunningOrder, Studio } from './seed-promo-schemas.ts';
import {
  ActsSchema,
  ChoreographyVersionSchema,
  CreatedActSchema,
  CreatedEventSchema,
  CreatedHallSchema,
  CreatedNewsPostSchema,
  CreatedPartSchema,
  CreatedSessionRecordSchema,
  CreatedSongSchema,
  CreatedSpotSchema,
  CreatedStepsSchema,
  EventsSchema,
  HallSchema,
  HallsSchema,
  NewsSchema,
  RunningOrderSchema,
  SeatingSchema,
  SessionRecordsSchema,
  StudioSchema,
  TablePlanSchema,
  TablePlanVersionSchema,
} from './seed-promo-schemas.ts';
import type { GroupDetail } from './seed-schemas.ts';
import {
  CalendarEntriesSchema,
  CreatedCalendarEntrySchema,
  CreatedGroupSchema,
  CreatedPersonSchema,
  CreatedRoleSchema,
  CreatedVenueSchema,
  GroupDetailSchema,
  ManagedGroupsSchema,
  PersonDetailSchema,
  PersonsSchema,
  RolesSchema,
  VenuesSchema,
} from './seed-schemas.ts';
import { ashWednesdayOf, nthWeekdayOf, sessionYearOf } from './seed-session.ts';
import type { SqlTweak } from './seed-sql.ts';
import { sqlInstant, sqlScriptOf, sqlText } from './seed-sql.ts';
import type { IsoDay, Moment } from './seed-time.ts';
import { addDays, berlinInstant, daysAfter, momentOf, nextWeekday } from './seed-time.ts';

type GroupName = 'Elferrat' | 'Männerballett' | 'Tanzgarde' | 'Showtanzgruppe' | 'Kindergarde';
type ActKind = 'dance' | 'speech' | 'music' | 'show' | 'point';
type Answer = 'yes' | 'no' | 'maybe';
type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type TicketAvailability = 'available' | 'fewLeft' | 'soldOut';
type NewsCategory = 'session' | 'achievements' | 'club' | 'groups';

interface MemberSpec {
  readonly firstName: string;
  readonly lastName: string;
  readonly birthDate: IsoDay;
  readonly memberSince: IsoDay;
  readonly group: GroupName | null;
  readonly hasAccount: boolean;
  readonly street: string;
}

interface OpeningSlot {
  readonly weekday: Weekday;
  readonly opens: string;
  readonly closes: string;
}

interface PresaleVenueSpec {
  readonly name: string;
  readonly street: string;
  readonly hint: string | null;
  readonly openingHours: readonly OpeningSlot[];
}

interface RoleSpec {
  readonly name: string;
  readonly description: string;
  readonly permissionKeys: readonly string[];
  readonly icon: 'flag' | 'camera';
  readonly holders: readonly string[];
}

interface GroupAdminSpec {
  readonly person: string;
  readonly group: GroupName;
  readonly function: string;
  readonly sinceOn: IsoDay;
}

interface EventSpec {
  readonly key: string;
  readonly title: string;
  readonly day: IsoDay;
  readonly startsAt: string;
  readonly doorsOpenAt: string;
  readonly teaser: string;
  readonly description: string;
  readonly ageHint: string | null;
  readonly priceCents: number;
  readonly presaleStartsAt: Date;
  readonly ticketAvailability: TicketAvailability;
  readonly publishedDaysAgo: number;
  readonly palette: PosterPalette;
  readonly runningOrder: readonly string[];
  readonly tablePlan: 'own' | 'copy' | 'none';
}

interface ActSpec {
  readonly name: string;
  readonly group: GroupName | null;
  readonly kind: ActKind;
  readonly added: readonly string[];
  readonly wish: 'first' | 'last' | null;
}

interface TrainingSpec {
  readonly title: string;
  readonly owner: GroupName;
  readonly day: IsoDay;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly venue: string;
  readonly description: string;
}

interface NewsSpec {
  readonly title: string;
  readonly teaser: string;
  readonly text: string;
  readonly category: NewsCategory;
  readonly event: string | null;
  readonly publishedDaysAgo: number;
}

interface Position {
  readonly rightMetres: number;
  readonly backMetres: number;
}

interface Keyframe {
  readonly sourceMediaItemId: number;
  readonly seconds: number;
  readonly position: Position;
  readonly bend: null;
  readonly easing: 'easeInOut';
  readonly facingDegrees: null;
}

interface PlacedTrack {
  readonly spotId: number;
  readonly keyframes: readonly { readonly seconds: number; readonly position: Position }[];
}

interface Context {
  readonly moment: Moment;
  readonly sessionYear: number;
  readonly admin: Session;
  readonly sessions: Map<string, Session>;
  personIds: Map<string, number>;
  groupIds: Map<string, number>;
  venueIds: Map<string, number>;
}

const SQL_OUT = process.env.SEED_SQL_OUT ?? path.join('out', 'seed-promo.sql');
const GROSSFURRA = { zip: '99706', city: 'Großfurra' } as const;
const CALENDAR_LOOKBACK_DAYS = 60;
const CALENDAR_LOOKAHEAD_DAYS = 120;
const MEDIA_WAIT_MS = 240_000;
const MEDIA_POLL_MS = 2_000;
const STEP_BARS = 4;
const STEP_TRANSITION_BARS = 1;
const MARCH_BPM = 140;
const FIRST_SESSION_YEAR = 1970;
const INVITATION_LIFETIME_DAYS = 14;
const ARRIVAL_FIRST_DAYS_AGO = 160;
const ARRIVAL_STEP_DAYS = 3;
const TABLE_FIRST_ROW_Y_CM = 220;
const TABLE_ROW_PITCH_CM = 280;
const TABLE_BLOCK_GAP_CM = 360;
const TABLE_ROWS_PER_BLOCK = 2;
const TABLE_ROW_COUNT = 7;
const CHAIRS_PER_SIDE = 34;
const MARSCHTANZ = 'Marschtanz der Tanzgarde';
const PRUNKSITZUNG = 'prunksitzung1';
const PERSONA = 'Lena Brandt';
const TRAINER = 'Nicole Hartmann';
const NEWS_AUTHOR = 'Michael Krüger';
const MARSCH_SPOT_HOLDERS = [
  'Sophie Wagner',
  'Lena Brandt',
  'Mia Schubert',
  'Lea Hoffmann',
  'Emily Krause',
  'Hannah Winkler',
  'Laura Jung',
  'Marie Lehmann',
  'Anna Schulte',
  'Julia Berger',
  'Clara Walther',
  'Emma Ludwig',
] as const;
const ABSENT_NEXT_TRAINING = 'Julia Berger';
const UNSURE_NEXT_TRAINING = 'Clara Walther';
const MARKED_BY_TRAINER: readonly string[] = [
  'Emily Krause',
  'Sophie Wagner',
  'Mia Schubert',
  'Lea Hoffmann',
];

const member = (
  firstName: string,
  lastName: string,
  birthDate: IsoDay,
  memberSince: IsoDay,
  group: GroupName | null,
  hasAccount: boolean,
  street: string,
): MemberSpec => ({ firstName, lastName, birthDate, memberSince, group, hasAccount, street });

const MEMBERS: readonly MemberSpec[] = [
  member('Andreas', 'Vogel', '1971-04-12', '1995-11-11', 'Elferrat', true, 'Am Anger 6'),
  member('Michael', 'Krüger', '1979-09-30', '2003-11-11', 'Elferrat', true, 'Bahnhofstraße 14'),
  member('Stefan', 'Hartung', '1975-02-03', '1999-11-11', 'Elferrat', true, 'Schillerstraße 3'),
  member('Ralf', 'Köhler', '1968-11-11', '1988-11-11', 'Elferrat', true, 'Mühlweg 2'),
  member('Matthias', 'Lorenz', '1982-06-19', '2008-11-11', 'Elferrat', true, 'Lindenweg 21'),
  member('Peter', 'Engel', '1963-03-27', '1984-11-11', 'Elferrat', true, 'Kirchgasse 14'),
  member('Wolfgang', 'Seidel', '1958-08-08', '1979-11-11', 'Elferrat', true, 'Hauptstraße 41'),
  member('Marco', 'Schreiber', '1990-01-15', '2012-11-11', 'Männerballett', true, 'Feldweg 8'),
  member('Daniel', 'Fuchs', '1988-05-04', '2011-11-11', 'Männerballett', true, 'Gartenstraße 2'),
  member('Sebastian', 'Kaiser', '1993-07-22', '2015-11-11', 'Männerballett', true, 'Am Ring 9'),
  member('Tobias', 'Pohl', '1995-12-01', '2017-11-11', 'Männerballett', true, 'Teichstraße 12'),
  member('Florian', 'Haas', '1987-10-10', '2011-11-11', 'Männerballett', true, 'Bergstraße 4'),
  member('Christian', 'Böhm', '1984-03-03', '2013-11-11', 'Männerballett', true, 'Rosengasse 7'),
  member('Patrick', 'Ziegler', '1991-09-09', '2016-11-11', 'Männerballett', true, 'Schulweg 3'),
  member('Markus', 'Franke', '1986-02-14', '2014-11-11', 'Männerballett', true, 'Am Anger 19'),
  member('Hannah', 'Winkler', '2006-03-18', '2014-09-01', 'Tanzgarde', true, 'Lindenweg 9'),
  member('Laura', 'Jung', '2005-11-02', '2013-09-01', 'Tanzgarde', true, 'Mühlweg 15'),
  member('Marie', 'Lehmann', '2007-07-07', '2015-09-01', 'Tanzgarde', true, 'Hauptstraße 22'),
  member('Anna', 'Schulte', '2004-04-24', '2012-09-01', 'Tanzgarde', true, 'Feldstraße 5'),
  member('Julia', 'Berger', '2008-01-29', '2016-09-01', 'Tanzgarde', true, 'Schillerstraße 11'),
  member('Clara', 'Walther', '2009-06-12', '2017-09-01', 'Tanzgarde', true, 'Am Ring 14'),
  member('Emma', 'Ludwig', '2006-10-05', '2014-09-01', 'Tanzgarde', true, 'Kirchgasse 6'),
  member('Sarah', 'Möller', '1992-08-21', '2010-11-11', 'Showtanzgruppe', true, 'Gartenstraße 9'),
  member('Katharina', 'Lange', '1995-02-11', '2012-11-11', 'Showtanzgruppe', true, 'Teichstraße 3'),
  member('Vanessa', 'Busch', '1998-05-30', '2014-11-11', 'Showtanzgruppe', true, 'Bergstraße 18'),
  member('Jessica', 'Arnold', '1996-12-24', '2013-11-11', 'Showtanzgruppe', true, 'Feldweg 2'),
  member('Nadine', 'Albrecht', '1989-04-01', '2009-11-11', 'Showtanzgruppe', true, 'Am Anger 2'),
  member('Melanie', 'Graf', '1991-07-17', '2010-11-11', 'Showtanzgruppe', true, 'Rosengasse 11'),
  member(
    'Christina',
    'Pfeiffer',
    '1997-09-03',
    '2015-11-11',
    'Showtanzgruppe',
    true,
    'Schulweg 12',
  ),
  member('Jennifer', 'Simon', '1994-01-08', '2012-11-11', 'Showtanzgruppe', true, 'Mühlweg 6'),
  member('Tanja', 'Kühne', '1990-10-27', '2011-11-11', 'Showtanzgruppe', true, 'Lindenweg 30'),
  member('Sandra', 'Voigt', '1987-06-06', '2008-11-11', 'Showtanzgruppe', true, 'Hauptstraße 8'),
  member(
    'Stefanie',
    'Heinrich',
    '1999-03-13',
    '2016-11-11',
    'Showtanzgruppe',
    true,
    'Bahnhofstraße 5',
  ),
  member('Kerstin', 'Thiele', '1985-11-20', '2006-11-11', 'Showtanzgruppe', true, 'Am Ring 21'),
  member('Mila', 'Krause', '2016-04-14', '2022-09-01', 'Kindergarde', false, 'Teichstraße 5'),
  member('Ella', 'Schuster', '2017-02-09', '2023-09-01', 'Kindergarde', false, 'Feldweg 11'),
  member('Lotta', 'Brenner', '2015-08-21', '2021-09-01', 'Kindergarde', false, 'Gartenstraße 16'),
  member('Ida', 'Kraft', '2018-01-30', '2024-09-01', 'Kindergarde', false, 'Bergstraße 2'),
  member('Leni', 'Sauer', '2016-11-03', '2022-09-01', 'Kindergarde', false, 'Schulweg 7'),
  member('Frieda', 'Beck', '2017-06-18', '2023-09-01', 'Kindergarde', false, 'Am Anger 25'),
  member('Paul', 'Schröder', '2015-03-05', '2021-09-01', 'Kindergarde', false, 'Kirchgasse 3'),
  member('Emil', 'Jahn', '2018-09-12', '2024-09-01', 'Kindergarde', false, 'Rosengasse 2'),
  member('Lia', 'Wolff', '2016-07-27', '2022-09-01', 'Kindergarde', false, 'Mühlweg 20'),
  member('Nele', 'Bauer', '2019-05-01', '2025-09-01', 'Kindergarde', false, 'Lindenweg 2'),
  member('Nicole', 'Hartmann', '1983-05-09', '1999-11-11', null, true, 'Schillerstraße 7'),
  member('Petra', 'Lindner', '1966-02-22', '1990-11-11', null, true, 'Hauptstraße 5'),
  member('Monika', 'Kraus', '1962-12-12', '1985-11-11', null, true, 'Feldstraße 12'),
  member('Gabriele', 'Hahn', '1965-07-04', '1992-11-11', null, true, 'Bahnhofstraße 21'),
  member('Dieter', 'Beyer', '1957-09-19', '1980-11-11', null, true, 'Am Anger 13'),
  member('Heike', 'Martin', '1972-01-31', '1998-11-11', null, true, 'Teichstraße 8'),
  member('Jörg', 'Sommer', '1974-08-15', '2001-11-11', null, true, 'Bergstraße 30'),
  member('Silke', 'Brückner', '1978-03-08', '2004-11-11', null, true, 'Gartenstraße 4'),
  member('Birgit', 'Wolf', '1969-10-02', '1993-11-11', null, true, 'Schulweg 15'),
  member('Karin', 'Ullrich', '1960-05-25', '1982-11-11', null, true, 'Kirchgasse 20'),
  member('Susanne', 'Dietrich', '1976-11-11', '2000-11-11', null, true, 'Rosengasse 15'),
  member('Rainer', 'Vogt', '1955-04-04', '1977-11-11', null, false, 'Festplatz 2'),
  member('Renate', 'Schütz', '1949-06-30', '1971-11-11', null, false, 'Mühlweg 1'),
  member('Helmut', 'Kühnel', '1946-01-17', '1971-11-11', null, false, 'Hauptstraße 50'),
  member('Ingrid', 'Herrmann', '1951-09-14', '1975-11-11', null, false, 'Lindenweg 40'),
  member('Günter', 'Mai', '1953-02-28', '1976-11-11', null, false, 'Am Ring 30'),
];

const SHOWTANZ_GROUP = {
  name: 'Showtanzgruppe',
  tone: 'violet',
  icon: 'star',
  foundedYear: 2005,
  isRecruiting: true,
  description:
    'Jedes Jahr eine neue Geschichte in Tanz, Licht und Kostüm. Wir proben mittwochs in der Sporthalle und freuen uns über neue Tänzerinnen ab 18.',
} as const;

const GROUP_ADMINS: readonly GroupAdminSpec[] = [
  { person: TRAINER, group: 'Tanzgarde', function: 'Trainerin', sinceOn: '2019-09-01' },
  { person: 'Sarah Möller', group: 'Showtanzgruppe', function: 'Trainerin', sinceOn: '2018-11-11' },
];

const ROLES: readonly RoleSpec[] = [
  {
    name: 'Sitzungsplanung',
    description: 'Plant die Sitzungen: Veranstaltungen, Ablauf, Saal und Tische.',
    permissionKeys: ['events.manage', 'events.running_order', 'events.hall'],
    icon: 'flag',
    holders: [PERSONA, 'Andreas Vogel'],
  },
  {
    name: 'Öffentlichkeitsarbeit',
    description: 'Schreibt die Neuigkeiten für Website und App.',
    permissionKeys: ['news.manage'],
    icon: 'camera',
    holders: [NEWS_AUTHOR],
  },
];

const WEEKDAYS_OPEN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

const PRESALE_VENUES: readonly PresaleVenueSpec[] = [
  {
    name: 'Bäckerei Lindner',
    street: 'Hauptstraße 5',
    hint: 'Karten an der Kasse, nur Barzahlung.',
    openingHours: [
      ...WEEKDAYS_OPEN.map((weekday) => ({ weekday, opens: '06:00', closes: '18:00' })),
      { weekday: 'saturday', opens: '06:00', closes: '12:00' },
    ],
  },
  {
    name: 'Getränkemarkt Schulze',
    street: 'Am Bahnhof 2',
    hint: null,
    openingHours: [
      ...WEEKDAYS_OPEN.map((weekday) => ({ weekday, opens: '08:00', closes: '19:00' })),
      { weekday: 'saturday', opens: '08:00', closes: '16:00' },
    ],
  },
];

const PRESALE_PLACES = ['Vereinsraum', 'Bäckerei Lindner', 'Getränkemarkt Schulze'] as const;

const SESSION_MOTTO = 'Furra steht kopf – mit Pauken und Trompeten';

const PALETTES = {
  crimson: {
    top: [150, 18, 38],
    bottom: [74, 8, 30],
    confetti: [
      [245, 196, 66],
      [255, 255, 255],
      [64, 160, 220],
    ],
  },
  night: {
    top: [32, 36, 92],
    bottom: [12, 14, 40],
    confetti: [
      [245, 196, 66],
      [230, 60, 90],
      [255, 255, 255],
    ],
  },
  sun: {
    top: [250, 176, 40],
    bottom: [230, 92, 32],
    confetti: [
      [255, 255, 255],
      [40, 120, 200],
      [200, 30, 60],
    ],
  },
  meadow: {
    top: [36, 140, 110],
    bottom: [16, 70, 60],
    confetti: [
      [250, 220, 90],
      [255, 255, 255],
      [240, 110, 140],
    ],
  },
  rose: {
    top: [214, 52, 120],
    bottom: [110, 20, 80],
    confetti: [
      [255, 230, 120],
      [255, 255, 255],
      [120, 200, 240],
    ],
  },
} satisfies Record<string, PosterPalette>;

const EINMARSCH = 'Einmarsch des Elferrats';
const BEGRUESSUNG = 'Begrüßung durch den Sitzungspräsidenten';
const MARSCH = MARSCHTANZ;
const HAUSMEISTER = 'Büttenrede: Der Hausmeister vom Rathaus';
const KINDERGARDE = 'Kindergarde: Die kleinen Hexen';
const BAUAMT = 'Zwiegespräch: Zwei vom Bauamt';
const MARIECHEN = 'Tanzmariechen Mia';
const ORDEN = 'Ordensverleihung';
const SHOWTANZ = 'Showtanz „Zeitreise“';
const PUTZFRAU = 'Büttenrede: Die Putzfrau vom Amt';
const SESSIONSLIED = 'Sessionslied „Furra steht kopf“';
const TOMBOLA = 'Tombola-Ziehung';
const MAENNERBALLETT = 'Männerballett: Schwanensee mal anders';
const FINALE = 'Großes Finale mit allen Aktiven';

const ACTS: readonly ActSpec[] = [
  { name: EINMARSCH, group: 'Elferrat', kind: 'show', added: [], wish: 'first' },
  { name: BEGRUESSUNG, group: null, kind: 'point', added: [], wish: null },
  { name: MARSCHTANZ, group: 'Tanzgarde', kind: 'dance', added: [], wish: null },
  {
    name: HAUSMEISTER,
    group: null,
    kind: 'speech',
    added: ['Ralf Köhler'],
    wish: null,
  },
  { name: KINDERGARDE, group: 'Kindergarde', kind: 'dance', added: [], wish: null },
  {
    name: BAUAMT,
    group: null,
    kind: 'speech',
    added: ['Heike Martin', 'Dieter Beyer'],
    wish: null,
  },
  { name: MARIECHEN, group: null, kind: 'dance', added: ['Mia Schubert'], wish: null },
  { name: ORDEN, group: null, kind: 'point', added: [], wish: null },
  { name: SHOWTANZ, group: 'Showtanzgruppe', kind: 'dance', added: [], wish: null },
  {
    name: PUTZFRAU,
    group: null,
    kind: 'speech',
    added: ['Gabriele Hahn'],
    wish: null,
  },
  {
    name: SESSIONSLIED,
    group: null,
    kind: 'music',
    added: ['Jörg Sommer', 'Silke Brückner'],
    wish: null,
  },
  { name: TOMBOLA, group: null, kind: 'point', added: [], wish: null },
  { name: MAENNERBALLETT, group: 'Männerballett', kind: 'dance', added: [], wish: null },
  { name: FINALE, group: null, kind: 'point', added: [], wish: 'last' },
];

const eventSpecsOf = (sessionYear: number): EventSpec[] => {
  const nextYear = sessionYear + 1;
  const opening = `${sessionYear}-11-11`;
  const presale = berlinInstant(opening, '11:11');
  const prunk1 = nthWeekdayOf(nextYear, 1, 6, 2);
  const prunk2 = nthWeekdayOf(nextYear, 1, 6, 4);
  const sharedPresale = { presaleStartsAt: presale, publishedDaysAgo: 24 } as const;
  return [
    {
      key: 'narrenball',
      title: 'Narrenball zur Sessionseröffnung',
      day: opening,
      startsAt: '19:11',
      doorsOpenAt: '18:30',
      teaser: 'Nach der Schlüsselübergabe am Rathaus feiern wir die neue Session in der Festhalle.',
      description:
        'Um 11:11 übernehmen wir das Rathaus, am Abend gehört die Festhalle den Narren. Mit Einmarsch des Elferrats, dem ersten Auftritt der Tanzgarde, dem neuen Sessionslied und der Verleihung der Sessionsorden. Danach Tanz mit DJ Uwe bis in die Nacht.',
      ageHint: 'ab 16 Jahren',
      priceCents: 1100,
      presaleStartsAt: berlinInstant(addDays(opening, -41), '10:00'),
      ticketAvailability: 'fewLeft',
      publishedDaysAgo: 48,
      palette: PALETTES.crimson,
      runningOrder: [EINMARSCH, BEGRUESSUNG, MARSCH, SESSIONSLIED, ORDEN, FINALE],
      tablePlan: 'copy',
    },
    {
      key: PRUNKSITZUNG,
      title: '1. Prunksitzung',
      day: prunk1,
      startsAt: '19:11',
      doorsOpenAt: '18:00',
      teaser: 'Der große Abend der Session: fünf Stunden Tanz, Bütt und Musik in der Festhalle.',
      description:
        'Unsere erste Prunksitzung mit allem, was der FCC zu bieten hat: Einmarsch des Elferrats, Marschtanz der Tanzgarde, Kindergarde, Showtanz, Männerballett und die besten Büttenreden der Session. Platzkarten an Biertischen, Bewirtung durch den Verein.',
      ageHint: null,
      priceCents: 2200,
      ...sharedPresale,
      ticketAvailability: 'fewLeft',
      palette: PALETTES.night,
      runningOrder: [
        EINMARSCH,
        BEGRUESSUNG,
        MARSCH,
        HAUSMEISTER,
        KINDERGARDE,
        BAUAMT,
        MARIECHEN,
        ORDEN,
        SHOWTANZ,
        PUTZFRAU,
        SESSIONSLIED,
        TOMBOLA,
        MAENNERBALLETT,
        FINALE,
      ],
      tablePlan: 'own',
    },
    {
      key: 'seniorensitzung',
      title: 'Seniorensitzung',
      day: nthWeekdayOf(nextYear, 1, 0, 3),
      startsAt: '14:30',
      doorsOpenAt: '14:00',
      teaser: 'Kaffee, Kuchen und Karneval: der Nachmittag für unsere älteren Narren.',
      description:
        'Bei Kaffee und selbstgebackenem Kuchen zeigen Tanzgarde, Männerballett und unsere Büttenredner das Beste aus der Session. Ein Fahrdienst holt Gäste aus Großfurra und Kleinfurra auf Wunsch zu Hause ab.',
      ageHint: null,
      priceCents: 1200,
      ...sharedPresale,
      ticketAvailability: 'available',
      palette: PALETTES.sun,
      runningOrder: [
        EINMARSCH,
        BEGRUESSUNG,
        MARSCH,
        PUTZFRAU,
        SESSIONSLIED,
        ORDEN,
        MAENNERBALLETT,
        BAUAMT,
        FINALE,
      ],
      tablePlan: 'copy',
    },
    {
      key: 'prunksitzung2',
      title: '2. Prunksitzung',
      day: prunk2,
      startsAt: '19:11',
      doorsOpenAt: '18:00',
      teaser: 'Noch einmal alles: die zweite Prunksitzung mit dem ganzen Programm der Session.',
      description:
        'Wer die erste Prunksitzung verpasst hat oder einfach nicht genug bekommt: Elferrat, Tanzgarde, Kindergarde, Showtanzgruppe, Männerballett und Büttenreden, dazu die große Tombola zugunsten der Kindergarde.',
      ageHint: null,
      priceCents: 2200,
      ...sharedPresale,
      ticketAvailability: 'available',
      palette: PALETTES.rose,
      runningOrder: [
        EINMARSCH,
        BEGRUESSUNG,
        SHOWTANZ,
        PUTZFRAU,
        MARSCH,
        BAUAMT,
        MAENNERBALLETT,
        ORDEN,
        MARIECHEN,
        HAUSMEISTER,
        KINDERGARDE,
        SESSIONSLIED,
        TOMBOLA,
        FINALE,
      ],
      tablePlan: 'copy',
    },
    {
      key: 'kindersitzung',
      title: 'Kindersitzung',
      day: addDays(prunk2, 1),
      startsAt: '14:11',
      doorsOpenAt: '13:30',
      teaser: 'Fasching für die Kleinsten: Kinderdisco, Kostümprämierung und viel Konfetti.',
      description:
        'Die Kindergarde zeigt ihren Hexentanz, die Tanzgarde tanzt den Marsch und alle Kinder dürfen auf die Bühne. Mit Kostümprämierung, Kinderdisco und Pfannkuchen. Eltern zahlen den Kinderpreis.',
      ageHint: 'für Kinder bis 12',
      priceCents: 500,
      ...sharedPresale,
      ticketAvailability: 'available',
      palette: PALETTES.meadow,
      runningOrder: [EINMARSCH, MARSCH, KINDERGARDE, SESSIONSLIED, MARIECHEN, TOMBOLA, FINALE],
      tablePlan: 'copy',
    },
    {
      key: 'weiberfastnacht',
      title: 'Weiberfastnacht',
      day: addDays(ashWednesdayOf(nextYear), -6),
      startsAt: '19:11',
      doorsOpenAt: '18:30',
      teaser: 'Krawatten ab: Die Frauen übernehmen die Festhalle, die Männer tanzen Ballett.',
      description:
        'Der Abend der Weiber: Showtanzgruppe, Männerballett und Büttenreden, danach Party mit Live-Band. Männer sind willkommen, ihre Krawatten eher nicht.',
      ageHint: 'ab 18 Jahren',
      priceCents: 900,
      ...sharedPresale,
      ticketAvailability: 'available',
      palette: PALETTES.rose,
      runningOrder: [SHOWTANZ, PUTZFRAU, MAENNERBALLETT, SESSIONSLIED, MARSCH, FINALE],
      tablePlan: 'none',
    },
  ];
};

const trainingSpecsOf = (moment: Moment): TrainingSpec[] => {
  const on = (weekday: number, weeks: number): IsoDay =>
    addDays(nextWeekday(moment.today, weekday), weeks * 7);
  const hall = 'Sporthalle Am Ring';
  return [
    {
      title: 'Marschtanz: Grundschritte und Einmarsch',
      owner: 'Tanzgarde',
      day: on(4, -2),
      startsAt: '18:00',
      endsAt: '20:00',
      venue: hall,
      description: 'Aufmarsch im Block, Grundschritt und Kick-Reihe bis zum Fächer.',
    },
    {
      title: 'Marschtanz: Refrain und Hebungen',
      owner: 'Tanzgarde',
      day: on(2, -1),
      startsAt: '18:00',
      endsAt: '20:00',
      venue: hall,
      description: 'Spagat-Welle, Radschlag und die Pyramide. Bitte Knieschoner mitbringen.',
    },
    {
      title: 'Marschtanz: Trio und Diagonale',
      owner: 'Tanzgarde',
      day: on(4, -1),
      startsAt: '18:00',
      endsAt: '20:00',
      venue: hall,
      description: 'Kreis, Gasse und Wechselschritt im Trio, danach einmal komplett mit Musik.',
    },
    {
      title: 'Marschtanz: Durchlauf mit Musik',
      owner: 'Tanzgarde',
      day: on(4, 0),
      startsAt: '18:00',
      endsAt: '20:00',
      venue: hall,
      description: 'Zweimal komplett durch, dazwischen Feinschliff an den Formationen.',
    },
    {
      title: 'Marschtanz: Formationen sauber',
      owner: 'Tanzgarde',
      day: on(2, 1),
      startsAt: '18:00',
      endsAt: '20:00',
      venue: hall,
      description: 'Abstände und Linien im Finale, Sternformation im zweiten Marsch.',
    },
    {
      title: 'Marschtanz: Kostümprobe',
      owner: 'Tanzgarde',
      day: on(4, 1),
      startsAt: '18:00',
      endsAt: '20:30',
      venue: 'Festhalle Großfurra',
      description: 'In voller Uniform mit Stiefeln und Hut, Haare wie zur Sitzung.',
    },
    {
      title: 'Showtanz „Zeitreise“: Teil 1',
      owner: 'Showtanzgruppe',
      day: on(3, -1),
      startsAt: '19:30',
      endsAt: '21:30',
      venue: hall,
      description: 'Die Zwanziger: Charleston-Teil und Umzug hinter der Bühne.',
    },
    {
      title: 'Showtanz „Zeitreise“: Teil 2',
      owner: 'Showtanzgruppe',
      day: on(3, 0),
      startsAt: '19:30',
      endsAt: '21:30',
      venue: hall,
      description: 'Disco-Teil mit den neuen Hebungen, danach Musikschnitt besprechen.',
    },
    {
      title: 'Showtanz „Zeitreise“: Durchlauf',
      owner: 'Showtanzgruppe',
      day: on(3, 1),
      startsAt: '19:30',
      endsAt: '21:30',
      venue: hall,
      description: 'Erster kompletter Durchlauf mit allen Umzügen.',
    },
    {
      title: 'Schwanensee: Hebefiguren',
      owner: 'Männerballett',
      day: on(4, 0),
      startsAt: '20:15',
      endsAt: '21:45',
      venue: hall,
      description: 'Die große Hebung am Schluss, diesmal mit Matte.',
    },
    {
      title: 'Hexentanz üben',
      owner: 'Kindergarde',
      day: on(5, 0),
      startsAt: '16:30',
      endsAt: '17:30',
      venue: hall,
      description: 'Besen nicht vergessen! Danach gibt es Apfelschorle.',
    },
  ];
};

const USUAL_TRAINING_TIMES: Record<
  string,
  readonly { weekday: Weekday; startsAt: string; durationMinutes: number }[]
> = {
  Tanzgarde: [
    { weekday: 'tuesday', startsAt: '18:00', durationMinutes: 120 },
    { weekday: 'thursday', startsAt: '18:00', durationMinutes: 120 },
  ],
  Showtanzgruppe: [{ weekday: 'wednesday', startsAt: '19:30', durationMinutes: 120 }],
  Männerballett: [{ weekday: 'tuesday', startsAt: '20:00', durationMinutes: 90 }],
  Kindergarde: [{ weekday: 'friday', startsAt: '16:30', durationMinutes: 60 }],
};

const MARCH_STEPS: readonly { readonly part: string; readonly names: readonly string[] }[] = [
  { part: 'Einmarsch', names: ['Aufmarsch im Block'] },
  { part: 'Marsch', names: ['Grundschritt', 'Kick-Reihe', 'Drehung links', 'Fächer'] },
  { part: 'Refrain', names: ['Spagat-Welle', 'Radschlag', 'Hebung', 'Pyramide'] },
  {
    part: 'Trio',
    names: ['Pose halten', 'Kreis', 'Gasse', 'Wechselschritt', 'Diagonale'],
  },
  {
    part: 'Zweiter Marsch',
    names: ['Grundschritt hoch', 'Kick-Reihe hoch', 'Sternformation', 'Tor'],
  },
  {
    part: 'Finale',
    names: ['Schlusslinie', 'Große Hebung', 'Kicks zum Publikum', 'Abgang mit Gruß'],
  },
];

const newsSpecsOf = (): NewsSpec[] => [
  {
    title: 'Kartenvorverkauf für die Prunksitzungen',
    teaser:
      'Ab dem 11.11. um 11:11 gibt es Karten für beide Prunksitzungen, die Seniorensitzung und die Kindersitzung.',
    text: [
      'Die neue Session steht vor der Tür und mit ihr der Kartenvorverkauf. Ab dem 11.11. um 11:11 verkaufen wir die Karten für alle Sitzungen der Session.',
      '## Hier gibt es Karten',
      '- im Vereinsraum, Hauptstraße 12, nach der Sessionseröffnung',
      '- in der Bäckerei Lindner, Hauptstraße 5',
      '- im Getränkemarkt Schulze, Am Bahnhof 2',
      'Die **1. Prunksitzung** war im letzten Jahr nach drei Wochen ausverkauft. Wer einen ganzen Tisch für Verein oder Stammtisch möchte, meldet sich am besten direkt bei der Sitzungsplanung.',
    ].join('\n\n'),
    category: 'session',
    event: PRUNKSITZUNG,
    publishedDaysAgo: 2,
  },
  {
    title: 'Tanzgarde tanzt aufs Treppchen',
    teaser:
      'Beim Gardetanzturnier in Sondershausen holt unsere Tanzgarde mit dem neuen Marsch den zweiten Platz.',
    text: [
      'Was für ein Wochenende! Beim Gardetanzturnier in Sondershausen ist die Tanzgarde mit dem neuen Marschtanz angetreten und hat sich gegen elf Garden aus ganz Thüringen den zweiten Platz ertanzt.',
      'Besonders die Pyramide im Refrain und die Sternformation im zweiten Marsch haben die Jury überzeugt. Trainerin Nicole Hartmann: „Die Mädels haben seit August zweimal die Woche trainiert, das sieht man.“',
      'Live sehen könnt ihr den Marsch zum ersten Mal beim Narrenball am 11.11.',
    ].join('\n\n'),
    category: 'achievements',
    event: null,
    publishedDaysAgo: 9,
  },
  {
    title: 'Neue Kostüme für die Kindergarde',
    teaser:
      'Der Erlös vom Sommerfest steckt in zehn neuen Hexenkostümen, genäht von Müttern und Omas aus dem Verein.',
    text: [
      'Die Kindergarde tanzt in dieser Session als „Die kleinen Hexen“ und dafür gibt es neue Kostüme: zehn Hexenkleider mit Umhang, Hut und Besen.',
      'Bezahlt haben wir sie vom Erlös des Sommerfests, genäht haben sie fünf Mütter und Omas an drei langen Samstagen im Vereinsraum. **Danke** an alle, die mitgeholfen haben!',
      'Zum ersten Mal zu sehen sind die Kostüme bei der 1. Prunksitzung.',
    ].join('\n\n'),
    category: 'groups',
    event: null,
    publishedDaysAgo: 23,
  },
];

const HALL_NAME = 'Großer Saal';
const HALL_VENUE = 'Festhalle Großfurra';

const hallDocument = (): object => ({
  elements: [
    {
      id: 'e1',
      kind: 'wall',
      points: [
        { x: 0, y: 0 },
        { x: 3000, y: 0 },
        { x: 3000, y: 2000 },
        { x: 0, y: 2000 },
        { x: 0, y: 0 },
      ],
      thicknessCm: 30,
    },
    {
      id: 'e2',
      kind: 'area',
      area: 'stage',
      shape: 'rect',
      x: 265,
      y: 1000,
      widthCm: 500,
      heightCm: 1000,
      rotation: 0,
      label: 'Bühne',
    },
    {
      id: 'e3',
      kind: 'area',
      area: 'bar',
      shape: 'rect',
      x: 2850,
      y: 300,
      widthCm: 250,
      heightCm: 520,
      rotation: 0,
      label: 'Theke',
    },
    {
      id: 'e4',
      kind: 'area',
      area: 'wardrobe',
      shape: 'rect',
      x: 2850,
      y: 1700,
      widthCm: 250,
      heightCm: 520,
      rotation: 0,
      label: 'Garderobe',
    },
    {
      id: 'e5',
      kind: 'area',
      area: 'technics',
      shape: 'rect',
      x: 2550,
      y: 1000,
      widthCm: 200,
      heightCm: 160,
      rotation: 0,
      label: 'Ton & Licht',
    },
    {
      id: 'e6',
      kind: 'door',
      door: 'entrance',
      from: { x: 3000, y: 880 },
      to: { x: 3000, y: 1120 },
      label: 'Haupteingang',
    },
    {
      id: 'e7',
      kind: 'door',
      door: 'emergencyExit',
      from: { x: 1100, y: 0 },
      to: { x: 1280, y: 0 },
      label: 'Notausgang 1',
    },
    {
      id: 'e8',
      kind: 'door',
      door: 'emergencyExit',
      from: { x: 2000, y: 0 },
      to: { x: 2180, y: 0 },
      label: 'Notausgang 2',
    },
    {
      id: 'e9',
      kind: 'door',
      door: 'emergencyExit',
      from: { x: 1100, y: 2000 },
      to: { x: 1280, y: 2000 },
      label: 'Notausgang 3',
    },
    {
      id: 'e10',
      kind: 'door',
      door: 'emergencyExit',
      from: { x: 2000, y: 2000 },
      to: { x: 2180, y: 2000 },
      label: 'Notausgang 4',
    },
    {
      id: 'e11',
      kind: 'door',
      door: 'emergencyExit',
      from: { x: 0, y: 150 },
      to: { x: 0, y: 330 },
      label: 'Notausgang Bühne',
    },
    {
      id: 'e12',
      kind: 'door',
      door: 'door',
      from: { x: 2620, y: 0 },
      to: { x: 2720, y: 0 },
      label: 'Küche',
    },
    {
      id: 'e13',
      kind: 'door',
      door: 'door',
      from: { x: 2500, y: 2000 },
      to: { x: 2600, y: 2000 },
      label: 'WC',
    },
    { id: 'e14', kind: 'pillar', x: 2470, y: 680, widthCm: 40, heightCm: 40, round: true },
    { id: 'e15', kind: 'pillar', x: 2470, y: 1320, widthCm: 40, heightCm: 40, round: true },
    { id: 'e16', kind: 'text', x: 665, y: 1000, text: 'Tanzfläche', size: 'medium', rotation: 270 },
    { id: 'e17', kind: 'text', x: 2850, y: 1000, text: 'Eingang', size: 'small', rotation: 0 },
  ],
});

const TABLE_GROUPS = [
  { id: 'g1', number: 'A', note: 'Vereine und Stammtische' },
  { id: 'g2', number: 'B', note: 'Ehrengäste und Familien der Aktiven' },
  { id: 'g3', number: 'C', note: 'Freier Verkauf' },
] as const;

const TABLE_ROW_NOTES = [
  'Kegelclub Alle Neune und Musikverein',
  'Feuerwehr Großfurra',
  'Ehrengäste: Bürgermeister, Presse, Partnerverein Kleinfurra',
  'Familien der Tanzgarde und Kindergarde',
  null,
  'Stammtisch „Goldener Löwe“',
] as const;

const chairNumbersOf = (): object[] => [
  ...Array.from({ length: CHAIRS_PER_SIDE }, (_, index) => ({
    side: 'front',
    index,
    number: String(index + 1),
    note: null,
    removed: false,
    kept: false,
  })),
  ...Array.from({ length: CHAIRS_PER_SIDE }, (_, offset) => ({
    side: 'back',
    index: CHAIRS_PER_SIDE - 1 - offset,
    number: String(CHAIRS_PER_SIDE + offset + 1),
    note: null,
    removed: false,
    kept: false,
  })),
];

const tablePlanBodyOf = (hallId: number, biertischId: number, version: number): object => {
  const rowYs = TABLE_ROW_NOTES.map(
    (_, index) =>
      TABLE_FIRST_ROW_Y_CM +
      index * TABLE_ROW_PITCH_CM +
      Math.floor(index / TABLE_ROWS_PER_BLOCK) * (TABLE_BLOCK_GAP_CM - TABLE_ROW_PITCH_CM),
  );
  const rows = rowYs.map((y, index) => ({
    id: `r${index + 1}`,
    tableTypeId: biertischId,
    count: TABLE_ROW_COUNT,
    x: 1585,
    y,
    rotation: 0,
    seating: null,
    groupId: TABLE_GROUPS[Math.floor(index / 2)]?.id ?? null,
    sides: { front: true, back: true, start: false, end: false },
    number: String(index + 1),
    note: TABLE_ROW_NOTES[index] ?? null,
    chairs: chairNumbersOf(),
  }));
  return {
    hallId,
    version,
    tables: rows.length * TABLE_ROW_COUNT,
    chairs: rows.length * CHAIRS_PER_SIDE * 2,
    document: { seating: 'maximum', groups: TABLE_GROUPS, rows },
  };
};

const formationOf = (step: number, count: number): Position[] => {
  const spread = (from: number, to: number, index: number, of: number): number =>
    of <= 1 ? (from + to) / 2 : from + ((to - from) * index) / (of - 1);
  const half = Math.ceil(count / 2);
  const shapes: readonly ((index: number) => Position)[] = [
    (index) => ({ rightMetres: spread(-4.4, 4.4, index, count), backMetres: 7 }),
    (index) => ({
      rightMetres: spread(-4, 4, index % half, half),
      backMetres: index < half ? 2.5 : 5,
    }),
    (index) => ({
      rightMetres: -3 + (index % 4) * 2,
      backMetres: 2 + Math.floor(index / 4) * 1.8,
    }),
    (index) => ({
      rightMetres: spread(-4.4, 4.4, index, count),
      backMetres: spread(1, 7, index, count),
    }),
    (index) => ({
      rightMetres: (index - (count - 1) / 2) * 0.75,
      backMetres: 1.5 + Math.abs(index - (count - 1) / 2) * 0.8,
    }),
    (index) => ({
      rightMetres: 3 * Math.cos((2 * Math.PI * index) / count),
      backMetres: 4 + 3 * Math.sin((2 * Math.PI * index) / count),
    }),
    (index) => ({
      rightMetres: index < half ? -3 : 3,
      backMetres: spread(1, 7, index % half, half),
    }),
    (index) => ({ rightMetres: spread(-4.4, 4.4, index, count), backMetres: 1.5 }),
  ];
  const sequence = [2, 1, 3, 4, 0, 5, 4, 1, 2, 7, 5, 6, 3, 2, 1, 2, 5, 6, 7, 4, 7, 0];
  const shape = shapes[sequence[step % sequence.length] ?? 0] ?? shapes[0];
  return Array.from({ length: count }, (_, index) =>
    shape === undefined ? { rightMetres: 0, backMetres: 0 } : shape(index),
  );
};

const roundedOf = (position: Position): Position => ({
  rightMetres: Math.round(position.rightMetres * 100) / 100,
  backMetres: Math.round(position.backMetres * 100) / 100,
});

const placesOf = (tracks: readonly PlacedTrack[]): string =>
  JSON.stringify(
    [...tracks]
      .sort((first, second) => first.spotId - second.spotId)
      .map((track) => [
        track.spotId,
        track.keyframes.map((frame) => [
          Math.round(frame.seconds * 1000),
          Math.round(frame.position.rightMetres * 100),
          Math.round(frame.position.backMetres * 100),
        ]),
      ]),
  );

const emailOf = (firstName: string, lastName: string): string =>
  `${firstName}.${lastName}@furria.local`
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss');

const phoneOf = (index: number): string =>
  `015${index % 10} ${String(2000 + index * 37).padStart(4, '0')} ${String(100 + index * 13).padStart(3, '0')}`;

const nameOfMember = (spec: MemberSpec): string => fullNameOf(spec.firstName, spec.lastName);

const personBodyOf = (spec: MemberSpec, index: number): object => ({
  firstName: spec.firstName,
  lastName: spec.lastName,
  email: spec.group === 'Kindergarde' ? null : emailOf(spec.firstName, spec.lastName),
  phone: spec.group === 'Kindergarde' ? null : phoneOf(index),
  street: spec.street,
  ...GROSSFURRA,
  birthDate: spec.birthDate,
  contactVisibleToMembers: spec.hasAccount,
});

const ensurePersons = async (ctx: Context): Promise<void> => {
  const { persons } = await getJson('manage/persons', ctx.admin, PersonsSchema);
  const known = new Map(
    persons.map((person) => [fullNameOf(person.firstName, person.lastName), person.personId]),
  );
  for (const [index, spec] of MEMBERS.entries()) {
    const name = nameOfMember(spec);
    if (!known.has(name)) {
      const created = await postJson(
        'manage/persons',
        ctx.admin,
        personBodyOf(spec, index),
        CreatedPersonSchema,
      );
      known.set(name, created.personId);
    }
  }
  ctx.personIds = known;
  for (const spec of MEMBERS) {
    const personId = lookUp(known, nameOfMember(spec), 'person');
    const detail = await getJson(`manage/persons/${personId}`, ctx.admin, PersonDetailSchema);
    if (detail.memberships.length === 0) {
      await send('POST', `manage/persons/${personId}/memberships`, ctx.admin, {
        startedOn: spec.memberSince,
        endedOn: null,
      });
    }
  }
  log(`persons: ${MEMBERS.length} promo members with memberships`);
};

const ensureShowtanzGroup = async (ctx: Context): Promise<void> => {
  const managed = await getJson('manage/groups', ctx.admin, ManagedGroupsSchema);
  const groupIds = new Map(managed.groups.map((group) => [group.name, group.groupId]));
  let groupId = groupIds.get(SHOWTANZ_GROUP.name);
  if (groupId === undefined) {
    const created = await postJson(
      'manage/groups',
      ctx.admin,
      { name: SHOWTANZ_GROUP.name, groupKindId: null, icon: SHOWTANZ_GROUP.icon },
      CreatedGroupSchema,
    );
    groupId = created.groupId;
    groupIds.set(SHOWTANZ_GROUP.name, groupId);
  }
  await send('PUT', `groups/${groupId}/info`, ctx.admin, {
    description: SHOWTANZ_GROUP.description,
    isRecruiting: SHOWTANZ_GROUP.isRecruiting,
    groupKindId: null,
    foundedYear: SHOWTANZ_GROUP.foundedYear,
    tone: SHOWTANZ_GROUP.tone,
    icon: SHOWTANZ_GROUP.icon,
  });
  ctx.groupIds = groupIds;
  log(`group: ${SHOWTANZ_GROUP.name}`);
};

const ensureGroupTies = async (ctx: Context): Promise<void> => {
  const details = new Map<GroupName, GroupDetail>();
  const detailOf = async (group: GroupName): Promise<GroupDetail> => {
    const cached = details.get(group);
    if (cached !== undefined) {
      return cached;
    }
    const detail = await groupDetailOf(ctx, group);
    details.set(group, detail);
    return detail;
  };
  for (const spec of MEMBERS) {
    if (spec.group === null) {
      continue;
    }
    const personId = lookUp(ctx.personIds, nameOfMember(spec), 'person');
    const detail = await detailOf(spec.group);
    const isTied = [...detail.members, ...detail.pastMembers].some(
      (row) => row.personId === personId,
    );
    if (!isTied) {
      await send(
        'POST',
        `groups/${lookUp(ctx.groupIds, spec.group, 'group')}/memberships`,
        ctx.admin,
        {
          personId,
          joinedOn: spec.memberSince,
        },
      );
    }
  }
  for (const tenure of GROUP_ADMINS) {
    const personId = lookUp(ctx.personIds, tenure.person, 'person');
    const detail = await groupDetailOf(ctx, tenure.group);
    if (![...detail.admins, ...detail.pastAdmins].some((row) => row.personId === personId)) {
      await send(
        'POST',
        `groups/${lookUp(ctx.groupIds, tenure.group, 'group')}/admins`,
        ctx.admin,
        {
          personId,
          function: tenure.function,
          sinceOn: tenure.sinceOn,
        },
      );
    }
  }
  for (const [group, times] of Object.entries(USUAL_TRAINING_TIMES)) {
    await send(
      'PUT',
      `groups/${lookUp(ctx.groupIds, group, 'group')}/usual-training-times`,
      ctx.admin,
      {
        usualTrainingTimes: times.map((time) => ({
          ...time,
          venueId: lookUp(ctx.venueIds, 'Sporthalle Am Ring', 'venue'),
        })),
      },
    );
  }
  log('group memberships, trainers and usual training times: in place');
};

const groupDetailOf = (ctx: Context, group: GroupName): Promise<GroupDetail> =>
  getJson(`groups/${lookUp(ctx.groupIds, group, 'group')}`, ctx.admin, GroupDetailSchema);

const ensureVenues = async (ctx: Context): Promise<void> => {
  const existing = await getJson('manage/venues', ctx.admin, VenuesSchema);
  const venueIds = new Map(existing.venues.map((venue) => [venue.name, venue.venueId]));
  for (const venue of PRESALE_VENUES) {
    const body = { ...venue, ...GROSSFURRA };
    const venueId = venueIds.get(venue.name);
    if (venueId === undefined) {
      const created = await postJson('manage/venues', ctx.admin, body, CreatedVenueSchema);
      venueIds.set(venue.name, created.venueId);
    } else {
      await send('PUT', `manage/venues/${venueId}`, ctx.admin, body);
    }
  }
  ctx.venueIds = venueIds;
  log(`presale places: ${PRESALE_VENUES.map((venue) => venue.name).join(', ')}`);
};

const ensureRoles = async (ctx: Context): Promise<void> => {
  const existing = await getJson('manage/roles', ctx.admin, RolesSchema);
  const roles = new Map(existing.roles.map((role) => [role.name, role]));
  for (const spec of ROLES) {
    let roleId = roles.get(spec.name)?.roleId;
    if (roleId === undefined) {
      const created = await postJson(
        'manage/roles',
        ctx.admin,
        { name: spec.name, description: spec.description, coin: { icon: spec.icon, tone: 'iris' } },
        CreatedRoleSchema,
      );
      roleId = created.roleId;
    }
    await send('PUT', `manage/roles/${roleId}/permissions`, ctx.admin, {
      permissionKeys: spec.permissionKeys,
    });
    const holders = roles.get(spec.name)?.holders ?? [];
    for (const holder of spec.holders) {
      const personId = lookUp(ctx.personIds, holder, 'person');
      if (!holders.some((row) => row.personId === personId)) {
        await send('POST', `manage/roles/${roleId}/holdings`, ctx.admin, {
          personId,
          sinceOn: '2024-11-11',
        });
      }
    }
  }
  log(`roles: ${ROLES.map((role) => `${role.name} → ${role.holders.join(', ')}`).join('; ')}`);
};

const ensureAccounts = async (ctx: Context): Promise<void> => {
  const { persons } = await getJson('manage/persons', ctx.admin, PersonsSchema);
  const states = new Map(
    persons.map((person) => [fullNameOf(person.firstName, person.lastName), person.accessState]),
  );
  let redeemed = 0;
  for (const spec of MEMBERS) {
    const name = nameOfMember(spec);
    if (!spec.hasAccount || states.get(name) === 'active') {
      continue;
    }
    await inviteAndRedeem(
      ctx.admin,
      lookUp(ctx.personIds, name, 'person'),
      emailOf(spec.firstName, spec.lastName),
    );
    redeemed += 1;
  }
  log(
    `accounts: ${MEMBERS.filter((spec) => spec.hasAccount).length} promo accounts (${redeemed} redeemed now)`,
  );
};

const sessionOf = async (ctx: Context, name: string): Promise<Session> => {
  const cached = ctx.sessions.get(name);
  if (cached !== undefined) {
    return cached;
  }
  const [firstName = '', ...rest] = name.split(' ');
  const session = await signIn(name, emailOf(firstName, rest.join(' ')), PERSONA_PASSWORD);
  ctx.sessions.set(name, session);
  return session;
};

const ensureSessionRecord = async (ctx: Context): Promise<void> => {
  const { sessions } = await getJson('manage/sessions', ctx.admin, SessionRecordsSchema);
  if (!sessions.some((session) => session.startYear === ctx.sessionYear)) {
    await postJson(
      'manage/sessions',
      ctx.admin,
      {
        startYear: ctx.sessionYear,
        number: ctx.sessionYear - FIRST_SESSION_YEAR,
        motto: SESSION_MOTTO,
      },
      CreatedSessionRecordSchema,
    );
  }
  log(`session ${ctx.sessionYear}/${ctx.sessionYear + 1}: „${SESSION_MOTTO}“`);
};

const eventBodyOf = (ctx: Context, spec: EventSpec): object => ({
  title: spec.title,
  startsAt: berlinInstant(spec.day, spec.startsAt).toISOString(),
  doorsOpenAt: spec.doorsOpenAt,
  venueId: lookUp(ctx.venueIds, HALL_VENUE, 'venue'),
  teaser: spec.teaser,
  description: spec.description,
  ageHint: spec.ageHint,
  priceCents: spec.priceCents,
  presaleStartsAt: spec.presaleStartsAt.toISOString(),
  presaleVenueIds: PRESALE_PLACES.map((place) => lookUp(ctx.venueIds, place, 'venue')),
});

const waitForPicture = async (ctx: Context, eventId: number): Promise<EventSummary> => {
  const deadline = Date.now() + MEDIA_WAIT_MS;
  while (Date.now() < deadline) {
    const { events } = await getJson('events', ctx.admin, EventsSchema);
    const event = events.find((row) => row.eventId === eventId);
    if (event?.picture !== null && event !== undefined) {
      return event;
    }
    await pause(MEDIA_POLL_MS);
  }
  throw new Error(`the poster of event ${eventId} never arrived`);
};

const ensureEvents = async (
  ctx: Context,
  specs: readonly EventSpec[],
): Promise<Map<string, number>> => {
  const { events } = await getJson('events', ctx.admin, EventsSchema);
  const known = new Map(events.map((event) => [event.title, event]));
  const eventIds = new Map<string, number>();
  for (const [index, spec] of specs.entries()) {
    const body = eventBodyOf(ctx, spec);
    let event = known.get(spec.title);
    let eventId = event?.eventId;
    if (eventId === undefined) {
      eventId = (await postJson('events', ctx.admin, body, CreatedEventSchema)).eventId;
    } else {
      await send('PUT', `events/${eventId}`, ctx.admin, body);
    }
    eventIds.set(spec.key, eventId);
    if (event?.picture === null || event === undefined) {
      await uploadMedia(
        ctx.admin,
        `event:${eventId}`,
        `plakat-${spec.key}.png`,
        posterPng(spec.palette, index + 11),
      );
      event = await waitForPicture(ctx, eventId);
    }
    if (event.publishedAt === null && !event.isOver) {
      await send('PUT', `events/${eventId}/published`, ctx.admin);
    }
    if (spec.presaleStartsAt <= ctx.moment.now && !event.isOver) {
      await send('PUT', `events/${eventId}/ticket-availability`, ctx.admin, {
        ticketAvailability: spec.ticketAvailability,
      });
    }
  }
  log(`events: ${specs.map((spec) => `${spec.title} ${spec.day}`).join(' | ')}`);
  return eventIds;
};

const ensureActs = async (ctx: Context): Promise<Map<string, number>> => {
  const { acts } = await getJson(`acts?session=${ctx.sessionYear}`, ctx.admin, ActsSchema);
  const actIds = new Map(acts.filter((act) => !act.archived).map((act) => [act.name, act.actId]));
  for (const spec of ACTS) {
    const body = {
      name: spec.name,
      groupId: spec.group === null ? null : lookUp(ctx.groupIds, spec.group, 'group'),
      kind: spec.kind,
      sessionYear: spec.kind === 'point' ? null : ctx.sessionYear,
      addedPersonIds: spec.added.map((name) => lookUp(ctx.personIds, name, 'person')),
      removedPersonIds: [],
      wishes: spec.wish === null ? [] : [{ kind: spec.wish, strength: 'must' }],
    };
    const actId = actIds.get(spec.name);
    if (actId === undefined) {
      actIds.set(spec.name, (await postJson('acts', ctx.admin, body, CreatedActSchema)).actId);
    } else {
      await send('PUT', `acts/${actId}`, ctx.admin, body);
    }
  }
  log(`acts: ${ACTS.length} for the session ${ctx.sessionYear}`);
  return actIds;
};

const findingsOf = (order: RunningOrder): string =>
  order.findings.length === 0
    ? 'no findings'
    : order.findings.map((finding) => `${finding.severity} ${finding.kind}`).join(', ');

const ensureRunningOrders = async (
  ctx: Context,
  specs: readonly EventSpec[],
  eventIds: ReadonlyMap<string, number>,
  actIds: ReadonlyMap<string, number>,
): Promise<void> => {
  for (const spec of specs) {
    const eventId = lookUp(eventIds, spec.key, 'event');
    const route = `events/${eventId}/running-order`;
    const current = await getJsonOrNull(route, ctx.admin, RunningOrderSchema);
    const lines = spec.runningOrder.map((name, position) => ({
      actId: lookUp(actIds, name, 'act'),
      position,
      pinned: false,
      blockKey: null,
    }));
    const isSame =
      current !== null &&
      current.lines.length === lines.length &&
      lines.every((line) =>
        current.lines.some((row) => row.act.actId === line.actId && row.position === line.position),
      );
    const saved = isSame
      ? current
      : await putJson(
          route,
          ctx.admin,
          { version: current?.version ?? null, lines, rules: [], suspendedActWishIds: [] },
          RunningOrderSchema,
        );
    const confirmed =
      saved.confirmedAt !== null && !saved.changedSinceConfirmed
        ? saved
        : await putJson(
            `${route}/confirmation`,
            ctx.admin,
            { confirmed: true },
            RunningOrderSchema,
          );
    log(`running order ${spec.title}: ${lines.length} acts, confirmed, ${findingsOf(confirmed)}`);
  }
};

const ensureHall = async (ctx: Context): Promise<number> => {
  const venueId = lookUp(ctx.venueIds, HALL_VENUE, 'venue');
  const { halls } = await getJson('halls', ctx.admin, HallsSchema);
  const hallId =
    halls.find((hall) => hall.venueId === venueId && hall.name === HALL_NAME)?.hallId ??
    (await postJson('halls', ctx.admin, { venueId, name: HALL_NAME }, CreatedHallSchema)).hallId;
  const hall = await getJson(`halls/${hallId}`, ctx.admin, HallSchema);
  await send('PUT', `halls/${hallId}`, ctx.admin, {
    name: HALL_NAME,
    document: hallDocument(),
    version: hall.version,
  });
  log(`hall: ${HALL_NAME} (${HALL_VENUE})`);
  return hallId;
};

const ensureTablePlans = async (
  ctx: Context,
  specs: readonly EventSpec[],
  eventIds: ReadonlyMap<string, number>,
  hallId: number,
): Promise<void> => {
  const seating = await getJson('seating', ctx.admin, SeatingSchema);
  const biertischId = seating.tableTypes.find((type) => type.name === 'Biertisch')?.tableTypeId;
  if (biertischId === undefined) {
    throw new Error('no table type Biertisch');
  }
  const ownerId = lookUp(eventIds, PRUNKSITZUNG, 'event');
  const ownRoute = `events/${ownerId}/table-plan`;
  if ((await getJsonOrNull(ownRoute, ctx.admin, TablePlanSchema)) === null) {
    await send('POST', ownRoute, ctx.admin, { hallId, copyFromEventId: null });
  }
  const own = await getJson(ownRoute, ctx.admin, TablePlanSchema);
  await putJson(
    ownRoute,
    ctx.admin,
    tablePlanBodyOf(hallId, biertischId, own.version),
    TablePlanVersionSchema,
  );
  for (const spec of specs) {
    const eventId = lookUp(eventIds, spec.key, 'event');
    if (spec.tablePlan === 'none') {
      await send('PUT', `events/${eventId}/table-plan-need`, ctx.admin, { needed: false });
      continue;
    }
    const route = `events/${eventId}/table-plan`;
    if (
      spec.tablePlan === 'copy' &&
      (await getJsonOrNull(route, ctx.admin, TablePlanSchema)) === null
    ) {
      await send('POST', route, ctx.admin, { hallId, copyFromEventId: ownerId });
    }
  }
  log('table plans: 1. Prunksitzung planned, copied to the other hall evenings');
};

const ensureTrainings = async (
  ctx: Context,
  specs: readonly TrainingSpec[],
): Promise<Map<string, number>> => {
  const lena = await sessionOf(ctx, PERSONA);
  const span = `from=${addDays(ctx.moment.today, -CALENDAR_LOOKBACK_DAYS)}&to=${addDays(ctx.moment.today, CALENDAR_LOOKAHEAD_DAYS)}`;
  const { entries } = await getJson(`calendar?scope=all&${span}`, lena, CalendarEntriesSchema);
  const trainingIds = new Map<string, number>();
  for (const spec of specs) {
    const ownerGroupId = lookUp(ctx.groupIds, spec.owner, 'group');
    const body = {
      title: spec.title,
      description: spec.description,
      ownerGroupId,
      venueId: lookUp(ctx.venueIds, spec.venue, 'venue'),
      startsAt: berlinInstant(spec.day, spec.startsAt).toISOString(),
      endsAt: berlinInstant(spec.day, spec.endsAt).toISOString(),
      kind: 'training',
      visibility: 'club',
      asksForResponse: true,
      participatingGroupIds: [],
    };
    const knownId = entries.find(
      (entry) => entry.title === spec.title && entry.ownerGroupId === ownerGroupId,
    )?.calendarEntryId;
    if (knownId === undefined) {
      trainingIds.set(
        spec.title,
        (await postJson('calendar/entries', ctx.admin, body, CreatedCalendarEntrySchema))
          .calendarEntryId,
      );
    } else {
      await send('PUT', `calendar/entries/${knownId}`, ctx.admin, body);
      trainingIds.set(spec.title, knownId);
    }
  }
  log(`trainings: ${specs.length} placed around ${ctx.moment.today}`);
  return trainingIds;
};

const answerOf = (
  person: string,
  trainingIndex: number,
  isNext: boolean,
  isLast: boolean,
): Answer | null => {
  if (person === PERSONA) {
    return isLast ? null : 'yes';
  }
  if (isNext && person === ABSENT_NEXT_TRAINING) {
    return 'no';
  }
  if (isNext && person === UNSURE_NEXT_TRAINING) {
    return 'maybe';
  }
  if (isLast && trainingIndex % 3 === 0) {
    return null;
  }
  return (trainingIndex + person.length) % 11 === 0 ? 'no' : 'yes';
};

const ensureAttendance = async (
  ctx: Context,
  specs: readonly TrainingSpec[],
  trainingIds: ReadonlyMap<string, number>,
  marschtanzId: number,
): Promise<void> => {
  const trainer = await sessionOf(ctx, TRAINER);
  const members = MEMBERS.filter((spec) => spec.hasAccount);
  const casts: Record<string, readonly string[]> = {
    Tanzgarde: MARSCH_SPOT_HOLDERS,
    Showtanzgruppe: members.filter((spec) => spec.group === 'Showtanzgruppe').map(nameOfMember),
  };
  for (const [group, cast] of Object.entries(casts)) {
    const trainings = specs.filter((spec) => spec.owner === group);
    const coming = trainings.filter((spec) => spec.day >= ctx.moment.today);
    for (const [trainingIndex, spec] of trainings.entries()) {
      const calendarEntryId = lookUp(trainingIds, spec.title, 'training');
      const isNext = coming[0]?.title === spec.title;
      const isLast = coming.at(-1)?.title === spec.title;
      for (const person of cast) {
        const answer = answerOf(person, trainingIndex, isNext, isLast);
        if (answer === null) {
          continue;
        }
        if (MARKED_BY_TRAINER.includes(person)) {
          if (spec.day >= ctx.moment.today && answer !== 'maybe') {
            await send(
              'PUT',
              `acts/${marschtanzId}/trainings/${calendarEntryId}/attendance/${lookUp(ctx.personIds, person, 'person')}`,
              trainer,
              { answer },
            );
          }
          continue;
        }
        await send('POST', `calendar/${calendarEntryId}/response`, await sessionOf(ctx, person), {
          answer,
        });
      }
    }
  }
  log(
    `attendance: answers to the trainings, ${ABSENT_NEXT_TRAINING} cancels the next Marschtanz training`,
  );
};

const studioOf = async (session: Session, actId: number): Promise<Studio> => {
  const { studio } = await getJson(`acts/${actId}/studio`, session, StudioSchema);
  if (studio === null) {
    throw new Error(`${session.label} sees no studio of act ${actId}`);
  }
  return studio;
};

const waitForMusic = async (session: Session, actId: number): Promise<Studio> => {
  const deadline = Date.now() + MEDIA_WAIT_MS;
  while (Date.now() < deadline) {
    const studio = await studioOf(session, actId);
    const song = studio.songs[0];
    if (song?.state === 'failed') {
      throw new Error('the media worker failed on the march');
    }
    if (song?.state === 'ready') {
      return studio;
    }
    await pause(MEDIA_POLL_MS);
  }
  throw new Error('the march was not ready in time — is the promo media worker running?');
};

const ensureStudio = async (ctx: Context, actId: number): Promise<void> => {
  const trainer = await sessionOf(ctx, TRAINER);
  const march = carnivalMarch();
  let studio = await studioOf(trainer, actId);
  if (studio.songs.length === 0) {
    const mediaItemId = await uploadMedia(
      trainer,
      `act:${actId}`,
      'Marsch 2026 – Endfassung.wav',
      march.wav,
    );
    await postJson(`acts/${actId}/songs`, trainer, { mediaItemId }, CreatedSongSchema);
    log('studio: march uploaded, waiting for the media worker');
  }
  studio = await waitForMusic(trainer, actId);
  const song = studio.songs[0];
  if (song === undefined || song.durationSeconds === null) {
    throw new Error('the march has no duration');
  }
  if (song.tempoBpm !== MARCH_BPM || song.firstBeatSeconds !== 0) {
    await send('PUT', `acts/${actId}/songs/${song.songId}`, trainer, {
      pieces: [{ startSeconds: 0, endSeconds: song.durationSeconds }],
      firstBeatSeconds: 0,
      tempoBpm: MARCH_BPM,
    });
  }
  const stepCount = MARCH_STEPS.reduce((count, part) => count + part.names.length, 0);
  const stepSeconds = march.barSeconds * STEP_BARS;
  if (studio.steps.length === 0) {
    for (let step = 1; step < stepCount; step += 1) {
      await postJson(
        `acts/${actId}/steps`,
        trainer,
        { atSeconds: step * stepSeconds },
        CreatedStepsSchema,
      );
    }
  }
  studio = await studioOf(trainer, actId);
  const steps = [...studio.steps].sort((first, second) => first.startSeconds - second.startSeconds);
  const names = MARCH_STEPS.flatMap((part) => part.names);
  for (const [index, step] of steps.entries()) {
    const name = names[index] ?? '';
    if (step.name !== name) {
      await send('PUT', `acts/${actId}/steps/${step.stepId}`, trainer, { name });
    }
  }
  if (studio.parts.length === 0) {
    let first = 0;
    for (const part of MARCH_STEPS) {
      const firstStep = steps[first];
      const lastStep = steps[first + part.names.length - 1];
      if (firstStep !== undefined && lastStep !== undefined) {
        await postJson(
          `acts/${actId}/parts`,
          trainer,
          { firstStepId: firstStep.stepId, lastStepId: lastStep.stepId, name: part.part },
          CreatedPartSchema,
        );
      }
      first += part.names.length;
    }
  }
  await ensureSpotsAndChoreography(ctx, trainer, actId, song.mediaItemId, march.barSeconds);
  log(
    `studio: ${MARSCHTANZ} with music, ${steps.length} steps, ${MARCH_STEPS.length} parts, ${MARSCH_SPOT_HOLDERS.length} spots`,
  );
};

const ensureSpotsAndChoreography = async (
  ctx: Context,
  trainer: Session,
  actId: number,
  mediaItemId: number,
  barSeconds: number,
): Promise<void> => {
  let studio = await studioOf(trainer, actId);
  for (let missing = studio.spots.length; missing < MARSCH_SPOT_HOLDERS.length; missing += 1) {
    await postJson(`acts/${actId}/spots`, trainer, {}, CreatedSpotSchema);
  }
  studio = await studioOf(trainer, actId);
  const spots = [...studio.spots].sort((first, second) => first.number - second.number);
  for (const [index, spot] of spots.entries()) {
    const holder = MARSCH_SPOT_HOLDERS[index];
    const personId = holder === undefined ? null : lookUp(ctx.personIds, holder, 'person');
    if (spot.person?.personId !== personId) {
      await send('PUT', `acts/${actId}/spots/${spot.spotId}`, trainer, { personId });
    }
  }
  const steps = [...studio.steps].sort((first, second) => first.startSeconds - second.startSeconds);
  const formations = steps.map((_, index) => formationOf(index, spots.length));
  const keyframe = (seconds: number, position: Position): Keyframe => ({
    sourceMediaItemId: mediaItemId,
    seconds: Math.round(seconds * 1000) / 1000,
    position: roundedOf(position),
    bend: null,
    easing: 'easeInOut',
    facingDegrees: null,
  });
  const tracks = spots.map((spot, spotIndex) => ({
    spotId: spot.spotId,
    keyframes: steps.flatMap((step, stepIndex) => {
      const arrive = formations[stepIndex]?.[spotIndex];
      const leave = formations[stepIndex - 1]?.[spotIndex];
      if (arrive === undefined) {
        return [];
      }
      if (leave === undefined) {
        return [keyframe(step.startSeconds, arrive)];
      }
      return [
        keyframe(step.startSeconds, leave),
        keyframe(step.startSeconds + barSeconds * STEP_TRANSITION_BARS, arrive),
      ];
    }),
  }));
  if (studio.choreography !== null && placesOf(studio.choreography.tracks) === placesOf(tracks)) {
    return;
  }
  await putJson(
    `acts/${actId}/choreography`,
    trainer,
    { baseVersion: studio.choreography?.version ?? null, tracks },
    ChoreographyVersionSchema,
  );
};

const ensureNews = async (
  ctx: Context,
  specs: readonly NewsSpec[],
  eventIds: ReadonlyMap<string, number>,
): Promise<void> => {
  const author = await sessionOf(ctx, NEWS_AUTHOR);
  const { sections } = await getJson('news', author, NewsSchema);
  const posts = sections.flatMap((section) => section.posts);
  for (const spec of specs) {
    const known = posts.find((post) => post.title === spec.title);
    const newsPostId =
      known?.newsPostId ??
      (
        await postJson(
          'news',
          author,
          {
            title: spec.title,
            teaser: spec.teaser,
            text: spec.text,
            category: spec.category,
            eventId: spec.event === null ? null : lookUp(eventIds, spec.event, 'event'),
            albumId: null,
          },
          CreatedNewsPostSchema,
        )
      ).newsPostId;
    if (known?.state !== 'published') {
      await send('POST', `news/${newsPostId}/publication`, author);
    }
  }
  log(`news: ${specs.map((spec) => spec.title).join(' | ')}`);
};

const arrivalsTweak = (ctx: Context): SqlTweak => {
  const accountHolders = MEMBERS.filter((spec) => spec.hasAccount);
  return {
    why: 'The promo members joined the app one after another over the last months, not all in the minute the seed ran; the reel lists them in the order they arrived.',
    statements: accountHolders.flatMap((spec, index) => {
      const personId = lookUp(ctx.personIds, nameOfMember(spec), 'person');
      const redeemedAt = berlinInstant(
        addDays(ctx.moment.today, -(ARRIVAL_FIRST_DAYS_AGO - index * ARRIVAL_STEP_DAYS)),
        `${String(17 + (index % 5)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
      );
      const invitedAt = daysAfter(redeemedAt, -1);
      return [
        `UPDATE account_event SET at = ${sqlInstant(redeemedAt)} WHERE person_id = ${personId} AND kind = 'Redeemed';`,
        `UPDATE account_event SET at = ${sqlInstant(invitedAt)} WHERE person_id = ${personId} AND kind = 'Invited';`,
        `UPDATE invitation SET issued_at = ${sqlInstant(invitedAt)}, expires_at = ${sqlInstant(daysAfter(invitedAt, INVITATION_LIFETIME_DAYS))}, redeemed_at = ${sqlInstant(redeemedAt)} WHERE person_id = ${personId} AND redeemed_at IS NOT NULL;`,
      ];
    }),
  };
};

const publishedEarlierTweak = (
  ctx: Context,
  eventSpecs: readonly EventSpec[],
  eventIds: ReadonlyMap<string, number>,
  newsSpecs: readonly NewsSpec[],
): SqlTweak => ({
  why: 'Events and news were published days and weeks ago, not in the second the seed ran; the API stamps the publishing moment.',
  statements: [
    ...eventSpecs.map(
      (spec) =>
        `UPDATE event SET published_at = ${sqlInstant(daysAfter(ctx.moment.now, -spec.publishedDaysAgo))} WHERE calendar_entry_id = ${lookUp(eventIds, spec.key, 'event')} AND published_at IS NOT NULL;`,
    ),
    ...newsSpecs.map(
      (spec) =>
        `UPDATE news_post SET published_at = ${sqlInstant(daysAfter(ctx.moment.now, -spec.publishedDaysAgo))} WHERE title = ${sqlText(spec.title)} AND published_at IS NOT NULL;`,
    ),
  ],
});

const run = async (): Promise<void> => {
  const moment = momentOf(new Date());
  const sessionYear = sessionYearOf(moment.today);
  log(`seeding the promo club for ${moment.today} (session ${sessionYear}) against ${API_BASE}`);
  const ctx: Context = {
    moment,
    sessionYear,
    admin: await signIn('admin', ADMIN_EMAIL, ADMIN_PASSWORD),
    sessions: new Map(),
    personIds: new Map(),
    groupIds: new Map(),
    venueIds: new Map(),
  };
  ctx.sessions.set(PERSONA, await signIn(PERSONA, 'lena.brandt@furria.local', PERSONA_PASSWORD));

  await ensureSessionRecord(ctx);
  await ensureVenues(ctx);
  await ensureShowtanzGroup(ctx);
  await ensurePersons(ctx);
  await ensureGroupTies(ctx);
  await ensureRoles(ctx);
  await ensureAccounts(ctx);

  const eventSpecs = eventSpecsOf(sessionYear);
  const eventIds = await ensureEvents(ctx, eventSpecs);
  const actIds = await ensureActs(ctx);
  await ensureRunningOrders(ctx, eventSpecs, eventIds, actIds);
  const hallId = await ensureHall(ctx);
  await ensureTablePlans(ctx, eventSpecs, eventIds, hallId);

  const marschtanzId = lookUp(actIds, MARSCHTANZ, 'act');
  await ensureStudio(ctx, marschtanzId);
  const trainingSpecs = trainingSpecsOf(moment);
  const trainingIds = await ensureTrainings(ctx, trainingSpecs);
  await ensureAttendance(ctx, trainingSpecs, trainingIds, marschtanzId);

  const newsSpecs = newsSpecsOf();
  await ensureNews(ctx, newsSpecs, eventIds);
  for (const session of ctx.sessions.values()) {
    await send('PUT', 'auth/me/welcome-seen', session);
  }
  log(`welcome: seen by ${ctx.sessions.size} accounts, so Start opens without the welcome poster`);

  const script = sqlScriptOf([
    arrivalsTweak(ctx),
    publishedEarlierTweak(ctx, eventSpecs, eventIds, newsSpecs),
  ]);
  await mkdir(path.dirname(SQL_OUT), { recursive: true });
  await writeFile(SQL_OUT, script);
  if (PSQL_COMMAND === null) {
    log(`realism SQL written to ${path.resolve(SQL_OUT)}; apply it with psql before shooting`);
  } else {
    await applySql(script, PSQL_COMMAND);
    log('realism SQL applied');
  }

  const studio = await studioOf(await sessionOf(ctx, TRAINER), marschtanzId);
  const nextTraining = studio.trainings.find((training) => training.title.startsWith('Marschtanz'));
  log(`\npersona: ${PERSONA} lena.brandt@furria.local / ${PERSONA_PASSWORD}`);
  log(
    `act ${MARSCHTANZ}: ${marschtanzId} (/acts/${marschtanzId}, /practice, /training, /trainings/<training id>)`,
  );
  log(
    `next Marschtanz training: ${nextTraining === undefined ? 'none' : `${nextTraining.calendarEntryId} ${nextTraining.title}`}`,
  );
  log(
    `event 1. Prunksitzung: ${lookUp(eventIds, PRUNKSITZUNG, 'event')} (/events/<id>/running-order, /table-plan)`,
  );
  for (const spec of eventSpecs) {
    log(`  ${spec.key.padEnd(16)} ${lookUp(eventIds, spec.key, 'event')}  ${spec.day}`);
  }
};

run().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
