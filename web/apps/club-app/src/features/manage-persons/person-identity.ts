import type { KkStateTone } from '@furria/ui';
import type { AccessActions, PersonAccess } from '@/features/account-access';
import { sessionAt } from '@/lib/club';
import { fromIsoDay, toIsoDay } from '@/lib/day';
import { formatIsoDay, formatSessionLabel } from '@/lib/membership-labels';
import { toFeeReductionBasisLabel } from './manage-persons-labels';
import type { PersonDetails, PersonFeeReduction, PersonMembership } from './schemas';

const FACT_SEPARATOR = ' · ';

export type AppStatus =
  | 'active'
  | 'invited'
  | 'expired'
  | 'disabled'
  | 'noBirthDate'
  | 'underAge'
  | 'notAffiliated'
  | 'mailless'
  | 'none';

export interface AppFact {
  status: AppStatus;
  on: string | null;
}

const latestEventDay = (access: PersonAccess, kinds: readonly string[]): string | null => {
  const latest = access.history
    .filter((event) => kinds.includes(event.kind))
    .reduce<string | null>(
      (newest, event) => (newest === null || event.at > newest ? event.at : newest),
      null,
    );

  return latest === null ? null : toIsoDay(new Date(latest));
};

const ARRIVAL_EVENTS = ['redeemed', 'recovered', 'enabled'] as const;
const LOCK_EVENTS = ['disabled'] as const;

const hasAddress = (email: string | null): boolean => email !== null && email.trim() !== '';

export const appFactOf = (access: PersonAccess, email: string | null): AppFact => {
  if (access.state === 'active') {
    return { status: 'active', on: latestEventDay(access, ARRIVAL_EVENTS) };
  }
  if (access.state === 'disabled') {
    return { status: 'disabled', on: latestEventDay(access, LOCK_EVENTS) };
  }
  if (access.invitation !== null) {
    const expiresOn = toIsoDay(new Date(access.invitation.expiresAt));

    return { status: access.invitation.isExpired ? 'expired' : 'invited', on: expiresOn };
  }
  if (access.reason !== null) {
    return { status: access.reason, on: null };
  }

  return { status: hasAddress(email) ? 'none' : 'mailless', on: null };
};

interface AppFactCopy {
  value: string;
  tone: KkStateTone;
  detail: (on: string | null, ageOfConsent: number) => string | null;
}

const sinceDay = (on: string | null): string | null =>
  on === null ? null : `seit ${formatIsoDay(on)}`;

const APP_FACT_COPY: Record<AppStatus, AppFactCopy> = {
  active: { value: 'aktiv', tone: 'green', detail: sinceDay },
  invited: {
    value: 'eingeladen',
    tone: 'gold',
    detail: (on) => (on === null ? null : `gültig bis ${formatIsoDay(on)}`),
  },
  expired: {
    value: 'Einladung abgelaufen',
    tone: 'accent',
    detail: (on) => (on === null ? null : `am ${formatIsoDay(on)}`),
  },
  disabled: { value: 'gesperrt', tone: 'accent', detail: sinceDay },
  noBirthDate: { value: 'kein Zugang', tone: 'accent', detail: () => 'Geburtsdatum fehlt' },
  underAge: {
    value: 'nicht einladbar',
    tone: 'ink',
    detail: (_on, ageOfConsent) => `jünger als ${ageOfConsent}`,
  },
  notAffiliated: { value: 'nicht einladbar', tone: 'ink', detail: () => 'nicht im Verein aktiv' },
  mailless: { value: 'kein Zugang', tone: 'ink', detail: () => 'nur vor Ort einladbar' },
  none: { value: 'kein Zugang', tone: 'ink', detail: () => 'noch nicht eingeladen' },
};

const MEMBERSHIP_FACT_COPY: Record<
  PersonDetails['membershipState'],
  { value: string; tone: KkStateTone }
> = {
  active: { value: 'aktiv', tone: 'green' },
  paused: { value: 'ruht', tone: 'gold' },
  ended: { value: 'beendet', tone: 'ink' },
  none: { value: 'kein Mitglied', tone: 'ink' },
};

const latestEndedOn = (memberships: readonly PersonMembership[]): string | null =>
  memberships.reduce<string | null>(
    (latest, membership) =>
      membership.endedOn !== null && (latest === null || membership.endedOn > latest)
        ? membership.endedOn
        : latest,
    null,
  );

const membershipDetail = (person: PersonDetails): string | null => {
  if (person.membershipState === 'ended') {
    const endedOn = latestEndedOn(person.memberships);

    return endedOn === null ? null : `bis ${formatIsoDay(endedOn)}`;
  }
  if (person.memberSince === null) {
    return null;
  }

  return `seit ${person.memberSince.slice(0, 4)}`;
};

const joinedOrNull = (names: readonly string[]): string | null =>
  names.length === 0 ? null : names.join(FACT_SEPARATOR);

export const runningFeeReductionOf = (
  reductions: readonly PersonFeeReduction[],
  sessionYear: number,
): PersonFeeReduction | null =>
  reductions.find(
    (reduction) =>
      reduction.firstSessionYear <= sessionYear && sessionYear <= reduction.lastSessionYear,
  ) ?? null;

