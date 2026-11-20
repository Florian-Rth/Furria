import type { KkChipTone } from '@furria/ui/KkChip';
import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import type { KkDateQuickChoice } from '@furria/ui/KkDateField';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { PERSONS_ORIGIN } from '@/features/manage-persons/manage-persons-labels';
import { remainingLabelOf } from '@/features/upload-links/upload-link-copy';
import { remainingOf } from '@/features/upload-links/upload-link-view';
import { toIsoDay } from '@/lib/day';
import { groupInitialsOf, toInitials } from '@/lib/initials';
import { formatIsoDay } from '@/lib/membership-labels';
import type { QueryErrorKind } from '@/lib/query-error';
import { toQueryErrorMessage } from '@/lib/query-error';
import type { HistoryMoment } from './intake-history';
import type { IntakeHome, IntakeSectionId } from './intake-rules';
import { toGroupIntakes } from './intake-rules';
import type { IntakeCandidate, IntakeMatch, IntakeState, IntakeSummary } from './schemas';

export const INTAKES_TITLE = 'QR-Anmeldungen';
export const INTAKES_PATH = '/manage/persons/intakes';
export const INTAKE_ROUTE = '/manage/persons/intakes/$intakeId';
export const INTAKE_NEW_ROUTE = '/manage/persons/intakes/new';
export const INTAKE_EDIT_ROUTE = '/manage/persons/intakes/$intakeId/edit';
export const INTAKE_REVIEW_ROUTE = '/manage/persons/intakes/$intakeId/review';

export const INTAKE_EYEBROW = 'QR-Anmeldung';
export const NEW_INTAKE_LABEL = 'QR-Code erstellen';
export const NEW_INTAKE_ACTION_LABEL = 'Neue QR-Anmeldung erstellen';
export const START_BY_QR_LABEL = 'QR-Code erstellen';
export const EDIT_INTAKE_TITLE = 'QR-Anmeldung bearbeiten';
export const SAVE_LABEL = 'Speichern';
export const REVIEW_TITLE = 'QR-Anmeldung prüfen';
export const REVIEW_LABEL = 'Prüfen';
export const RESOLVE_LABEL = 'Übernehmen';
export const EDIT_LABEL = 'Bearbeiten';
export const SHARE_LABEL = 'Teilen';
export const COPY_LABEL = 'Link kopieren';
export const RENEW_LABEL = 'Neuer Link';
export const DISCARD_LABEL = 'Verwerfen';
export const CANCEL_LABEL = 'Abbrechen';
export const CLOSE_LABEL = 'Schließen';
export const RETRY_LABEL = 'Erneut laden';
export const LOADING_LABEL = 'Die QR-Anmeldungen werden geladen';
export const LIST_ERROR_TITLE = 'QR-ANMELDUNGEN NICHT GELADEN';
export const DETAIL_ERROR_TITLE = 'QR-ANMELDUNG NICHT GELADEN';
export const NOT_FOUND_TITLE = 'DIESE QR-ANMELDUNG GIBT ES NICHT';
export const NOT_FOUND_LINE = 'Sie wurde gelöscht oder du darfst sie nicht sehen.';
export const DENIED_MESSAGE =
  'QR-Anmeldungen erstellt nur, wer Personen verwaltet oder eine Gruppe leitet.';
export const SETTLED_TITLE = 'NICHT MEHR MÖGLICH';
export const SETTLED_LINE = 'Diese QR-Anmeldung ist schon weiter.';
export const GROUPS_FAILED_MESSAGE = 'Die Gruppen konnten nicht geladen werden.';
export const GROUPS_FAILED_TITLE = 'GRUPPEN NICHT GELADEN';
export const DETAIL_LOADING_LABEL = 'Die QR-Anmeldung wird geladen';

export const EMPTY_INTAKES = {
  title: 'Noch keine QR-Anmeldung',
  description: 'Leg einen an und zeig ihr den QR-Code.',
} as const;

export const SECTION_TITLES: Record<IntakeSectionId, string> = {
  needsReview: 'Zu prüfen',
  open: 'Offen',
  expired: 'Abgelaufen',
  settled: 'Erledigt',
};

