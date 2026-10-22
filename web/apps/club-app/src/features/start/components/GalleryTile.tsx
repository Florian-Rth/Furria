import { KkStartTile } from '@furria/ui/KkStartTile';
import type { FC } from 'react';
import { useGalleryTile } from '../hooks/use-gallery-tile';
import type { StartPanelOf } from '../start-board';

const TILE_LABEL = 'Neu in der Galerie';
const HEAD_LABEL = 'GALERIE';

interface GalleryTileProps {
  panel: StartPanelOf<'gallery'>;
  order: number;
}

export const GalleryTile: FC<GalleryTileProps> = ({ panel, order }) => {
  const tile = useGalleryTile(panel);
  const caption =
    tile.title === null ? null : (
      <KkStartTile.Line title={tile.title} meta={tile.meta ?? undefined} />
    );

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="gallery" label={HEAD_LABEL} reach={tile.reach} />
      <KkStartTile.Covers covers={tile.covers} />
      {caption}
    </KkStartTile>
  );
};
