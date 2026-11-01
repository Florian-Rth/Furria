import { KkCoverThumb } from '@furria/ui/KkCoverThumb';
import { KkStartTile } from '@furria/ui/KkStartTile';
import type { FC } from 'react';
import { useNewsTile } from '../hooks/use-news-tile';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';

const TILE_LABEL = 'Aktuelles';
const HEAD_LABEL = 'AKTUELLES';
const THUMB_TONE = 'clay';
const TITLE_LINES = 2;

interface NewsTileProps {
  panel: StartPanelOf<'news'>;
  board: StartBoard;
  order: number;
}

export const NewsTile: FC<NewsTileProps> = ({ panel, board, order }) => {
  const tile = useNewsTile(panel, board.now);
  const image = tile.post?.image ?? null;
  const thumb =
    image === null ? undefined : <KkCoverThumb image={image} tone={THUMB_TONE} alt="" />;
  const line =
    tile.post === null ? null : (
      <KkStartTile.Line
        title={tile.post.title}
        meta={tile.post.meta}
        lines={TITLE_LINES}
        lead={thumb}
        reach={tile.post.reach}
      />
    );

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="news" label={HEAD_LABEL} reach={tile.reach} />
      {line}
    </KkStartTile>
  );
};
