import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import { AnnouncementsSheet } from './AnnouncementsSheet';
import { CalendarSheet } from './CalendarSheet';
import { EntrySheet } from './EntrySheet';
import { PanelLinesSheet } from './PanelLinesSheet';
import { RoleSheet } from './RoleSheet';
import { StartPanel } from './StartPanel';

interface StartPanelsProps {
  board: StartBoard;
}

export const StartPanels: FC<StartPanelsProps> = ({ board }) => {
  const panels = board.start.panels.map((panel) => (
    <StartPanel key={panel.kind} panel={panel} board={board} />
  ));

  return (
    <>
      <KkPanelStack density="dense">{panels}</KkPanelStack>
      <EntrySheet board={board} />
      <CalendarSheet board={board} />
      <AnnouncementsSheet board={board} />
      <RoleSheet variant="role" board={board} />
      <RoleSheet variant="office" board={board} />
      <PanelLinesSheet kind="mine" board={board} />
      <PanelLinesSheet kind="groups" board={board} />
    </>
  );
};
