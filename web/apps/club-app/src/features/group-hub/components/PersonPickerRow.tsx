import { KkPersonRow } from '@furria/ui';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';

interface PersonPickerRowProps {
  person: PersonRef;
  onSelect: (person: PersonRef) => void;
}

export const PersonPickerRow: FC<PersonPickerRowProps> = ({ person, onSelect }) => {
  const name = `${person.firstName} ${person.lastName}`;

  const select = (): void => {
    onSelect(person);
  };

  return (
    <KkPersonRow
      initials={toInitials(person.firstName, person.lastName)}
      name={name}
      onClick={select}
    />
  );
};
