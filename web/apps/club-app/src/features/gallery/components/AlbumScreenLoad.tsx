import type { FC, ReactNode } from 'react';
import { GALLERY_ORIGIN } from '@/features/session';
import { isNotFoundError } from '@/lib/query-error';
import { toAlbumErrorMessage } from '../album-form-messages';
import { useAlbumQuery } from '../api';
import type { AlbumFilter } from '../requests';
import type { AlbumDetails } from '../schemas';
import { AlbumScreenFailure } from './AlbumScreenFailure';
import { AlbumScreenNotFound } from './AlbumScreenNotFound';
import { AlbumScreenSkeleton } from './AlbumScreenSkeleton';

const WHOLE_ALBUM: AlbumFilter = { kind: null, uploaderPersonId: null };

interface AlbumScreenLoadProps {
  albumId: number;
  title: string;
  children: (album: AlbumDetails) => ReactNode;
}

export const AlbumScreenLoad: FC<AlbumScreenLoadProps> = ({ albumId, title, children }) => {
  const album = useAlbumQuery(albumId, WHOLE_ALBUM);
  const errorMessage = toAlbumErrorMessage(album.error);

  const reload = (): void => {
    void album.refetch();
  };

  if (isNotFoundError(album.error)) {
    return <AlbumScreenNotFound />;
  }
  if (album.data !== undefined) {
    return children(album.data);
  }
  if (errorMessage !== null) {
    return (
      <AlbumScreenFailure
        title={title}
        origin={GALLERY_ORIGIN}
        message={errorMessage}
        onRetry={reload}
      />
    );
  }

  return <AlbumScreenSkeleton title={title} origin={GALLERY_ORIGIN} />;
};
