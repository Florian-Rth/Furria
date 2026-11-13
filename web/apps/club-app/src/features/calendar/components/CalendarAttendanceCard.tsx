import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import { toAnswerCountLabel } from '../calendar-labels';

const REMOVE_LABEL = 'Zu-/Absage entfernen';

interface CalendarAttendanceCardProps {
  answerCount: number;
  onRemove: () => void;
}

export const CalendarAttendanceCard: FC<CalendarAttendanceCardProps> = ({
  answerCount,
  onRemove,
}) => {
  const answerCountLabel = toAnswerCountLabel(answerCount);

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
