import type { KkDateQuickChoice, KkScreenOrigin, KkSelectOption } from '@furria/ui';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { toInitials } from '@/lib/initials';
import {
  formatAddress,
  formatIsoDay,
  formatPeriod,
  formatSessionLabel,
  formatSessionSpan,
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

export const toEntryId = (raw: string): number | null =>
  PERSON_ID_PATTERN.test(raw) ? Number(raw) : null;

export const PERSONS_TITLE = 'Personenverwaltung';

export const PERSONS_STATS_NOTE =
  'Gezählt werden alle Personen, auch ohne Mitgliedschaft oder Gruppe.';

export const PERSON_DIRECTORY_TITLE = 'Register';
export const ADD_PERSON_LABEL = 'Person';
export const ADD_PERSON_ACTION_LABEL = 'Person hinzufügen';

export const PERSON_SECTION_TITLES = {
  masterData: 'Stammdaten',
  memberships: 'Mitgliedschaft',
  feeReductions: 'Beitragsermäßigung',
  groups: 'Gruppen',
  roles: 'Rollen',
} as const;

export const GROUPS_POINTER =
  'Gruppen werden von den Gruppen-Admins oder der Gruppenverwaltung gepflegt.';
export const ROLES_POINTER = 'Rollen werden unter „Rollen & Rechte“ vergeben.';

export const VISIBILITY_DESCRIPTION =
  'Nur auf Wunsch der Person setzen. Mit eigenem Konto entscheidet sie selbst in „Mein Profil“.';

export const PERSONS_ORIGIN: KkScreenOrigin = {
  label: 'Personenverwaltung',
  to: '/manage/persons',
};

export const EDITOR_DENIED_MESSAGE = 'Dir fehlt die Berechtigung für die Personenverwaltung.';

export const toPersonOrigin = (person: {
  personId: number;
  firstName: string;
  lastName: string;
}): KkScreenOrigin => ({
  label: toPersonName(person),
  to: '/manage/persons/$personId',
  params: { personId: String(person.personId) },
});

export const toMembershipOrigin = (
  person: { personId: number },
  membership: PersonMembership,
): KkScreenOrigin => ({
  label: `Zeitraum ${toMembershipSpan(membership)}`,
  to: '/manage/persons/$personId/memberships/$membershipId',
  params: { personId: String(person.personId), membershipId: String(membership.membershipId) },
});

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

export const LETTER_INDEX_LABEL = 'Zu einem Buchstaben springen';

const ALL_FILTER_SUGGESTION = 'Wähle „Alle“, um alle anzuzeigen.';

export const toPersonsEmptyDescription = (query: string, state: string): string => {
  const needle = query.trim();

  if (needle !== '') {
    return `Keine Person passt zu „${needle}“.`;
  }

  const stateLine = toNoStateMatchLine(state);

  if (stateLine === null) {
    return 'Im Register steht gerade niemand.';
  }

  return `${stateLine} ${ALL_FILTER_SUGGESTION}`;
};

export const PERSONS_LEAD = 'Stammdaten, Mitgliedschaften und Beitragsermäßigungen aller Personen.';
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

export const ADD_MEMBERSHIP_ACTION_LABEL = 'Zeitraum eintragen';
export const ADD_PAUSE_ACTION_LABEL = 'Ruhezeit eintragen';
export const ADD_FEE_REDUCTION_ACTION_LABEL = 'Ermäßigung eintragen';

export const MEMBERSHIP_CHANGE_LABEL = 'Zeitraum ändern';
export const MEMBERSHIP_END_LABEL = 'Mitgliedschaft beenden';
export const PAUSE_CHANGE_LABEL = 'Ruhezeit ändern';
export const FEE_REDUCTION_CHANGE_LABEL = 'Ermäßigung ändern';

export const MEMBERSHIP_CHAIN_TITLE = 'Bisherige Zeiträume';
export const MEMBERSHIP_PAUSES_TITLE = 'Ruhezeiten in diesem Zeitraum';
export const NO_PAUSES_NOTE = 'Für diesen Zeitraum ist noch keine Ruhezeit eingetragen.';
export const PAUSE_CHAIN_TITLE = 'Andere Ruhezeiten in diesem Zeitraum';
export const FEE_REDUCTION_CHAIN_TITLE = 'Andere Beitragsermäßigungen';

export const toContainingMembershipNote = (span: string): string =>
  `Diese Ruhezeit gehört zum Zeitraum ${span}.`;

export interface EntryChainRow {
  key: string;
  span: string;
  isEdited: boolean;
}

export const toMembershipChainRows = (
  person: PersonDetails,
  editedMembershipId: number | null,
): EntryChainRow[] =>
  person.memberships.map((membership) => ({
    key: String(membership.membershipId),
    span: toMembershipSpan(membership),
    isEdited: membership.membershipId === editedMembershipId,
  }));

export const toPauseChainRows = (
  membership: PersonMembership,
  editedPauseId: number | null,
): EntryChainRow[] =>
  membership.pauses.map((pause) => ({
    key: String(pause.pauseId),
    span: toPauseSpan(pause),
    isEdited: pause.pauseId === editedPauseId,
  }));

export const toFeeReductionChainRows = (
  person: PersonDetails,
  editedFeeReductionId: number | null,
): EntryChainRow[] =>
  person.feeReductions.map((reduction) => ({
    key: String(reduction.feeReductionId),
    span: `${toFeeReductionBasisLabel(reduction.basis)} · ${toFeeReductionSpan(reduction)}`,
    isEdited: reduction.feeReductionId === editedFeeReductionId,
  }));

export interface MembershipPauseLookup {
  membership: PersonMembership;
  pause: PersonPause;
}

export const findMembershipOfPause = (
  person: PersonDetails,
  pauseId: number,
): MembershipPauseLookup | null => {
  for (const membership of person.memberships) {
    const pause = membership.pauses.find((candidate) => candidate.pauseId === pauseId);

    if (pause !== undefined) {
      return { membership, pause };
    }
  }

  return null;
};

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
    return `Die Mitgliedschaft gilt vom ${formatIsoDay(startedOn)} bis zum ${formatIsoDay(endedOn)}.`;
  }
  if (isFutureDay(startedOn, todayIsoDay)) {
    return `Die Mitgliedschaft beginnt am ${formatIsoDay(startedOn)}.`;
  }

  return `Die Mitgliedschaft besteht seit dem ${formatIsoDay(startedOn)} und ist unbefristet.`;
};

