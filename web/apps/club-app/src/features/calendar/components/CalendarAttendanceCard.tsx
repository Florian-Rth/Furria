import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import type { FC } from 'react';
import {
  CALENDAR_ADD_ON_ICONS,
  CALENDAR_ADD_ON_LABELS,
  toHeldAnswerCount,
} from '../calendar-add-ons';
import { toAnswerCountLabel } from '../calendar-labels';
import type { CalendarEntry } from '../schemas';

const REMOVE_LABEL = 'Zu-/Absage entfernen';

interface CalendarAttendanceCardProps {
  entry: CalendarEntry | null;
  onRemove: () => void;
}

export const CalendarAttendanceCard: FC<CalendarAttendanceCardProps> = ({ entry, onRemove }) => {
  const answerCountLabel = toAnswerCountLabel(toHeldAnswerCount(entry));

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.attendance}
      title={CALENDAR_ADD_ON_LABELS.attendance}
      meta={answerCountLabel}
      removeLabel={REMOVE_LABEL}
      onRemove={onRemove}
    />
  );
};
