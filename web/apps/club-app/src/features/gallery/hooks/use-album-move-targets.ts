import { moveTargetMeta } from '../album-labels';
import { useGalleryHubQuery } from '../api';
import { toHubErrorMessage } from '../hub-copy';

export interface AlbumMoveTarget {
  albumId: number;
  title: string;
  meta: string;
}

export type AlbumMoveTargetsStatus = 'loading' | 'failed' | 'empty' | 'ready';

export interface AlbumMoveTargets {
  status: AlbumMoveTargetsStatus;
  targets: AlbumMoveTarget[];
  failure: string;
  retrying: boolean;
  retry: () => void;
}

export const useAlbumMoveTargets = (currentAlbumId: number): AlbumMoveTargets => {
  const hub = useGalleryHubQuery();
  const failure = toHubErrorMessage(hub.error);
  const targets = (hub.data?.sections.flatMap((section) => section.albums) ?? [])
    .filter((album) => album.albumId !== currentAlbumId)
    .map((album) => ({
      albumId: album.albumId,
      title: album.title,
      meta: moveTargetMeta(album.sessionStartYear, album.photos + album.videos),
    }));
  const loadStatus: AlbumMoveTargetsStatus = failure === null ? 'loading' : 'failed';
  const loadedStatus: AlbumMoveTargetsStatus = targets.length === 0 ? 'empty' : 'ready';

  return {
    status: hub.data === undefined ? loadStatus : loadedStatus,
    targets,
    failure: failure ?? '',
    retrying: hub.isFetching,
    retry: () => {
      void hub.refetch();
    },
  };
};
