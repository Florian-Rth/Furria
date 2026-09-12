import type { KkConfirmFact, KkDateQuickChoice, KkSelectOption } from '@furria/ui';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { toInitials } from '@/lib/initials';
import {
  formatAddress,
  formatIsoDay,
  formatPeriod,
  formatSessionLabel,
  formatSessionSpan,
  formatSinceSession,
  OPEN_END,
} from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { toMembershipStateChip, toNoStateMatchLine } from '@/lib/state-chips';
import type {
  FeeReductionBasis,
  PersonDetails,
  PersonFeeReduction,
  PersonGroup,
  PersonMembership,
  PersonPause,
  PersonRole,
  PersonSummary,
} from './schemas';

const PERSON_ID_PATTERN = /^[1-9]\d*$/;
const META_SEPARATOR = ' · ';
const PERSON_TITLE_FALLBACK = 'Person';

export const toPersonId = (raw: string): number | null =>
  PERSON_ID_PATTERN.test(raw) ? Number(raw) : null;

export const PERSONS_TITLE = 'Personenverwaltung';
export const PERSONS_INTRO =
  'Alle Personen im Register — auch ausgetretene und Leute ohne Vereinsbindung.';

export const MANAGE_PERSONS_SECTION_TITLE = 'Alle Personen';

export const PERSONS_STATS_NOTE =
  'Gezählt wird jede Person im Register — auch ohne Mitgliedschaft und ohne Gruppe.';

export const PERSON_SECTION_TITLES = {
  masterData: 'Stammdaten',
  memberships: 'Mitgliedschaft',
  feeReductions: 'Beitragsermäßigung',
  groups: 'Gruppen',
  roles: 'Rollen',
} as const;

export const GROUPS_POINTER =
  'Gruppen pflegen die Gruppen-Admins. Überschreiben geht in der Gruppenverwaltung.';
export const ROLES_POINTER = 'Rollen werden unter „Rollen & Rechte“ vergeben.';
export const VISIBILITY_POINTER = 'Nur die Person selbst ändert das — in ihrem Profil.';

const FEE_REDUCTION_BASIS_LABELS: Record<FeeReductionBasis, string> = {
  minor: 'Minderjährig',
  school: 'Schule',
  apprenticeship: 'Ausbildung',
  studies: 'Studium',
};

const FEE_REDUCTION_BASIS_ORDER: readonly FeeReductionBasis[] = [
  'minor',
  'school',
  'apprenticeship',
  'studies',
];

export const toFeeReductionBasisLabel = (basis: FeeReductionBasis): string =>
  FEE_REDUCTION_BASIS_LABELS[basis];

export const FEE_REDUCTION_BASIS_OPTIONS: readonly KkSelectOption[] = FEE_REDUCTION_BASIS_ORDER.map(
  (basis) => ({ value: basis, label: FEE_REDUCTION_BASIS_LABELS[basis] }),
);

export const toPersonName = (person: { firstName: string; lastName: string }): string =>
  `${person.firstName} ${person.lastName}`;

export const hasContactOnRecord = (person: PersonSummary): boolean =>
  formatAddress(person.street, person.zip, person.city) !== null ||
  person.email !== null ||
  person.phone !== null;

export const isContactWithheld = (person: PersonSummary): boolean =>
  !person.contactVisibleToMembers && hasContactOnRecord(person);

export interface PersonRowAffiliation {
  accent?: string;
  meta?: string;
}

export const toPersonRowAffiliation = (person: PersonSummary): PersonRowAffiliation => {
  const [firstRole, ...furtherRoles] = person.roles;
  const accent =
    firstRole === undefined
      ? undefined
      : furtherRoles.length === 0
        ? firstRole.name
        : `${firstRole.name} +${furtherRoles.length}`;
  const meta =
    person.groups.length === 0
      ? undefined
      : person.groups.map((group) => group.name).join(META_SEPARATOR);

  return { accent, meta };
};

export const NO_AFFILIATION_META = 'keine Gruppe, keine Rolle';

const ALL_FILTER_SUGGESTION = 'Wähle „Alle“, um wieder alle zu sehen.';

export const toPersonsEmptyDescription = (query: string, state: string): string => {
  const needle = query.trim();

  if (needle !== '') {
    return `Kein Name, keine Adresse und keine E-Mail passt zu „${needle}“. Vielleicht anders geschrieben?`;
  }

  const stateLine = toNoStateMatchLine(state);

  if (stateLine === null) {
    return 'Im Register steht gerade niemand.';
  }

  return `${stateLine} ${ALL_FILTER_SUGGESTION}`;
};

