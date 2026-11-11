import { KkSelectRow } from '@furria/ui/KkSelectRow';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { CalendarAddOnKind } from '../schemas';

interface CalendarAddOnOptionProps {
  addOn: CalendarAddOnKind;
  onAttach: (addOn: CalendarAddOnKind) => void;
}

export const CalendarAddOnOption: FC<CalendarAddOnOptionProps> = ({ addOn, onAttach }) => {
  const attach = (): void => {
    onAttach(addOn);
  };

  return <KkSelectRow title={CALENDAR_ADD_ON_LABELS[addOn]} onClick={attach} />;
};
