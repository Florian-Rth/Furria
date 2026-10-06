import { isFutureDay } from '@/lib/day';
import type {
  AdmissionCandidate,
  AdmissionForm,
  AdmissionInvitation,
  MembershipApplicationDetails,
} from './schemas';

export const NEW_PERSON_CHOICE = 'new';

const AGE_OF_MAJORITY = 18;

interface CalendarDay {
  year: number;
  month: number;
  day: number;
}

export interface AdmissionRequest {
  personId: number | null;
  admittedOn: string;
  guardianConsentConfirmed: boolean;
}

export interface InvitationForecastInput {
  application: MembershipApplicationDetails;
  candidate: AdmissionCandidate | null;
  admittedOn: string;
  today: string;
}

const toCalendarDay = (isoDay: string): CalendarDay => ({
  year: Number(isoDay.slice(0, 4)),
  month: Number(isoDay.slice(5, 7)),
  day: Number(isoDay.slice(8, 10)),
});

const toDaysInMonth = (year: number, month: number): number => new Date(year, month, 0).getDate();

export const toAgeOn = (birthDate: string, isoDay: string): number => {
  const born = toCalendarDay(birthDate);
  const on = toCalendarDay(isoDay);
  const birthdayThisYear = Math.min(born.day, toDaysInMonth(on.year, born.month));
  const hadBirthday =
    on.month > born.month || (on.month === born.month && on.day >= birthdayThisYear);

  return on.year - born.year - (hadBirthday ? 0 : 1);
};

export const needsGuardianConsent = (birthDate: string, admittedOn: string): boolean =>
  toAgeOn(birthDate, admittedOn) < AGE_OF_MAJORITY;

export const isBeforeApplication = (admittedOn: string, appliedOn: string): boolean =>
  admittedOn < appliedOn;

export const toCandidateChoice = (candidate: AdmissionCandidate): string =>
  String(candidate.personId);

export const toInitialChoice = (candidates: readonly AdmissionCandidate[]): string | null =>
  candidates.length === 0 ? NEW_PERSON_CHOICE : null;

export const findChosenCandidate = (
  choice: string | null,
  candidates: readonly AdmissionCandidate[],
): AdmissionCandidate | null =>
  candidates.find((candidate) => toCandidateChoice(candidate) === choice) ?? null;

const toAdmittedPersonId = (choice: string): number | null =>
  choice === NEW_PERSON_CHOICE ? null : Number(choice);

export const toAdmissionRequest = (form: AdmissionForm): AdmissionRequest | null =>
  form.choice === null
    ? null
    : {
        personId: toAdmittedPersonId(form.choice),
        admittedOn: form.admittedOn,
        guardianConsentConfirmed: form.guardianConsentConfirmed,
      };

export const toInvitationForecast = ({
  application,
  candidate,
  admittedOn,
  today,
}: InvitationForecastInput): AdmissionInvitation => {
  if (candidate?.hasAccount === true) {
    return 'alreadyHasAccount';
  }

  const isAffiliatedToday = candidate?.isAffiliated === true || !isFutureDay(admittedOn, today);
  if (!isAffiliatedToday) {
    return 'notYetAffiliated';
  }

  const birthDate = candidate?.birthDate ?? application.birthDate;
  if (toAgeOn(birthDate, today) < application.ageOfConsent) {
    return 'belowAgeOfConsent';
  }

  return 'sent';
};

export const toInvitedAddress = (
  application: MembershipApplicationDetails,
  candidate: AdmissionCandidate | null,
): string => {
  const recorded = candidate?.email ?? '';

  return recorded.trim() === '' ? application.email : recorded;
};