export const toPauseConsequence = (
  firstName: string,
  firstSessionYear: number,
  lastSessionYear: number | null,
): string => {
  if (lastSessionYear === null) {
    return `${firstName} gilt ab Session ${formatSessionLabel(firstSessionYear)} bis auf Weiteres als nicht aktiv. Gruppenzugehörigkeiten bleiben bestehen.`;
  }

  return `${firstName} gilt in ${formatSessionSpan(firstSessionYear, lastSessionYear)} als nicht aktiv. Gruppenzugehörigkeiten bleiben bestehen.`;
};

export const toFeeReductionConsequence = (
  basis: FeeReductionBasis,
  firstSessionYear: number,
  lastSessionYear: number,
): string =>
  `${toFeeReductionBasisLabel(basis)} gilt für ${formatSessionSpan(firstSessionYear, lastSessionYear)}. Danach ist ein neuer Nachweis nötig.`;

export const OPEN_PAUSE_SENTENCE = 'Eine offene Ruhezeit endet mit der Mitgliedschaft.';

export const toEndMembershipConsequence = (
  firstName: string,
  endedOn: string,
  hasOpenPause: boolean,
): string => {
  const lead = `Ab dem ${formatIsoDay(endedOn)} ist ${firstName} kein Mitglied mehr. Gruppen und Rollen bleiben bestehen.`;

  return hasOpenPause ? `${lead} ${OPEN_PAUSE_SENTENCE}` : lead;
};

export const toPersonCreatedMessage = (personName: string): string => `${personName} ist angelegt.`;

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
