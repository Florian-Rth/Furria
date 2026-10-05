import type { KkIconName, KkSummaryFact } from '@furria/ui';
import type { GreetingView, GreetingViewer } from '@/features/start';
import { greetingActAt, toGreetingCopy, toGreetingText, toGreetingView } from '@/features/start';
import type { MembershipState } from '@/lib/api/schemas';
import { relevantSessionYear } from '@/lib/club';

export type LabGreetingBank = 'season' | 'opening' | 'carnival' | 'personal';

export type LabGreetingTile = 'ink' | 'gold';

export interface LabGreeting {
  slug: string;
  bank: LabGreetingBank;
  title: string;
  at: string;
  viewer: GreetingViewer;
  firstName: string;
  still: boolean;
}

interface LabViewerTraits {
  birthDate?: string;
  memberSince?: string | null;
  membershipState?: MembershipState;
  ordinal?: number | null;
  appSince?: string;
}

interface LabGreetingSpec {
  slug: string;
  bank: LabGreetingBank;
  title: string;
  at: string;
  traits?: LabViewerTraits;
  firstName?: string;
  still?: boolean;
}

export const LAB_TITLE = 'Labor';
export const LAB_LEAD = 'Jeder Zustand der Begrüßung auf Start, zum Durchsehen.';
export const LAB_PATH = '/lab';
export const LAB_ORIGIN = { label: LAB_TITLE, to: LAB_PATH };
export const REPLAY_LABEL = 'Nochmal';
export const NEXT_LABEL = 'Weiter';

const PERSONA = 'Lena';
const LONG_NAME = 'Maximiliane-Sophie';
const ORDINAL = 12;
const BIRTH_DATE = '1994-06-02';
const MEMBER_SINCE = '2015-09-01';
const APP_SINCE = '2026-09-01';

const BANKS: readonly { bank: LabGreetingBank; title: string; icon: KkIconName }[] = [
  { bank: 'season', title: 'Saison', icon: 'calendar' },
  { bank: 'opening', title: '11.11.', icon: 'live' },
  { bank: 'carnival', title: 'Fastnacht', icon: 'events' },
  { bank: 'personal', title: 'Persönlich', icon: 'person' },
];

const SPECS: readonly LabGreetingSpec[] = [
  {
    slug: 'zwischen-den-sessions',
    bank: 'season',
    title: 'Zwischen den Sessions',
    at: '2026-10-02T09:30',
  },
  {
    slug: 'schnapszahl-bis-11-11',
    bank: 'season',
    title: 'Schnapszahl bis zum 11.11.',
    at: '2026-10-09T09:30',
  },
  {
    slug: 'erste-session',
    bank: 'season',
    title: 'Vor der ersten Session',
    at: '2026-10-02T09:30',
    traits: { ordinal: 1 },
  },
  {
    slug: 'ohne-mitgliedschaft',
    bank: 'season',
    title: 'Ohne Mitgliedschaft',
    at: '2026-10-02T09:30',
    traits: { membershipState: 'none', memberSince: null, ordinal: null },
  },
  { slug: 'vorabend-11-11', bank: 'season', title: 'Vorabend des 11.11.', at: '2026-11-10T09:30' },
  { slug: 'session-tag', bank: 'season', title: 'Session-Tag', at: '2027-01-19T09:30' },
  { slug: 'schnapszahl-tag', bank: 'season', title: 'Schnapszahl-Tag', at: '2026-11-21T09:30' },
  {
    slug: 'session-tag-ohne-mitgliedschaft',
    bank: 'season',
    title: 'Session-Tag ohne Mitgliedschaft',
    at: '2027-01-19T09:30',
    traits: { membershipState: 'none', memberSince: null, ordinal: null },
  },
  {
    slug: 'langer-vorname',
    bank: 'season',
    title: 'Langer Vorname',
    at: '2027-01-19T09:30',
    firstName: LONG_NAME,
  },
  {
    slug: 'reduzierte-bewegung',
    bank: 'season',
    title: 'Reduzierte Bewegung',
    at: '2027-01-19T09:30',
    still: true,
  },
  { slug: 'morgen-des-11-11', bank: 'opening', title: 'Morgen des 11.11.', at: '2026-11-11T09:30' },
  { slug: 'countdown', bank: 'opening', title: 'Countdown', at: '2026-11-11T11:03:30' },
  {
    slug: 'countdown-bis-zum-ruf',
    bank: 'opening',
    title: 'Countdown bis zum Ruf',
    at: '2026-11-11T11:10:52',
  },
  { slug: 'ruf', bank: 'opening', title: 'Ruf', at: '2026-11-11T11:30' },
  {
    slug: 'bis-weiberfastnacht',
    bank: 'carnival',
    title: 'Bis Weiberfastnacht',
    at: '2027-01-29T09:30',
  },
  {
    slug: 'vorabend-weiberfastnacht',
    bank: 'carnival',
    title: 'Vorabend Weiberfastnacht',
    at: '2027-02-03T09:30',
  },
  { slug: 'weiberfastnacht', bank: 'carnival', title: 'Weiberfastnacht', at: '2027-02-04T09:30' },
  { slug: 'rosenmontag', bank: 'carnival', title: 'Rosenmontag', at: '2027-02-08T09:30' },
  {
    slug: 'fastnachtsdienstag',
    bank: 'carnival',
    title: 'Fastnachtsdienstag',
    at: '2027-02-09T09:30',
  },
  { slug: 'aschermittwoch', bank: 'carnival', title: 'Aschermittwoch', at: '2027-02-10T09:30' },
  {
    slug: 'geburtstag',
    bank: 'personal',
    title: 'Geburtstag',
    at: '2027-01-19T09:30',
    traits: { birthDate: '1994-01-19' },
  },
  {
    slug: 'runder-beitrittstag',
    bank: 'personal',
    title: 'Runder Beitrittstag',
    at: '2027-01-19T09:30',
    traits: { memberSince: '2016-01-19' },
  },
  {
    slug: 'beitrittstag',
    bank: 'personal',
    title: 'Beitrittstag',
    at: '2027-01-19T09:30',
    traits: { memberSince: '2024-01-19' },
  },
  {
    slug: 'erster-beitrittstag',
    bank: 'personal',
    title: 'Erster Beitrittstag',
    at: '2027-01-19T09:30',
    traits: { memberSince: '2026-01-19' },
  },
  {
    slug: 'willkommen',
    bank: 'personal',
    title: 'Erster Tag in der App',
    at: '2027-01-19T09:30',
    traits: { appSince: '2027-01-19' },
  },
];