export interface IntakeStateChip {
  label: string;
  tone: KkChipTone;
  dot: boolean;
}

export const STATE_CHIPS: Record<IntakeState, IntakeStateChip> = {
  open: { label: 'offen', tone: 'blue', dot: true },
  expired: { label: 'abgelaufen', tone: 'neutral', dot: false },
  needsReview: { label: 'zu prüfen', tone: 'gold', dot: true },
  completed: { label: 'abgeschlossen', tone: 'green', dot: false },
  discarded: { label: 'verworfen', tone: 'neutral', dot: false },
};

export const MEMBERSHIP_SECTION = 'Mitgliedschaft';
export const GROUPS_SECTION = 'Gruppen';
export const LABEL_SECTION = 'Für wen?';
export const IS_MEMBER_LABEL = 'Wird Mitglied';
export const IS_MEMBER_STATE = { on: 'ja', off: 'nein' } as const;
export const MEMBER_FROM_LABEL = 'Mitglied ab';
export const GROUPS_LABEL = 'Gruppen';
export const NO_GROUPS_TO_CHOOSE = 'Keine Gruppe zur Auswahl.';
export const LOCKED_GROUPS_NOTE = 'Gruppen, die du nicht leitest, bleiben, wie sie sind.';
export const LABEL_FIELD = 'Für wen?';
export const LABEL_PLACEHOLDER = 'z. B. Mia, neue Tänzerin';

export const DECISION_SECTION = 'Entscheidung';
export const LINK_SECTION = 'QR-Code';
export const HISTORY_SECTION = 'Verlauf';
export const MEMBER_FROM_FACT = 'Mitglied ab';
export const GROUPS_FACT = 'Gruppen';
export const LABEL_FACT = 'Für wen?';
export const STARTED_BY_FACT = 'Angelegt von';
export const HISTORY_LABELS: Record<HistoryMoment, string> = {
  created: 'Angelegt',
  expires: 'Link gültig bis',
  submitted: 'Eingereicht',
  completed: 'Abgeschlossen',
  discarded: 'Verworfen',
};
export const PERSON_FACT = 'Person';
export const NO_MEMBERSHIP = 'keine Mitgliedschaft';
export const NO_GROUPS = 'keine';
export const NO_LABEL = '–';
export const UNKNOWN_STARTER = 'unbekannt';
export const OPEN_PERSON_LABEL = 'Zur Person';

export const NEWCOMER_SECTION = 'Ihre Angaben';
export const CANDIDATES_SECTION = 'Steht sie schon im Register?';
export const CANDIDATE_CHOICE_LABEL = 'Person auswählen';
export const NEW_PERSON_LABEL = 'Neue Person';
export const BIRTH_DATE_FACT = 'Geburtsdatum';
export const ADDRESS_FACT = 'Adresse';
export const PHONE_FACT = 'Telefon';
export const EMAIL_FACT = 'E-Mail';
export const NOT_GIVEN = '–';
export const THIS_IS_HER_CHIP = { label: 'Das ist sie', tone: 'blue', dot: false } as const;

export const RENEW_EYEBROW = 'Neuer Link';
export const RENEW_QUESTION = 'Neuen Link erzeugen?';
export const RENEW_EXPLANATION = 'Der bisherige QR-Code und Link gelten dann nicht mehr.';
export const DISCARD_EYEBROW = 'QR-Anmeldung';
export const DISCARD_QUESTION = 'QR-Anmeldung verwerfen?';
export const DISCARD_EXPLANATION =
  'Der Link gilt dann nicht mehr. Was sie schon eingegeben hat, wird gelöscht.';

export const EDITED_NOTICE = 'QR-Anmeldung gespeichert.';
export const RENEWED_NOTICE = 'Neuer Link erzeugt.';
export const DISCARDED_NOTICE = 'QR-Anmeldung verworfen.';
export const COPIED_NOTICE = 'Link kopiert.';
export const COPY_FAILED_NOTICE = 'Der Link ließ sich nicht kopieren.';

const FALLBACK_NAME = 'QR-Anmeldung';
const SEPARATOR = ' · ';

