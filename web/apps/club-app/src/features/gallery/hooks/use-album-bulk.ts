import type { KkIconName } from '@furria/ui';
import { useKkNotice, useKkSheetCommands } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { selectionWith, selectionWithout } from '../album-frames';
import {
  ADD_TO_SELECTION_LABEL,
  binnedMessage,
  bulkCountLine,
  DELETE_LABEL,
  MOVE_LABEL,
  MOVE_SHEET_ID,
  movedMessage,
  OPEN_LABEL,
  REMOVE_FROM_SELECTION_LABEL,
  restoredMessage,
  selectionChangedMessage,
  UNDO_LABEL,
  WRITE_FAILED,
} from '../album-labels';
import {
  useFullAlbumFetch,
  useItemDeletion,
  useItemRestoration,
  usePlacement,
  useSelectionWrite,
} from '../api';
import { ALBUM_ROUTE } from '../gallery-copy';
import type { AlbumRights } from './use-album';

export interface AlbumBulkDeed {
  id: string;
  label: string;
  icon: KkIconName;
  tone: 'default' | 'danger';
  disabled: boolean;
  onSelect: () => void;
}

export interface AlbumBulk {
  count: string;
  busy: boolean;
  deeds: AlbumBulkDeed[];
  moveTo: (albumId: number, title: string) => void;
}

interface AlbumBulkInput {
  albumId: number;
  selectedIds: readonly number[];
  rights: AlbumRights;
  onDone: () => void;
}

export const useAlbumBulk = ({
  albumId,
  selectedIds,
  rights,
  onDone,
}: AlbumBulkInput): AlbumBulk => {
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();
  const sheet = useKkSheetCommands();
  const fetchFullAlbum = useFullAlbumFetch();
  const placement = usePlacement();
  const deletion = useItemDeletion();
  const restoration = useItemRestoration();
  const selectionWrite = useSelectionWrite();
  const ids = [...selectedIds];
  const none = ids.length === 0;
  const busy =
    placement.isPending || deletion.isPending || selectionWrite.isPending || restoration.isPending;

  const failed = (): void => {
    raiseNotice({ tone: 'error', message: WRITE_FAILED });
  };

  const restore = (restored: readonly number[]): void => {
    restoration.mutate(restored, {
      onSuccess: () => raiseNotice({ tone: 'success', message: restoredMessage(restored.length) }),
      onError: failed,
    });
  };

  const moveTo = (targetId: number, title: string): void => {
    sheet.close();
    placement.mutate(
      { albumId: targetId, mediaItemIds: ids },
      {
        onSuccess: () => {
          onDone();
          raiseNotice({
            tone: 'success',
            message: movedMessage(ids.length, title),
            actions: [
              {
                id: 'open',
                label: OPEN_LABEL,
                onSelect: () => {
                  void navigate({ to: ALBUM_ROUTE, params: { albumId: String(targetId) } });
                },
              },
            ],
          });
        },
        onError: failed,
      },
    );
  };

  const binSelected = (): void => {
    deletion.mutate(ids, {
      onSuccess: () => {
        onDone();
        raiseNotice({
          tone: 'success',
          icon: 'delete',
          message: binnedMessage(ids.length),
          actions: [{ id: 'undo', label: UNDO_LABEL, onSelect: () => restore(ids) }],
        });
      },
      onError: failed,
    });
  };

  const rewriteSelection = (adding: boolean): void => {
    const chosen = new Set(ids);
    void fetchFullAlbum(albumId)
      .then((album) => {
        const photos = adding
          ? selectionWith(album.items, chosen)
          : selectionWithout(album.items, chosen);
        selectionWrite.mutate(
          { albumId, photos },
          {
            onSuccess: () => {
              onDone();
              raiseNotice({ tone: 'success', message: selectionChangedMessage(photos.length) });
            },
            onError: failed,
          },
        );
      })
      .catch(failed);
  };

  const manageDeeds: AlbumBulkDeed[] = rights.managesItems
    ? [
        {
          id: 'move',
          label: MOVE_LABEL,
          icon: 'archive',
          tone: 'default',
          disabled: none || busy,
          onSelect: () => sheet.open(MOVE_SHEET_ID),
        },
        {
          id: 'delete',
          label: DELETE_LABEL,
          icon: 'delete',
          tone: 'danger',
          disabled: none || busy,
          onSelect: binSelected,
        },
      ]
    : [];
  const curateDeeds: AlbumBulkDeed[] = rights.curates
    ? [
        {
          id: 'select-in',
          label: ADD_TO_SELECTION_LABEL,
          icon: 'checkCircle',
          tone: 'default',
          disabled: none || busy,
          onSelect: () => rewriteSelection(true),
        },
        {
          id: 'select-out',
          label: REMOVE_FROM_SELECTION_LABEL,
          icon: 'close',
          tone: 'default',
          disabled: none || busy,
          onSelect: () => rewriteSelection(false),
        },
      ]
    : [];

  return {
    count: bulkCountLine(ids.length),
    busy,
    deeds: [...curateDeeds, ...manageDeeds],
    moveTo,
  };
};
