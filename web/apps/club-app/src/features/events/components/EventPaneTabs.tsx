import { KkStepPane } from '@furria/ui/KkStepPane';
import type { FC } from 'react';
import type { BoardCell } from '../event-board';
import { STEPS_LABEL } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';
import { EventPaneTab } from './EventPaneTab';

interface EventPaneTabsProps {
  eventTitle: string;
  tabs: readonly BoardCell[];
  pane: EventPaneKey;
  onChoose: (pane: EventPaneKey) => void;
}

export const EventPaneTabs: FC<EventPaneTabsProps> = ({ eventTitle, tabs, pane, onChoose }) => {
  const shown = tabs.map((cell) => (
    <EventPaneTab
      key={cell.pane}
      eventTitle={eventTitle}
      cell={cell}
      selected={cell.pane === pane}
      onChoose={onChoose}
    />
  ));

  return <KkStepPane.Tabs label={STEPS_LABEL}>{shown}</KkStepPane.Tabs>;
};