export const toRegisterSentence = (count: number): string => {
  if (count === 1) {
    return '1 Person steht im Register.';
  }

  return `${count} Personen stehen im Register.`;
};

export const toPersonsLead = (count: number): string =>
  `${toRegisterSentence(count)} ${PERSONS_INTRO}`;

export const PERSON_EYEBROW = 'Person';

export interface PersonHeadline {
  title: string;
  initials: string;
  state: StateChip | null;
}

export const toPersonHeadline = (person: PersonDetails | undefined): PersonHeadline => {
  if (person === undefined) {
    return { title: PERSON_TITLE_FALLBACK, initials: '', state: null };
  }

  return {
    title: toPersonName(person),
    initials: toInitials(person.firstName, person.lastName),
    state: toMembershipStateChip(person.membershipState),
  };
};

export interface SplitRelations<TRelation> {
  running: TRelation[];
  past: TRelation[];
}

export const splitPersonGroups = (groups: readonly PersonGroup[]): SplitRelations<PersonGroup> => ({
  running: groups.filter((group) => group.leftOn === null),
  past: groups.filter((group) => group.leftOn !== null),
});

export const splitPersonRoles = (roles: readonly PersonRole[]): SplitRelations<PersonRole> => ({
  running: roles.filter((role) => role.untilOn === null),
  past: roles.filter((role) => role.untilOn !== null),
});

export const MEMBERSHIP_ROW_TITLE = 'Mitgliedschaft';
export const PAUSE_ROW_TITLE = 'Ruhezeit';
export const SESSION_SPAN_LABEL = 'Session';

export const toMembershipSpan = (membership: PersonMembership): string =>
  formatPeriod(membership.startedOn, membership.endedOn);

export const toPauseSpan = (pause: PersonPause): string =>
  formatSessionSpan(pause.firstSessionYear, pause.lastSessionYear);

export const toFeeReductionSpan = (reduction: PersonFeeReduction): string =>
  formatSessionSpan(reduction.firstSessionYear, reduction.lastSessionYear);

export const ADD_MEMBERSHIP_ACTION_LABEL = 'Zeitraum anlegen';
export const ADD_PAUSE_ACTION_LABEL = 'Ruhezeit anlegen';
export const ADD_FEE_REDUCTION_ACTION_LABEL = 'Ermäßigung anlegen';

export const toMembershipEditActionLabel = (membership: PersonMembership): string =>
  `Zeitraum vom ${toMembershipSpan(membership)} ändern`;

export const toPauseEditActionLabel = (pause: PersonPause): string =>
  `Ruhezeit ${toPauseSpan(pause)} ändern`;

export const toFeeReductionEditActionLabel = (reduction: PersonFeeReduction): string =>
  `${toFeeReductionBasisLabel(reduction.basis)} ${toFeeReductionSpan(reduction)} ändern`;

export const toOpenPause = (membership: PersonMembership): PersonPause | null =>
  membership.pauses.find((pause) => pause.lastSessionYear === null) ?? null;

export const toMembershipQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const openingValue = toIsoDay(
    new Date(session.startYear, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY),
  );

  const choices: KkDateQuickChoice[] = [{ label: 'Heute', value: todayValue }];

  if (openingValue !== todayValue) {
    choices.push({ label: 'Sessionbeginn', value: openingValue });
  }

  return choices;
};

export const toMembershipEndQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const todayValue = toIsoDay(today);
  const session = sessionAt(today);
  const closingValue = toIsoDay(
    new Date(session.startYear + 1, SESSION_OPENING_MONTH - 1, SESSION_OPENING_DAY - 1),
  );

  const choices: KkDateQuickChoice[] = [{ label: 'Heute', value: todayValue }];

  if (closingValue !== todayValue) {
    choices.push({ label: 'Sessionende', value: closingValue });
  }

  return choices;
};

export const toMembershipConsequence = (
  startedOn: string,
  endedOn: string | null,
  todayIsoDay: string,
): string => {
  if (endedOn !== null) {
    return `Der Zeitraum steht vom ${formatIsoDay(startedOn)} bis zum ${formatIsoDay(endedOn)} im Register. Danach zählt die Person nicht mehr als Mitglied.`;
  }
  if (isFutureDay(startedOn, todayIsoDay)) {
    return `Die Mitgliedschaft beginnt am ${formatIsoDay(startedOn)}. Bis dahin gilt die Person als kein Mitglied.`;
  }

  return `Die Mitgliedschaft läuft seit dem ${formatIsoDay(startedOn)} und bleibt offen.`;
};

