import type { PersonRef } from '@/lib/api/schemas';
import { useBeerEnrollmentEndMutation } from '../api';
import type { BeerRosterRow } from '../beer-hub';
import { openCratesOf } from '../beer-hub';
import type { BeerEnrollment, BeerJournalCrate, BeerJournalPayment } from '../schemas';
import type { BeerHub, BeerOpenHub } from './use-beer-hub';

export interface PersonPane {
  person: PersonRef | null;
  row: BeerRosterRow | null;
  oldestOpen: readonly BeerJournalCrate[];
  taken: readonly BeerJournalCrate[];
  payments: readonly BeerJournalPayment[];
  enrollment: BeerEnrollment | null;
  ending: boolean;
  end: () => void;
}

const personOf = (
  personId: number,
  open: BeerOpenHub,
  enrollments: readonly BeerEnrollment[],
): PersonRef | null => {
  const rowPerson = open.roster.find((row) => row.person.personId === personId)?.person;
  const enrolled = enrollments.find((enrollment) => enrollment.personId === personId);

  if (rowPerson !== undefined) {
    return rowPerson;
  }

  return enrolled === undefined
    ? null
    : { personId, firstName: enrolled.firstName, lastName: enrolled.lastName };
};

export const usePersonPane = (hub: BeerHub, open: BeerOpenHub, personId: number): PersonPane => {
  const ending = useBeerEnrollmentEndMutation();
  const enrollment =
    hub.enrollments.findLast((candidate) => candidate.personId === personId) ?? null;

  return {
    person: personOf(personId, open, hub.enrollments),
    row: open.roster.find((row) => row.person.personId === personId) ?? null,
    oldestOpen: openCratesOf(open.crates, personId),
    taken: open.crates.filter(
      (crate) => crate.person?.personId === personId && crate.undoneAt === null,
    ),
    payments: open.payments.filter(
      (payment) => payment.person?.personId === personId && payment.undoneAt === null,
    ),
    enrollment,
    ending: ending.isPending,
    end: () => {
      if (enrollment !== null && enrollment.endedAt === null) {
        ending.mutate(enrollment.enrollmentId);
      }
    },
  };
};
