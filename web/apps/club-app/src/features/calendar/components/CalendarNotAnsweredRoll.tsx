import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import type { NamesTab } from '../calendar-names';
import { CalendarRollGroup } from './CalendarRollGroup';

interface CalendarNotAnsweredRollProps {
  label: string;
  openTab: NamesTab | null;
  unassignedTab?: NamesTab | null;
  onOpen: (tabId: string) => void;
}

export const CalendarNotAnsweredRoll: FC<CalendarNotAnsweredRollProps> = ({
  label,
  openTab,
  unassignedTab = null,
  onOpen,
}) => {
  if (openTab === null && unassignedTab === null) {
    return null;
  }

  const openGroup =
    openTab === null ? null : (
      <CalendarRollGroup tab={openTab} showsNames={false} onOpen={onOpen} />
    );
  const unassignedGroup =
    unassignedTab === null ? null : (
      <CalendarRollGroup tab={unassignedTab} showsNames onOpen={onOpen} />
    );

  return (
    <KkAnswerRoll label={label}>
      {openGroup}
      {unassignedGroup}
    </KkAnswerRoll>
  );
};
