import { KkMeta } from '@furria/ui/KkMeta';
import { KkStartTile } from '@furria/ui/KkStartTile';
import type { FC } from 'react';
import { useAnnouncementsTile } from '../hooks/use-announcements-tile';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';
import { AnnouncementAuthor } from './AnnouncementAuthor';

const TILE_LABEL = 'Aushänge';
const HEAD_LABEL = 'AUSHÄNGE';

interface AnnouncementsTileProps {
  panel: StartPanelOf<'announcements'>;
  board: StartBoard;
  order: number;
}

export const AnnouncementsTile: FC<AnnouncementsTileProps> = ({ panel, board, order }) => {
  const tile = useAnnouncementsTile(panel, board);
  const blocks = tile.blocks.map((block) => {
    const lines = block.lines.map((line) => (
      <KkStartTile.Line
        key={line.key}
        title={line.title}
        meta={line.stamp}
        lines={2}
        unread={line.unread}
        label={line.label}
        onClick={line.open}
      />
    ));

    return (
      <KkStartTile.Group key={block.key} head={<AnnouncementAuthor byline={block.byline} />}>
        {lines}
      </KkStartTile.Group>
    );
  });
  const further = tile.further === null ? null : <KkMeta>{tile.further}</KkMeta>;

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="campaign" label={HEAD_LABEL} reach={tile.reach} />
      {blocks}
      {further}
    </KkStartTile>
  );
};
