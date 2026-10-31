import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { FC } from 'react';
import { toUsualView } from '../calendar-agenda-view';
import type { UsualTraining } from '../schemas';

interface CalendarUsualProps {
  usual: UsualTraining;
  mayPlan: boolean;
  onPlan: (usual: UsualTraining) => void;
}

export const CalendarUsual: FC<CalendarUsualProps> = ({ usual, mayPlan, onPlan }) => {
  const view = toUsualView(usual, mayPlan);
  const plan = (): void => {
    onPlan(usual);
  };
  const select = mayPlan ? plan : undefined;

  return (
    <KkCalendarAgenda.Usual
      time={view.time}
      until={view.until}
      title={view.title}
      groupName={view.groupName}
      mark={view.mark}
      venue={view.venue}
      accessibleLabel={view.spoken}
      actionLabel={view.actionLabel}
      onSelect={select}
    />
  );
};
