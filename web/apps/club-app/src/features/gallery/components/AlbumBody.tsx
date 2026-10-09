import type { FC } from 'react';
import type { AlbumScreen } from '../hooks/use-album';
import { AlbumFailed } from './AlbumFailed';
import { AlbumMissing } from './AlbumMissing';
import { AlbumSkeleton } from './AlbumSkeleton';
import { AlbumView } from './AlbumView';

interface AlbumBodyProps {
  albumId: number;
  screen: AlbumScreen;
}

export const AlbumBody: FC<AlbumBodyProps> = ({ albumId, screen }) => {
  if (screen.album !== undefined) {
    return <AlbumView albumId={albumId} album={screen.album} screen={screen} />;
  }
  if (screen.status === 'missing') {
    return <AlbumMissing />;
  }
  if (screen.status === 'failed') {
    return <AlbumFailed onRetry={screen.retry} />;
  }

  return <AlbumSkeleton />;
};
