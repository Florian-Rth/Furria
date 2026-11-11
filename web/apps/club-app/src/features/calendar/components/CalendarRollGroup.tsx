import { KkAnswerRoll } from '@furria/ui/KkAnswerRoll';
import type { FC } from 'react';
import type { NamesTab } from '../calendar-names';
import { toNameLine } from '../calendar-names';

interface CalendarRollGroupProps {
  tab: NamesTab;
  showsNames: boolean;
  onOpen: (tabId: string) => void;
}

export const CalendarRollGroup: FC<CalendarRollGroupProps> = ({ tab, showsNames, onOpen }) => {
  const entries = tab.entries ?? [];
  const line = showsNames ? toNameLine(entries) : null;
  const open =
    entries.length === 0
      ? undefined
      : () => {
          onOpen(tab.id);
        };

  return (
    <KkAnswerRoll.Group
      tone={tab.tone ?? 'open'}
      label={tab.label}
      count={tab.count}
      names={line?.names}
      more={line?.more}
      onOpen={open}
    />
  );
};
