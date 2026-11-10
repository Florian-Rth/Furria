import type { FC } from 'react';
import type { CalendarParticipantPool } from '../calendar-authoring';
import type { CalendarAddOnsControl } from '../hooks/use-calendar-add-ons';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { CalendarAddOnCardForm, CalendarEntry } from '../schemas';
import { CalendarAttendanceCard } from './CalendarAttendanceCard';
import { CalendarParticipatingGroupsCard } from './CalendarParticipatingGroupsCard';
import { CalendarPollCard } from './CalendarPollCard';

interface CalendarAddOnCardProps {
  card: CalendarAddOnCardForm;
  index: number;
  addOns: CalendarAddOnsControl;
  control: CalendarEntryEditorControl;
  entry: CalendarEntry | null;
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload | null;
}

export const CalendarAddOnCard: FC<CalendarAddOnCardProps> = ({
  card,
  index,
  addOns,
  control,
  entry,
  clubGroups,
  clubGroupsReload,
}) => {
  const remove = (): void => {
    addOns.askRemoval(card);
  };

  switch (card.kind) {
    case 'attendance':
      return <CalendarAttendanceCard entry={entry} onRemove={remove} />;
    case 'participatingGroups':
      return (
        <CalendarParticipatingGroupsCard
          control={control}
          entry={entry}
          clubGroups={clubGroups}
          clubGroupsReload={clubGroupsReload}
          onRemove={remove}
        />
      );
    case 'poll':
      return (
        <CalendarPollCard
          cardKey={card.key}
          index={index}
          poll={card.poll}
          control={control}
          entry={entry}
          onRemove={remove}
        />
      );
  }
};
