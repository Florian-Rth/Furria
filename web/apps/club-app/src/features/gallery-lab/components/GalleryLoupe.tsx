import type { KkLoupeLabels } from '@furria/ui';
import { KkLoupe } from '@furria/ui';
import type { FC } from 'react';
import { ORIGINAL_LABEL } from '../gallery-copy';
import type { GalleryScene } from '../gallery-scenes';
import { useGalleryLoupe } from '../hooks/use-gallery-loupe';
import type { LabItem } from '../lab-gallery-data';

const LOUPE_LABELS: KkLoupeLabels = {
  dialog: 'Bildansicht',
  close: 'Schließen',
  download: ORIGINAL_LABEL,
  previousScene: 'Vorige Szene',
  nextScene: 'Nächste Szene',
};

interface GalleryLoupeProps {
  albumTitle: string;
  items: readonly LabItem[];
  scenes: readonly GalleryScene<LabItem>[];
  shown: LabItem;
}

export const GalleryLoupe: FC<GalleryLoupeProps> = ({ albumTitle, items, scenes, shown }) => {
  const loupe = useGalleryLoupe(albumTitle, items, scenes, shown);

  return <KkLoupe {...loupe} labels={LOUPE_LABELS} />;
};
