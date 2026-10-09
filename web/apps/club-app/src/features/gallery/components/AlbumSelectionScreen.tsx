import { useParams } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { SELECTION_TITLE } from '../gallery-copy';
import type { AlbumDetails } from '../schemas';
import { AlbumScreenLoad } from './AlbumScreenLoad';
import { AlbumScreenNotFound } from './AlbumScreenNotFound';
import { AlbumSelectionView } from './AlbumSelectionView';

const ROUTE_ID = '/_app/gallery_/$albumId_/selection';

const renderView = (album: AlbumDetails): ReactNode => <AlbumSelectionView album={album} />;

export const AlbumSelectionScreen: FC = () => {
  const { albumId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(albumId);

  if (id === null) {
    return <AlbumScreenNotFound />;
  }

  return (
    <AlbumScreenLoad albumId={id} title={SELECTION_TITLE}>
      {renderView}
    </AlbumScreenLoad>
  );
};
