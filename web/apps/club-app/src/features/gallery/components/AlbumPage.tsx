import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { AlbumMissingScreen } from './AlbumMissingScreen';
import { AlbumScreen } from './AlbumScreen';

const ALBUM_ROUTE_ID = '/_app/gallery_/$albumId';

export const AlbumPage: FC = () => {
  const { albumId } = useParams({ from: ALBUM_ROUTE_ID });
  const id = parsePositiveId(albumId);

  if (id === null) {
    return <AlbumMissingScreen />;
  }

  return <AlbumScreen key={id} albumId={id} />;
};
