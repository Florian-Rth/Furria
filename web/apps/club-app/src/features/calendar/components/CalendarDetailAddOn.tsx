import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import type { KkCalendarLineGroup } from '@furria/ui/KkCalendarAgendaLine';
import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import type { FC, ReactNode } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import type { CalendarDetailAnswer } from '../hooks/use-calendar-detail';
import type { CalendarAddOnKind, CalendarEntryAddOn } from '../schemas';
import { CalendarDetailPoll } from './CalendarDetailPoll';
import { CalendarGroupTags } from './CalendarGroupTags';

interface CalendarDetailAddOnProps {
  addOn: CalendarEntryAddOn;
  answer: CalendarDetailAnswer | null;
  participatingGroups: readonly KkCalendarLineGroup[];
  mayClosePolls: boolean;
}

export const CalendarDetailAddOn: FC<CalendarDetailAddOnProps> = ({
  addOn,
  answer,
  participatingGroups,
  mayClosePolls,
}) => {
  const choice =
    answer === null ? null : (
      <KkCalendarAgenda.Answer
        label={answer.label}
        value={answer.value}
        onChange={answer.choose}
        labels={ATTENDANCE_LABELS}
        error={answer.error}
        disabled={answer.disabled}
      />
    );
  const poll =
    addOn.kind === 'poll' ? (
      <CalendarDetailPoll poll={addOn.poll} mayClose={mayClosePolls} />
    ) : null;
  const contents: Record<CalendarAddOnKind, ReactNode> = {
    attendance: choice,
    participatingGroups: <CalendarGroupTags groups={participatingGroups} />,
    poll,
  };
  const content = contents[addOn.kind];

  return (
    <KkCalendarDetail.Section
      icon={CALENDAR_ADD_ON_ICONS[addOn.kind]}
      title={CALENDAR_ADD_ON_LABELS[addOn.kind]}
    >
      {content}
    </KkCalendarDetail.Section>
  );
};