const DAY_FORMAT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const MOMENT_FORMAT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const MATCH_LABELS: Record<IntakeMatch, string> = {
  email: 'gleiche E-Mail',
  nameAndBirthDate: 'gleicher Name und Geburtstag',
};

interface Named {
  firstName: string;
  lastName: string;
}

const nameOf = (person: Named): string => `${person.firstName} ${person.lastName}`;

export const formatInstant = (instant: string): string => MOMENT_FORMAT.format(new Date(instant));

export const formatInstantDay = (instant: string): string => DAY_FORMAT.format(new Date(instant));

export const toIntakeName = (intake: IntakeSummary): string => {
  if (intake.newcomer !== null) {
    return nameOf(intake.newcomer);
  }

  return intake.label ?? FALLBACK_NAME;
};

export const toMemberFromLine = (memberFrom: string | null): string =>
  memberFrom === null ? NO_MEMBERSHIP : formatIsoDay(memberFrom);

export const toGroupsLine = (intake: IntakeSummary): string =>
  intake.groups.length === 0 ? NO_GROUPS : intake.groups.map((group) => group.name).join(', ');

export const toStarterLine = (intake: IntakeSummary): string =>
  intake.startedBy === null ? UNKNOWN_STARTER : nameOf(intake.startedBy);

const toDecisionParts = (intake: IntakeSummary): string[] => [
  ...(intake.memberFrom === null ? [] : [`Mitglied ab ${formatIsoDay(intake.memberFrom)}`]),
  ...intake.groups.map((group) => group.name),
];

const toTimeLine = (intake: IntakeSummary, now: Date): string => {
  switch (intake.state) {
    case 'open':
      return remainingLabelOf(remainingOf(intake.expiresAt, now));
    case 'expired':
      return `abgelaufen ${formatInstantDay(intake.expiresAt)}`;
    case 'needsReview':
      return `eingereicht ${formatInstantDay(intake.submittedAt ?? intake.createdAt)}`;
    case 'completed':
      return `abgeschlossen ${formatInstantDay(intake.completedAt ?? intake.createdAt)}`;
    case 'discarded':
      return `verworfen ${formatInstantDay(intake.discardedAt ?? intake.createdAt)}`;
  }
};

const settledAtOf = (intake: IntakeSummary): string =>
  intake.completedAt ?? intake.discardedAt ?? intake.createdAt;

const toLabelParts = (intake: IntakeSummary): string[] =>
  intake.newcomer !== null && intake.label !== null ? [`für ${intake.label}`] : [];

export const toIntakeInitials = (intake: IntakeSummary): string =>
  intake.newcomer === null
    ? groupInitialsOf(toIntakeName(intake))
    : toInitials(intake.newcomer.firstName, intake.newcomer.lastName);

export const toIntakeRowMeta = (intake: IntakeSummary, now: Date): string =>
  [
    ...toLabelParts(intake),
    toIntakeHeaderMeta(intake, now),
    ...toDecisionParts(intake),
    ...(intake.startedBy === null ? [] : [`von ${nameOf(intake.startedBy)}`]),
  ].join(SEPARATOR);

export const toIntakeHeaderMeta = (intake: IntakeSummary, now: Date): string => {
  switch (intake.state) {
    case 'open':
    case 'needsReview':
      return toTimeLine(intake, now);
    case 'expired':
      return `am ${formatInstantDay(intake.expiresAt)}`;
    case 'completed':
    case 'discarded':
      return `am ${formatInstantDay(settledAtOf(intake))}`;
  }
};

export const toAwaitingIntakesLine = (awaitingCount: number): string | undefined =>
  awaitingCount === 0 ? undefined : `${awaitingCount} offen`;

export const toNeedsReviewHint = (needsReviewCount: number): string | undefined =>
  needsReviewCount === 0 ? undefined : `${needsReviewCount} zu prüfen`;

export const toMemberFromQuickChoices = (today: Date): KkDateQuickChoice[] => [
  { label: 'Heute', value: toIsoDay(today) },
  {
    label: 'Nächster Monatserster',
    value: toIsoDay(new Date(today.getFullYear(), today.getMonth() + 1, 1)),
  },
];