export type IdentitySection = 'memberships' | 'ties' | 'keys' | 'feeReductions';

export interface IdentityTile {
  section: IdentitySection;
  label: string;
  value: string;
  detail: string | null;
  tone: KkStateTone;
}

export interface AppLead {
  status: AppStatus;
  value: string;
  detail: string | null;
  tone: KkStateTone;
  dashed: boolean;
}

const DASHED_STATUSES: readonly AppStatus[] = ['invited', 'noBirthDate'];

export const toAppLead = (access: PersonAccess, email: string | null): AppLead => {
  const app = appFactOf(access, email);
  const copy = APP_FACT_COPY[app.status];

  return {
    status: app.status,
    value: copy.value,
    detail: copy.detail(app.on, access.ageOfConsent),
    tone: copy.tone,
    dashed: DASHED_STATUSES.includes(app.status),
  };
};

const tileOf = (
  section: IdentitySection,
  label: string,
  value: string | null,
  detail: string | null = null,
): IdentityTile[] => (value === null ? [] : [{ section, label, value, detail, tone: 'ink' }]);

export const toSeasonsLabel = (count: number): string => (count === 1 ? 'Session' : 'Sessionen');

const withSeasons = (detail: string | null, memberCount: number): string | null => {
  if (memberCount === 0) {
    return detail;
  }

  const seasons = `${memberCount} ${toSeasonsLabel(memberCount)}`;

  return detail === null ? seasons : `${detail}${FACT_SEPARATOR}${seasons}`;
};

export const toIdentityTiles = (
  person: PersonDetails,
  today: Date,
  memberCount: number,
): IdentityTile[] => {
  const membership = MEMBERSHIP_FACT_COPY[person.membershipState];
  const reduction = runningFeeReductionOf(person.feeReductions, sessionAt(today).startYear);
  const offices = [
    ...person.roles.filter((role) => role.untilOn === null).map((role) => role.name),
    ...person.unendedBoardSeats.map((seat) => seat.name),
  ];
  const groups = person.groups.filter((group) => group.leftOn === null).map((group) => group.name);

  return [
    {
      section: 'memberships',
      label: 'Mitglied',
      value: membership.value,
      detail: withSeasons(membershipDetail(person), memberCount),
      tone: membership.tone,
    },
    ...tileOf('ties', 'Gruppen', joinedOrNull(groups)),
    ...tileOf('ties', 'Rollen', joinedOrNull(offices)),
    ...tileOf(
      'keys',
      'Schlüssel',
      joinedOrNull(person.unendedKeyHoldings.map((holding) => holding.name)),
    ),
    ...tileOf(
      'feeReductions',
      'Ermäßigung',
      reduction === null ? null : toFeeReductionBasisLabel(reduction.basis),
      reduction === null ? null : `bis ${formatSessionLabel(reduction.lastSessionYear)}`,
    ),
  ];
};

export type AppAct = 'birthDate' | 'invite' | 'reinvite' | 'inPerson' | 'unlock';

export const toAppAct = (actions: AccessActions): AppAct | null => {
  if (actions.birthDateEntry && !actions.vouchesForAge) {
    return 'birthDate';
  }
  if (actions.mailInvitation !== null) {
    return actions.mailInvitation;
  }
  if (actions.inPersonInvitation) {
    return 'inPerson';
  }

  return actions.lock === 'enable' ? 'unlock' : null;
};

export const toSectionLandingKey = (section: IdentitySection, personId: number): string =>
  `person-${section}-${personId}`;

export const toBirthLine = (
  birthDate: string | null,
  city: string | null,
  today: Date,
): string | null => {
  const age = birthDate === null ? null : ageOn(birthDate, today);
  const parts = [
    birthDate === null ? null : `*${formatIsoDay(birthDate)}`,
    age === null ? null : `${age} Jahre`,
    city === null || city.trim() === '' ? null : city.trim(),
  ].filter((part): part is string => part !== null);

  return parts.length === 0 ? null : parts.join(FACT_SEPARATOR);
};

export const ageOn = (birthDate: string, today: Date): number => {
  const birth = fromIsoDay(birthDate);
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  return today.getFullYear() - birth.getFullYear() - (hadBirthday ? 0 : 1);
};

const PERSON_GAPS = ['feeReductions', 'ties', 'keys'] as const;

export type PersonGap = (typeof PERSON_GAPS)[number];

type PersonTies = Pick<
  PersonDetails,
  'feeReductions' | 'groups' | 'roles' | 'unendedBoardSeats' | 'unendedKeyHoldings'
>;

export const toPersonGaps = (person: PersonTies): PersonGap[] => {
  const filled: Record<PersonGap, boolean> = {
    feeReductions: person.feeReductions.length > 0,
    ties:
      person.groups.length > 0 || person.roles.length > 0 || person.unendedBoardSeats.length > 0,
    keys: person.unendedKeyHoldings.length > 0,
  };

  return PERSON_GAPS.filter((gap) => !filled[gap]);
};