const viewerOf = (at: string, traits: LabViewerTraits): GreetingViewer => {
  const ordinal = traits.ordinal === undefined ? ORDINAL : traits.ordinal;

  return {
    birthDate: traits.birthDate ?? BIRTH_DATE,
    membershipState: traits.membershipState ?? 'active',
    memberSince: traits.memberSince === undefined ? MEMBER_SINCE : traits.memberSince,
    relevantSession:
      ordinal === null ? null : { startYear: relevantSessionYear(new Date(at)), ordinal },
    appSince: traits.appSince ?? APP_SINCE,
  };
};

const labGreetingOfSpec = (spec: LabGreetingSpec): LabGreeting => {
  const viewer = viewerOf(spec.at, spec.traits ?? {});

  return {
    slug: spec.slug,
    bank: spec.bank,
    title: spec.title,
    at: spec.at,
    viewer,
    firstName: spec.firstName ?? PERSONA,
    still: spec.still === true,
  };
};

export const LAB_GREETINGS: readonly LabGreeting[] = SPECS.map(labGreetingOfSpec);

export const LAB_ENTRY_META = `${LAB_GREETINGS.length} Zustände der Begrüßung`;

export interface LabGreetingBankView {
  bank: LabGreetingBank;
  title: string;
  icon: KkIconName;
  greetings: LabGreeting[];
}

export const labBanksOf = (greetings: readonly LabGreeting[]): LabGreetingBankView[] =>
  BANKS.map((bank) => ({
    ...bank,
    greetings: greetings.filter((greeting) => greeting.bank === bank.bank),
  }));

export const labGreetingOf = (slug: string): LabGreeting | null =>
  LAB_GREETINGS.find((greeting) => greeting.slug === slug) ?? null;

export const labGreetingPathOf = (greeting: LabGreeting): string => `${LAB_PATH}/${greeting.slug}`;

export const nextLabGreetingOf = (
  greetings: readonly LabGreeting[],
  slug: string,
): LabGreeting | null => {
  const index = greetings.findIndex((greeting) => greeting.slug === slug);

  return greetings[(index + 1) % greetings.length] ?? null;
};

export const labShiftOf = (at: string, now: number): number => new Date(at).getTime() - now;

export const labHeadlineOf = (greeting: LabGreeting): string =>
  toGreetingText(
    toGreetingCopy(greetingActAt(new Date(greeting.at), greeting.viewer), greeting.firstName).parts,
  );

export const labViewOf = (greeting: LabGreeting): GreetingView =>
  toGreetingView({
    act: greetingActAt(new Date(greeting.at), greeting.viewer),
    firstName: greeting.firstName,
    reducedMotion: greeting.still,
    follows: false,
  });

export const labTileOf = (view: Pick<GreetingView, 'festive' | 'burst'>): LabGreetingTile =>
  view.festive || view.burst ? 'gold' : 'ink';

const TILE_LABELS: Record<LabGreetingTile, string> = {
  ink: 'Schwarz',
  gold: 'Gold',
};

const PLAY_LABELS: Record<GreetingView['play'], string> = {
  full: 'Ganze Tafel',
  live: 'Live',
  still: 'Ohne Bewegung',
};

const MOMENT_FORMAT = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export const labFactsOf = (greeting: LabGreeting, view: GreetingView): KkSummaryFact[] => [
  { label: 'Zeitpunkt', value: MOMENT_FORMAT.format(new Date(greeting.at)) },
  { label: 'Ablauf', value: PLAY_LABELS[view.play] },
  { label: 'Kacheln', value: TILE_LABELS[labTileOf(view)] },
  { label: 'Konfetti', value: view.burst ? 'Ja' : 'Nein' },
  { label: 'Tempo', value: view.tempo === 'slow' ? 'Langsam' : 'Normal' },
];
