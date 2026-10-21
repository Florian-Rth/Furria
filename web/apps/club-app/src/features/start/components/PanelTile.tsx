import type { FC } from 'react';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanel } from '../schemas';
import { AnnouncementsTile } from './AnnouncementsTile';
import { CalendarTile } from './CalendarTile';
import { GalleryTile } from './GalleryTile';
import { GroupsTile } from './GroupsTile';
import { MineTile } from './MineTile';
import { ToDosTile } from './ToDosTile';

interface TileOfProps {
  panel: StartPanel;
  board: StartBoard;
  order: number;
}

export const PanelTile: FC<TileOfProps> = ({ panel, board, order }) => {
  if (panel.kind === 'calendar') {
    return <CalendarTile panel={panel} board={board} order={order} />;
  }
  if (panel.kind === 'announcements') {
    return <AnnouncementsTile panel={panel} board={board} order={order} />;
  }
  if (panel.kind === 'mine') {
    return <MineTile panel={panel} board={board} order={order} />;
  }
  if (panel.kind === 'groups') {
    return <GroupsTile panel={panel} order={order} />;
  }
  if (panel.kind === 'gallery') {
    return <GalleryTile panel={panel} order={order} />;
  }

  return <ToDosTile panel={panel} order={order} />;
};
