import type { KkDateQuickChoice } from '@furria/ui';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH, sessionAt } from '@/lib/club';
import { isFutureDay, toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import { toAgeOn, toInvitedAddress } from './admission';
import type {
  AdmissionCandidate,
  AdmissionInvitation,
  MembershipApplicationDetails,
  RegistryGap,
} from './schemas';

const META_SEPARATOR = ' · ';
const LIST_SEPARATOR = ', ';

const REGISTRY_GAP_LABELS: Record<RegistryGap, string> = {
  birthDate: 'Geburtsdatum',
  email: 'E-Mail-Adresse',
  phone: 'Telefon',
  address: 'Anschrift',
};

export const ADMIT_LABEL = 'Aufnehmen';
export const ADMISSION_ACTION_LABEL = 'Mitglied aufnehmen';
export const CANDIDATES_SECTION_TITLE = 'Im Register';
export const CANDIDATES_LEAD =
  'Diese Personen teilen ihre E-Mail-Adresse oder Name und Geburtsdatum. Entscheide, wer sie ist – zugeordnet wird nichts von allein.';
export const CANDIDATE_CHOICE_LABEL = 'Wer ist sie im Register?';
export const NEW_PERSON_LABEL = 'Neue Person';
export const THIS_IS_HER_CHIP: StateChip = { label: 'Das ist sie', tone: 'green', dot: true };
export const ALREADY_MEMBER_LABEL = 'ist bereits Mitglied';
export const ADMITTED_ON_LABEL = 'Aufnahmedatum';
export const GUARDIAN_CONSENT_LABEL = 'Einwilligung der gesetzlichen Vertretung liegt vor';

export const toNewPersonDescription = (firstName: string): string =>
  `${firstName} wird neu im Register angelegt.`;

export const toNoCandidatesNote = (firstName: string): string =>
  `Niemand im Register teilt ihre E-Mail-Adresse oder Name und Geburtsdatum – ${firstName} wird als neue Person angelegt.`;

export const toAdmittedOnHint = (appliedOn: string): string =>
  `Ab diesem Tag ist sie Mitglied. Frühestens der Tag ihres Antrags (${formatIsoDay(appliedOn)}), auch ein Tag in der Zukunft geht.`;

export const toGuardianConsentDescription = (
  application: MembershipApplicationDetails,
  admittedOn: string,
): string =>
  `${application.firstName} ist am ${formatIsoDay(admittedOn)} erst ${toAgeOn(application.birthDate, admittedOn)}. Hol die Einwilligung beim ersten Kontakt ein – deine Bestätigung wird mit deinem Namen gespeichert.`;

const toTies = (candidate: AdmissionCandidate): string[] => {
  const groups =
    candidate.groups.length === 0 ? [] : [`in ${candidate.groups.join(LIST_SEPARATOR)}`];

  return [...groups, ...candidate.roles];
};

export type CandidateStandingKind = 'member' | 'tied' | 'unaffiliated';

const toFormerMembership = (candidate: AdmissionCandidate): string[] =>
  candidate.membershipState === 'ended' ? ['Mitglied beendet'] : [];

const toStandingParts = (candidate: AdmissionCandidate): string[] => [
  ...toFormerMembership(candidate),
  ...toTies(candidate),
];

export const candidateStandingKindOf = (candidate: AdmissionCandidate): CandidateStandingKind => {
  if (candidate.isMember) {
    return 'member';
  }

  return toStandingParts(candidate).length === 0 ? 'unaffiliated' : 'tied';
};

export const toCandidateStanding = (candidate: AdmissionCandidate): string => {
  const kind = candidateStandingKindOf(candidate);

  if (kind === 'member') {
    return ALREADY_MEMBER_LABEL;
  }
  if (kind === 'unaffiliated') {
    return 'kein Verein';
  }

  return toStandingParts(candidate).join(META_SEPARATOR);
};

export const toCandidateDescription = (candidate: AdmissionCandidate): string => {
  const birthDate =
    candidate.birthDate === null ? [] : [`geb. ${formatIsoDay(candidate.birthDate)}`];
  const contact = [candidate.email, candidate.city].filter(
    (value): value is string => value !== null && value !== '',
  );

  return [...birthDate, ...contact, toCandidateStanding(candidate)].join(META_SEPARATOR);
};

export const toGapNote = (candidate: AdmissionCandidate): string =>
  candidate.gaps.length === 0
    ? 'Der Antrag ergänzt nichts – alles steht schon im Register.'
    : `Aus dem Antrag ergänzt: ${candidate.gaps.map((gap) => REGISTRY_GAP_LABELS[gap]).join(LIST_SEPARATOR)}. Alles andere bleibt, wie es im Register steht.`;

export const toAdmissionQuickChoices = (today: Date): KkDateQuickChoice[] => {
  const nextOpening = new Date(
    sessionAt(today).startYear + 1,
    SESSION_OPENING_MONTH - 1,
    SESSION_OPENING_DAY,
  );

  return [
    { label: 'Heute', value: toIsoDay(today) },
    { label: 'Sessionbeginn', value: toIsoDay(nextOpening) },
  ];
};

export interface AdmissionConsequenceInput {
  application: MembershipApplicationDetails;
  candidate: AdmissionCandidate | null;
  admittedOn: string;
  today: string;
  invitation: AdmissionInvitation;
}

export type AdmittedRecord =
  | { kind: 'new' }
  | { kind: 'existing' }
  | { kind: 'continuing'; memberSince: string };

export interface AdmissionMembershipShape {
  startsLater: boolean;
  record: AdmittedRecord;
}

const toAdmittedRecord = (candidate: AdmissionCandidate | null): AdmittedRecord => {
  if (candidate === null) {
    return { kind: 'new' };
  }
  if (candidate.memberSince === null) {
    return { kind: 'existing' };
  }

  return { kind: 'continuing', memberSince: candidate.memberSince };
};

export const admissionMembershipShapeOf = ({
  candidate,
  admittedOn,
  today,
}: AdmissionConsequenceInput): AdmissionMembershipShape => ({
  startsLater: isFutureDay(admittedOn, today),
  record: toAdmittedRecord(candidate),
});

const toMembershipSentence = (input: AdmissionConsequenceInput): string => {
  const { firstName } = input.application;
  const { startsLater, record } = admissionMembershipShapeOf(input);
  const day = formatIsoDay(input.admittedOn);
  const starts = startsLater ? `wird am ${day} Mitglied` : `ist ab dem ${day} Mitglied`;

  if (record.kind === 'new') {
    return `${firstName} wird neu angelegt und ${starts}.`;
  }
  if (record.kind === 'existing') {
    return `${firstName} ${starts}.`;
  }

  return `${firstName} ${starts}, Mitglied seit ${formatIsoDay(record.memberSince)} bleibt.`;
};

const toInvitationSentence = ({
  application,
  candidate,
  admittedOn,
  invitation,
}: AdmissionConsequenceInput): string => {
  if (invitation === 'sent') {
    return `Die Einladung zur App geht gleich an ${toInvitedAddress(application, candidate)}.`;
  }
  if (invitation === 'alreadyHasAccount') {
    return 'Einen Zugang zur App hat sie schon.';
  }
  if (invitation === 'notYetAffiliated') {
    return `Einladen kannst du sie ab dem ${formatIsoDay(admittedOn)}.`;
  }

  return `Eine Einladung zur App gibt es erst ab ${application.ageOfConsent}.`;
};

export const toAdmissionConsequence = (input: AdmissionConsequenceInput): string =>
  `${toMembershipSentence(input)} ${toInvitationSentence(input)} Der Antrag wird danach gelöscht.`;

export const toAdmittedMessage = (
  applicantName: string,
  invitation: AdmissionInvitation,
): string =>
  invitation === 'sent'
    ? `${applicantName} ist aufgenommen – die Einladung zur App ist unterwegs.`
    : `${applicantName} ist aufgenommen.`;

export const toCandidatesContext = (application: MembershipApplicationDetails): string => {
  const count = application.candidates.length;

  if (count === 0) {
    return `Niemand im Register passt zu ${application.firstName}.`;
  }
  if (count === 1) {
    return `1 Person im Register passt zu ${application.firstName}.`;
  }

  return `${count} Personen im Register passen zu ${application.firstName}.`;
};
