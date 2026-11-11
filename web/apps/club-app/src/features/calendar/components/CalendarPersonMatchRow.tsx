import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import type { CalendarPersonName } from '../calendar-people';
import { toPersonName } from '../calendar-people';

interface CalendarPersonMatchRowProps {
  person: CalendarPersonName;
  onChoose: (personId: number) => void;
}

export const CalendarPersonMatchRow: FC<CalendarPersonMatchRowProps> = ({ person, onChoose }) => {
  const name = toPersonName(person);
  const initials = toInitials(person.firstName, person.lastName);

  const choose = (): void => {
    onChoose(person.personId);
  };

  return <KkPersonRow initials={initials} name={name} onClick={choose} />;
};
