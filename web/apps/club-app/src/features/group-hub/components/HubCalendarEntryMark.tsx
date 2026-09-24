import { KkChip, KkGroupToneChip } from '@furria/ui';
import type { FC } from 'react';
import type { CalendarEntryMark } from '../group-calendar-entries';

interface HubCalendarEntryMarkProps {
  mark: CalendarEntryMark;
}

export const HubCalendarEntryMark: FC<HubCalendarEntryMarkProps> = ({ mark }) => {
  if (mark === null) {
    return null;
  }
  if (mark.kind === 'running') {
    return (
      <KkChip tone="accent" size="small" dot live>
        {mark.label}
      </KkChip>
    );
  }
  if (mark.kind === 'guestOfClub') {
    return (
      <KkChip tone="gold" size="small">
        {mark.label}
      </KkChip>
    );
  }

  return <KkGroupToneChip tone={mark.tone}>{mark.label}</KkGroupToneChip>;
};
