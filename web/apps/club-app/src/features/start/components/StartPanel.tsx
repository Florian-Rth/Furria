import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanel as StartPanelData } from '../schemas';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { CalendarPanel } from './CalendarPanel';
import { GroupsPanel } from './GroupsPanel';
import { MinePanel } from './MinePanel';
import { ToDosPanel } from './ToDosPanel';

interface StartPanelProps {
  panel: StartPanelData;
  board: StartBoard;
}

export const StartPanel: FC<StartPanelProps> = ({ panel, board }) => {
  if (panel.kind === 'calendar') {
    return <CalendarPanel panel={panel} board={board} />;
  }
  if (panel.kind === 'announcements') {
    return <AnnouncementsPanel panel={panel} board={board} />;
  }
  if (panel.kind === 'mine') {
    return <MinePanel panel={panel} board={board} />;
  }
  if (panel.kind === 'groups') {
    return <GroupsPanel panel={panel} board={board} />;
  }

  return <ToDosPanel panel={panel} board={board} />;
};
