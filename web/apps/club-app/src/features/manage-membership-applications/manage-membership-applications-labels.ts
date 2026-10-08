import type { KkConfirmFact, KkScreenOrigin } from '@furria/ui';
import { toIsoDay } from '@/lib/day';
import { formatAddress, formatIsoDay } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import type { MembershipApplicationDetails, MembershipApplicationSummary } from './schemas';

const MILLISECONDS_PER_DAY = 86_400_000;
const META_SEPARATOR = ' · ';

export const APPLICATIONS_TITLE = 'Beitrittsanträge';
export const APPLICATIONS_LEAD =
  'Bestätigte Anträge von der Website. Jeder bleibt hier, bis jemand ihn aufnimmt oder ablehnt.';
export const APPLICATIONS_PATH = '/manage/applications';
export const APPLICATIONS_ORIGIN: KkScreenOrigin = {
  label: APPLICATIONS_TITLE,
  to: APPLICATIONS_PATH,
};
export const APPLICATIONS_SECTION_TITLE = 'Offen';
export const APPLICATIONS_EMPTY = {
  title: 'KEINE OFFENEN ANTRÄGE',
  description: 'Gerade wartet niemand auf eine Entscheidung.',
};
export const APPLICATIONS_FOOTNOTE =
  'Ein Antrag erscheint hier erst, wenn er aus dem angegebenen Postfach bestätigt wurde – unbestätigte verfallen nach 48 Stunden. Entschiedene Anträge werden gelöscht.';

export const APPLICATION_EYEBROW = 'Beitrittsantrag';
export const APPLICANT_SECTION_TITLE = 'Angaben';
export const INTAKE_SECTION_TITLE = 'Eingang';
export const MINOR_CHIP: StateChip = { label: 'minderjährig', tone: 'gold', dot: true };
export const MINOR_NOTE =
  'Minderjährig: Vor der Aufnahme muss die Einwilligung der gesetzlichen Vertretung vorliegen. Hol sie beim ersten Kontakt ein.';
export const MISSING_PHONE = 'nicht angegeben';

export const APPLICATION_NOT_FOUND_TITLE = 'DIESEN ANTRAG GIBT ES NICHT MEHR';
export const APPLICATION_NOT_FOUND_DESCRIPTION =
  'Über ihn ist schon entschieden – oder er wurde nie bestätigt.';
export const APPLICATIONS_BACK_LABEL = 'Zu den Beitrittsanträgen';

export const DECLINE_LABEL = 'Antrag ablehnen';
export const DECLINE_EYEBROW = 'Antrag ablehnen';
export const DECLINE_EXPLANATION =
  'Der Antrag wird sofort gelöscht – so erledigst du auch Spam und zurückgezogene Anträge. Es geht keine Mail raus: Eine Absage überbringt ihr persönlich.';
export const ALREADY_DECIDED_MESSAGE = 'Über diesen Antrag hat inzwischen jemand entschieden.';

export const toApplicantName = (applicant: { firstName: string; lastName: string }): string =>
  `${applicant.firstName} ${applicant.lastName}`;

const APPLICATION_ROUTE = '/manage/applications/$membershipApplicationId';

export const toApplicationOrigin = (application: MembershipApplicationDetails): KkScreenOrigin => ({
  label: toApplicantName(application),
  to: APPLICATION_ROUTE,
  params: { membershipApplicationId: String(application.membershipApplicationId) },
});

export const toApplicationTitle = (details: MembershipApplicationDetails | undefined): string =>
  details === undefined ? APPLICATION_EYEBROW : toApplicantName(details);

const toDayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY;

export const waitingDaysOf = (confirmedAt: string, now: Date): number =>
  Math.max(0, toDayNumber(now) - toDayNumber(new Date(confirmedAt)));

export const toWaitingSince = (confirmedAt: string, now: Date): string => {
  const days = waitingDaysOf(confirmedAt, now);

  if (days === 0) {
    return 'seit heute';
  }
  if (days === 1) {
    return 'seit gestern';
  }

  return `seit ${days} Tagen`;
};

export const toOpenSinceLine = (confirmedAt: string, now: Date): string =>
  `Offen ${toWaitingSince(confirmedAt, now)}`;

const toAgeLabel = (age: number): string => `${age} Jahre`;

export const toApplicationRowMeta = (
  application: MembershipApplicationSummary,
  now: Date,
): string =>
  [
    toAgeLabel(application.age),
    application.city,
    toWaitingSince(application.confirmedAt, now),
  ].join(META_SEPARATOR);

export const toBirthDateLine = (details: MembershipApplicationDetails): string =>
  `${formatIsoDay(details.birthDate)}${META_SEPARATOR}${toAgeLabel(details.age)}`;

export const toApplicantAddress = (details: MembershipApplicationDetails): string =>
  formatAddress(details.street, details.zip, details.city) ?? details.city;

export const formatInstantDay = (at: string): string => formatIsoDay(toIsoDay(new Date(at)));

export const toDeclineQuestion = (details: MembershipApplicationDetails): string =>
  `Antrag von ${toApplicantName(details)} ablehnen?`;

export const toDeclineConsequence = (details: MembershipApplicationDetails): string =>
  `Alle Angaben von ${details.firstName} sind danach gelöscht und lassen sich nicht wiederherstellen.`;

export const toDeclineFacts = (details: MembershipApplicationDetails): KkConfirmFact[] => [
  { label: 'Name', value: toApplicantName(details) },
  { label: 'Geburtsdatum', value: toBirthDateLine(details) },
  { label: 'Wohnort', value: details.city },
  { label: 'Eingegangen', value: formatInstantDay(details.submittedAt) },
];

export const toDeclinedMessage = (applicantName: string): string =>
  `Antrag von ${applicantName} abgelehnt und gelöscht.`;
