import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import type { NamesTab } from '../calendar-names';
import { CalendarRollGroup } from './CalendarRollGroup';

interface CalendarNotAnsweredRollProps {
  label: string;
  openTab: NamesTab | null;
  onOpen: (tabId: string) => void;
}

export const CalendarNotAnsweredRoll: FC<CalendarNotAnsweredRollProps> = ({
  label,
  openTab,
  onOpen,
}) => {
  if (openTab === null) {
    return null;
  }

  return (
    <KkAnswerRoll label={label}>
      <CalendarRollGroup tab={openTab} showsNames={false} onOpen={onOpen} />
    </KkAnswerRoll>
  );
};
