import { KkSelectRow } from '@furria/ui/KkSelectRow';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { CalendarEntryAddOn } from '../schemas';

interface CalendarAddOnOptionProps {
  addOn: CalendarEntryAddOn;
  onAttach: (addOn: CalendarEntryAddOn) => void;
}

export const CalendarAddOnOption: FC<CalendarAddOnOptionProps> = ({ addOn, onAttach }) => {
  const attach = (): void => {
    onAttach(addOn);
  };

  return <KkSelectRow title={CALENDAR_ADD_ON_LABELS[addOn]} onClick={attach} />;
};
