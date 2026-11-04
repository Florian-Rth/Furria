import { KkPourRosterRow } from '@furria/ui/KkPourRosterRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { useBeerHubContext } from '../beer-hub-context';
import { shortDateOf } from '../beer-time';
import type { BeerEnrollment } from '../schemas';

interface BeerEnrollmentRowProps {
  enrollment: BeerEnrollment;
}

export const BeerEnrollmentRow: FC<BeerEnrollmentRowProps> = ({ enrollment }) => {
  const hub = useBeerHubContext();
  const initials = toInitials(enrollment.firstName, enrollment.lastName);
  const name = `${enrollment.firstName} ${enrollment.lastName}`;
  const running = enrollment.endedAt === null;
  const facts =
    enrollment.endedAt === null
      ? `seit ${shortDateOf(enrollment.startedAt)}`
      : `${shortDateOf(enrollment.startedAt)}–${shortDateOf(enrollment.endedAt)}`;
  const select = (): void => {
    hub.openPerson(enrollment.personId);
  };

  return (
    <KkPourRosterRow
      initials={initials}
      name={name}
      state={running ? 'open' : 'paid'}
      facts={facts}
      amount={null}
      count={null}
      selected={enrollment.personId === hub.selectedPersonId}
      onSelect={select}
    />
  );
};