export const toStartedNotice = (label: string | null): string =>
  label === null ? 'QR-Code erstellt.' : `QR-Code für ${label} erstellt.`;

export const toResolvedNotice = (newcomerName: string, isExistingPerson: boolean): string =>
  isExistingPerson ? `${newcomerName} ist zugeordnet.` : `${newcomerName} ist jetzt im Register.`;

export const SHARE_TEXT = 'Trag dich hier selbst ein:';

export const toIntakeOrigin = (intake: IntakeSummary): KkScreenOrigin => ({
  label: toIntakeName(intake),
  to: INTAKE_ROUTE,
  params: { intakeId: String(intake.intakeId) },
});

export const toHomeOrigin = (home: IntakeHome): KkScreenOrigin =>
  home.kind === 'overview'
    ? PERSONS_ORIGIN
    : { label: home.name, to: '/groups/$groupId', params: { groupId: String(home.groupId) } };

export const toHomePath = (home: IntakeHome): string =>
  home.kind === 'overview' ? PERSONS_ORIGIN.to : `/groups/${home.groupId}`;

export const toQrLabel = (intake: IntakeSummary): string => `QR-Code für ${toIntakeName(intake)}`;

export const toExpiryLine = (expiresAt: string, now: Date): string =>
  `Gültig bis ${formatInstant(expiresAt)} (${remainingLabelOf(remainingOf(expiresAt, now))})`;

export const toIntakeFacts = (intake: IntakeSummary): KkConfirmFact[] => [
  { label: LABEL_FACT, value: intake.label ?? NO_LABEL },
  { label: MEMBER_FROM_FACT, value: toMemberFromLine(intake.memberFrom) },
  { label: GROUPS_FACT, value: toGroupsLine(intake) },
];

export const toAddressLine = (
  street: string | null,
  zip: string | null,
  city: string | null,
): string => {
  const place = [zip, city].filter((part) => part !== null && part !== '').join(' ');
  const parts = [street ?? '', place].filter((part) => part !== '');

  return parts.length === 0 ? NOT_GIVEN : parts.join(', ');
};

export const toCandidateDescription = (candidate: IntakeCandidate): string =>
  [
    MATCH_LABELS[candidate.match],
    ...(candidate.birthDate === null ? [] : [`geb. ${formatIsoDay(candidate.birthDate)}`]),
    ...(candidate.isMember === true ? ['Mitglied'] : []),
    ...(candidate.groups ?? []),
    ...(candidate.hasAccount === true ? ['hat die App'] : []),
  ].join(SEPARATOR);

export const toNewPersonDescription = (firstName: string): string =>
  `${firstName} wird neu ins Register eingetragen.`;

export const toResolveConsequence = (firstName: string, isExistingPerson: boolean): string =>
  isExistingPerson
    ? `Leere Felder werden mit ${firstName}s Angaben gefüllt, fehlende Mitgliedschaft und Gruppen kommen dazu.`
    : `${firstName} kommt als neue Person ins Register.`;

const LIST_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die QR-Anmeldungen konnten nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

const DETAIL_ERROR_MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'Keine Verbindung zum Server. Prüfe deine Internetverbindung.',
  unexpected: 'Die QR-Anmeldung konnte nicht geladen werden.',
  rejected: 'Der Server hat die Anfrage abgelehnt.',
};

export const toIntakesErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, LIST_ERROR_MESSAGES);

export const toIntakeErrorMessage = (error: Error | null): string | null =>
  toQueryErrorMessage(error, DETAIL_ERROR_MESSAGES);

export interface GroupIntakeRow {
  intakeId: number;
  name: string;
  meta: string;
  chip: IntakeStateChip;
  path: string;
}

export const toGroupIntakeRows = (
  intakes: readonly IntakeSummary[],
  groupId: number,
  now: Date,
): GroupIntakeRow[] =>
  toGroupIntakes(intakes, groupId).map((intake) => ({
    intakeId: intake.intakeId,
    name: toIntakeName(intake),
    meta: toIntakeHeaderMeta(intake, now),
    chip: STATE_CHIPS[intake.state],
    path: `${INTAKES_PATH}/${intake.intakeId}`,
  }));
