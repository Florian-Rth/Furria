import { KkLoupe } from '@furria/ui';
import type { FC } from 'react';
import type { AlbumFrame } from '../album-frames';
import { LOUPE_LABELS } from '../album-labels';
import type { GalleryScene } from '../gallery-scenes';
import { useAlbumLoupe } from '../hooks/use-album-loupe';

interface AlbumLoupeProps {
  albumTitle: string;
  frames: readonly AlbumFrame[];
  scenes: readonly GalleryScene<AlbumFrame>[];
  shown: AlbumFrame;
  onShow: (id: number) => void;
  onClose: () => void;
}

export const AlbumLoupe: FC<AlbumLoupeProps> = (props) => {
  const loupe = useAlbumLoupe(props);

  return <KkLoupe {...loupe} labels={LOUPE_LABELS} />;
};
