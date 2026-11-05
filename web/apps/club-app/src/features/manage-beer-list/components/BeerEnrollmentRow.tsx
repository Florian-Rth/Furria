import { KkPourRosterRow } from '@furria/ui/KkPourRosterRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { useBeerHubContext } from '../beer-hub-context';
import { enrollmentSpanOf, fullNameOf } from '../beer-hub-copy';
import type { BeerEnrollment } from '../schemas';

interface BeerEnrollmentRowProps {
  enrollment: BeerEnrollment;
}

export const BeerEnrollmentRow: FC<BeerEnrollmentRowProps> = ({ enrollment }) => {
  const hub = useBeerHubContext();
  const initials = toInitials(enrollment.firstName, enrollment.lastName);
  const name = fullNameOf(enrollment);
  const state = enrollment.endedAt === null ? 'open' : 'paid';
  const facts = enrollmentSpanOf(enrollment);
  const selected = enrollment.personId === hub.selectedPersonId;
  const select = (): void => {
    hub.openPerson(enrollment.personId);
  };

  return (
    <KkPourRosterRow
      initials={initials}
      name={name}
      state={state}
      facts={facts}
      amount={null}
      count={null}
      selected={selected}
      onSelect={select}
    />
  );
};
