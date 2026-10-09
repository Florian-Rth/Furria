import { KkAlbumShelf, KkDensePanel } from '@furria/ui';
import type { FC } from 'react';
import { useGalleryPanel } from '../hooks/use-gallery-panel';
import type { StartPanelOf } from '../start-board';
import { START_GALLERY_FOOT, START_GALLERY_LABEL } from '../start-labels';

const HEAD_ID = 'start-gallery-head';

interface GalleryPanelProps {
  panel: StartPanelOf<'gallery'>;
}

export const GalleryPanel: FC<GalleryPanelProps> = ({ panel }) => {
  const { albums, openGallery } = useGalleryPanel(panel);

  return (
    <KkDensePanel material="own" labelledBy={HEAD_ID}>
      <KkDensePanel.Head id={HEAD_ID} label={START_GALLERY_LABEL} />
      <KkAlbumShelf albums={albums} sx={{ px: 1.5, pb: 0.5 }} />
      <KkDensePanel.Foot label={START_GALLERY_FOOT} onClick={openGallery} />
    </KkDensePanel>
  );
};
