import type { KkScreenActionBar } from '@furria/ui';
import { useKkNotice } from '@furria/ui';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAlbumRestoration, useGalleryBinQuery, useItemRestoration } from '../api';
import type { BinGroup } from '../bin-countdown';
import { binGroupsOf } from '../bin-countdown';
import { countLabel } from '../gallery-view';
import type { BinnedItem, GalleryBin } from '../schemas';
import { toggleId } from '../selection-draft';

const ALBUM_RESTORED_MESSAGE = 'Album wiederhergestellt.';
const ITEMS_RESTORED_MESSAGE = 'Zurück in ihren Alben.';

export interface GalleryBinControl {
  bin: GalleryBin | undefined;
  error: Error | null;
  reload: () => void;
  now: Date;
  groups: BinGroup<BinnedItem>[];
  picked: ReadonlySet<number>;
  restoringAlbumId: number | null;
  rejection: string | null;
  toggle: (mediaItemId: number) => void;
  restoreAlbum: (albumId: number) => void;
  action: KkScreenActionBar | undefined;
}

const itemsLabel = (count: number): string =>
  `${countLabel(count)} ${count === 1 ? 'Bild' : 'Bilder'} wiederherstellen`;

export const useGalleryBin = (): GalleryBinControl => {
  const query = useGalleryBinQuery();
  const raiseNotice = useKkNotice();
  const [now] = useState(() => new Date());
  const [picked, setPicked] = useState<ReadonlySet<number>>(() => new Set());
  const [restoringAlbumId, setRestoringAlbumId] = useState<number | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const albumRestoration = useAlbumRestoration();
  const itemRestoration = useItemRestoration();

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const restoreItems = (): void => {
    setRejection(null);
    itemRestoration.mutate([...picked], {
      onSuccess: () => {
        setPicked(new Set());
        raiseNotice({ tone: 'success', message: ITEMS_RESTORED_MESSAGE });
      },
      onError: fail,
    });
  };

  const restoreAlbum = (albumId: number): void => {
    setRejection(null);
    setRestoringAlbumId(albumId);
    albumRestoration.mutate(albumId, {
      onSuccess: () => raiseNotice({ tone: 'success', message: ALBUM_RESTORED_MESSAGE }),
      onError: fail,
      onSettled: () => setRestoringAlbumId(null),
    });
  };

  const action: KkScreenActionBar | undefined =
    picked.size === 0
      ? undefined
      : {
          primary: {
            label: itemsLabel(picked.size),
            icon: 'undo',
            onSelect: restoreItems,
            loading: itemRestoration.isPending,
          },
        };

  return {
    bin: query.data,
    error: query.error,
    reload: () => {
      void query.refetch();
    },
    now,
    groups: binGroupsOf(query.data?.items ?? []),
    picked,
    restoringAlbumId,
    rejection,
    toggle: (mediaItemId) => setPicked((current) => toggleId(current, mediaItemId)),
    restoreAlbum,
    action,
  };
};
