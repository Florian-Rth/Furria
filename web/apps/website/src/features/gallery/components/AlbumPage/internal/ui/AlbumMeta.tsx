import { KkEyebrow } from '@furria/ui';
import type { FC } from 'react';
import { buildAlbumMeta } from '@/features/gallery/gallery-content';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';

interface AlbumMetaProps {
  album: AlbumDetail;
}

export const AlbumMeta: FC<AlbumMetaProps> = ({ album }) => {
  const meta = buildAlbumMeta(album);

  return <KkEyebrow>{meta}</KkEyebrow>;
};
