import { useParams } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { EDIT_ALBUM_TITLE } from '../gallery-copy';
import type { AlbumDetails } from '../schemas';
import { AlbumFormEditor } from './AlbumFormEditor';
import { AlbumScreenLoad } from './AlbumScreenLoad';
import { AlbumScreenNotFound } from './AlbumScreenNotFound';

const ROUTE_ID = '/_app/gallery_/$albumId_/edit';

const renderEditor = (album: AlbumDetails): ReactNode => (
  <AlbumFormEditor album={album} presetEntryId={null} />
);

export const AlbumEditScreen: FC = () => {
  const { albumId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(albumId);

  if (id === null) {
    return <AlbumScreenNotFound />;
  }

  return (
    <AlbumScreenLoad albumId={id} title={EDIT_ALBUM_TITLE}>
      {renderEditor}
    </AlbumScreenLoad>
  );
};
