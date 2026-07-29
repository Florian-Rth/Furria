import { KkEyebrow } from '@furria/ui';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { buildAlbumCreditLabel } from '@/features/gallery/gallery-content';

interface AlbumCreditProps {
  album: Album;
}

export const AlbumCredit: FC<AlbumCreditProps> = ({ album }) => {
  const creditLabel = buildAlbumCreditLabel(album);

  return <KkEyebrow tone="muted">{creditLabel}</KkEyebrow>;
};