export const toPauseConsequence = (
  firstName: string,
  firstSessionYear: number,
  lastSessionYear: number | null,
): string => {
  if (lastSessionYear === null) {
    return `Ab Session ${formatSessionLabel(firstSessionYear)} zählt ${firstName} nicht als aktiv, bis die Ruhezeit ein Ende bekommt. Die Gruppen bleiben bestehen.`;
  }

  return `In ${formatSessionSpan(firstSessionYear, lastSessionYear)} zählt ${firstName} nicht als aktiv. Die Gruppen bleiben bestehen.`;
};

export const toFeeReductionConsequence = (
  basis: FeeReductionBasis,
  firstSessionYear: number,
  lastSessionYear: number,
): string =>
  `${toFeeReductionBasisLabel(basis)} steht für ${formatSessionSpan(firstSessionYear, lastSessionYear)} im Register. Danach läuft die Ermäßigung aus und der Nachweis wird neu gebraucht.`;

export const END_MEMBERSHIP_EYEBROW = 'Mitgliedschaft beenden';
export const END_MEMBERSHIP_CONFIRM_LABEL = 'Mitgliedschaft beenden';
export const OPEN_PAUSE_SENTENCE = 'Eine offene Ruhezeit endet mit der Mitgliedschaft.';

export const toEndMembershipQuestion = (firstName: string): string =>
  `Mitgliedschaft von ${firstName} beenden?`;

export const toEndMembershipExplanation = (firstName: string): string =>
  `Der Zeitraum wird am gewählten Tag geschlossen und bleibt im Register stehen. Gelöscht wird nichts: Gruppen, Rollen und alle bisherigen Angaben von ${firstName} bleiben bestehen.`;

export const toEndMembershipFacts = (
  membership: PersonMembership,
  personName: string,
  endedOn: string | null,
): KkConfirmFact[] => {
  const facts: KkConfirmFact[] = [
    { label: 'Person', value: personName },
    { label: 'Dieser Zeitraum seit', value: formatIsoDay(membership.startedOn) },
    {
      label: 'Dieser Zeitraum bis',
      value: membership.endedOn === null ? OPEN_END : formatIsoDay(membership.endedOn),
    },
    { label: 'Letzter Tag', value: endedOn === null ? 'noch offen' : formatIsoDay(endedOn) },
  ];
  const openPause = toOpenPause(membership);

  if (openPause !== null && endedOn !== null) {
    facts.push({
      label: 'Offene Ruhezeit',
      value: `endet mit ${formatSinceSession(endedOn)}`,
    });
  }

  return facts;
};

export const toEndMembershipConsequence = (
  firstName: string,
  endedOn: string,
  hasOpenPause: boolean,
): string => {
  const lead = `Ab dem ${formatIsoDay(endedOn)} zählt ${firstName} nicht mehr als Mitglied. Die Gruppen und Rollen bleiben bestehen.`;

  return hasOpenPause ? `${lead} ${OPEN_PAUSE_SENTENCE}` : lead;
};

export const toPersonCreatedMessage = (personName: string): string =>
  `${personName} steht jetzt im Register.`;

export const toPersonSavedMessage = (personName: string): string =>
  `Die Stammdaten von ${personName} sind gespeichert.`;

export const MEMBERSHIP_ADDED_MESSAGE = 'Der Zeitraum ist eingetragen.';
export const MEMBERSHIP_SAVED_MESSAGE = 'Der Zeitraum ist geändert.';
export const PAUSE_ADDED_MESSAGE = 'Die Ruhezeit ist eingetragen.';
export const PAUSE_SAVED_MESSAGE = 'Die Ruhezeit ist geändert.';
export const FEE_REDUCTION_ADDED_MESSAGE = 'Die Beitragsermäßigung ist eingetragen.';
export const FEE_REDUCTION_SAVED_MESSAGE = 'Die Beitragsermäßigung ist geändert.';

export const toMembershipEndedMessage = (endedOn: string, todayIsoDay: string): string =>
  isFutureDay(endedOn, todayIsoDay)
    ? `Die Mitgliedschaft endet am ${formatIsoDay(endedOn)}.`
    : 'Die Mitgliedschaft ist beendet.';
