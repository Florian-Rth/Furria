import { KkSelectionChip } from '@furria/ui/KkSelectionChip';
import type { FC } from 'react';
import type { CalendarPersonName } from '../calendar-people';
import { toPersonName } from '../calendar-people';

const toRemoveLabel = (name: string): string => `${name} entfernen`;

interface CalendarChosenPersonChipProps {
  person: CalendarPersonName;
  onRemove: (personId: number) => void;
}

export const CalendarChosenPersonChip: FC<CalendarChosenPersonChipProps> = ({
  person,
  onRemove,
}) => {
  const name = toPersonName(person);
  const removeLabel = toRemoveLabel(name);

  const remove = (): void => {
    onRemove(person.personId);
  };

  return <KkSelectionChip text={name} clearLabel={removeLabel} onClear={remove} />;
};
