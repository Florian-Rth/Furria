import { KkEyebrow } from '@furria/ui';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { buildAlbumMeta } from '@/features/gallery/gallery-content';

interface AlbumMetaProps {
  album: Album;
}

export const AlbumMeta: FC<AlbumMetaProps> = ({ album }) => (
  <KkEyebrow>{buildAlbumMeta(album)}</KkEyebrow>
);
