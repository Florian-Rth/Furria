import { useKkNotice } from '@furria/ui';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { usePublication, useSelectionWrite, useUnpublication } from '../api';
import type { AlbumDetails } from '../schemas';
import type { PublicationState, SelectionEntry } from '../selection-draft';
import {
  addEntries,
  captionEntry,
  isSelectionDirty,
  moveEntry,
  publicationStateOf,
  removeEntry,
  selectionDraftOf,
  toSelectionPhotos,
} from '../selection-draft';

const SAVED_MESSAGE = 'Auswahl gespeichert.';
const PUBLISHED_MESSAGE = 'Das Album steht jetzt auf der Website.';
const WITHDRAWN_MESSAGE = 'Das Album ist von der Website genommen.';

export interface AlbumSelectionControl {
  draft: SelectionEntry[];
  isDirty: boolean;
  publication: PublicationState;
  hangKey: number;
  announcement: string;
  isSaving: boolean;
  isPublishing: boolean;
  rejection: string | null;
  move: (from: number, to: number) => void;
  remove: (pieceId: string) => void;
  caption: (pieceId: string, text: string) => void;
  add: (mediaItemIds: readonly number[]) => void;
  save: () => void;
  publish: () => void;
  withdraw: () => void;
}

export const useAlbumSelection = (album: AlbumDetails): AlbumSelectionControl => {
  const raiseNotice = useKkNotice();
  const saved = selectionDraftOf(album.items);
  const [edited, setEdited] = useState<SelectionEntry[] | null>(null);
  const [hangKey, setHangKey] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [rejection, setRejection] = useState<string | null>(null);
  const selectionWrite = useSelectionWrite();
  const publication = usePublication();
  const unpublication = useUnpublication();

  const draft = edited ?? saved;
  const isDirty = edited !== null && isSelectionDirty(edited, saved);

  const edit = (change: (current: SelectionEntry[]) => SelectionEntry[]): void => {
    setRejection(null);
    setEdited(change(draft));
  };

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const save = (): void => {
    setRejection(null);
    selectionWrite.mutate(
      { albumId: album.albumId, photos: toSelectionPhotos(draft) },
      {
        onSuccess: () => {
          setEdited(null);
          raiseNotice({ tone: 'success', message: SAVED_MESSAGE });
        },
        onError: fail,
      },
    );
  };

  const publish = (): void => {
    setRejection(null);
    publication.mutate(album.albumId, {
      onSuccess: () => {
        setHangKey((current) => current + 1);
        raiseNotice({ tone: 'success', message: PUBLISHED_MESSAGE });
      },
      onError: fail,
    });
  };

  const withdraw = (): void => {
    setRejection(null);
    unpublication.mutate(album.albumId, {
      onSuccess: () => {
        raiseNotice({ tone: 'success', message: WITHDRAWN_MESSAGE });
      },
      onError: fail,
    });
  };

  return {
    draft,
    isDirty,
    publication: publicationStateOf(album, draft, isDirty),
    hangKey,
    announcement,
    isSaving: selectionWrite.isPending,
    isPublishing: publication.isPending || unpublication.isPending,
    rejection,
    move: (from, to) => {
      const target = Math.min(Math.max(to, 0), draft.length - 1);
      setAnnouncement(`Foto jetzt an Position ${target + 1} von ${draft.length}`);
      edit((current) => moveEntry(current, from, target));
    },
    remove: (pieceId) => edit((current) => removeEntry(current, Number(pieceId))),
    caption: (pieceId, text) => edit((current) => captionEntry(current, Number(pieceId), text)),
    add: (mediaItemIds) => edit((current) => addEntries(current, mediaItemIds)),
    save,
    publish,
    withdraw,
  };
};
