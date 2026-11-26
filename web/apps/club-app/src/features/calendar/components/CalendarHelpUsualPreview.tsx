import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { FC } from 'react';
import { USUAL_PLAN_LABEL, USUAL_TITLE } from '../calendar-agenda-copy';

const PREVIEW_LABEL = 'Beispiel';
const SAMPLE_GROUP = 'Tanzgarde';
const SAMPLE_VENUE = 'Turnhalle';

interface CalendarHelpUsualPreviewProps {
  mayPlan: boolean;
}

export const CalendarHelpUsualPreview: FC<CalendarHelpUsualPreviewProps> = ({ mayPlan }) => {
  const actionLabel = mayPlan ? USUAL_PLAN_LABEL : undefined;

  return (
    <KkCalendarAgenda label={PREVIEW_LABEL}>
      <KkCalendarAgenda.Usual
        time="19:00"
        until="21:00"
        title={USUAL_TITLE}
        groupName={SAMPLE_GROUP}
        mark="club"
        venue={SAMPLE_VENUE}
        accessibleLabel={USUAL_TITLE}
        actionLabel={actionLabel}
      />
    </KkCalendarAgenda>
  );
};
