import type { FC } from 'react';
import type { CalendarParticipantPool } from '../calendar-authoring';
import type { CalendarAddOnsControl } from '../hooks/use-calendar-add-ons';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { CalendarEntryAddOn, ParticipatingGroup } from '../schemas';
import { CalendarAttendanceCard } from './CalendarAttendanceCard';
import { CalendarParticipatingGroupsCard } from './CalendarParticipatingGroupsCard';

interface CalendarAddOnCardProps {
  addOn: CalendarEntryAddOn;
  addOns: CalendarAddOnsControl;
  control: CalendarEntryEditorControl;
  answerCount: number;
  heldGroups: readonly ParticipatingGroup[];
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload | null;
}

export const CalendarAddOnCard: FC<CalendarAddOnCardProps> = ({
  addOn,
  addOns,
  control,
  answerCount,
  heldGroups,
  clubGroups,
  clubGroupsReload,
}) => {
  const remove = (): void => {
    addOns.askRemoval(addOn);
  };

  switch (addOn) {
    case 'attendance':
      return <CalendarAttendanceCard answerCount={answerCount} onRemove={remove} />;
    case 'participatingGroups':
      return (
        <CalendarParticipatingGroupsCard
          control={control}
          held={heldGroups}
          clubGroups={clubGroups}
          clubGroupsReload={clubGroupsReload}
          onRemove={remove}
        />
      );
  }
};
