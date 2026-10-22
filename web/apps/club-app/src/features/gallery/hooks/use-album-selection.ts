import { useKkNotice } from '@furria/ui/KkNotice';
import type { KkPublishStamp } from '@furria/ui/publish-stamp';
import type { KkPublishCeremonyRun } from '@furria/ui/use-publish-ceremony';
import { useKkPublishCeremony } from '@furria/ui/use-publish-ceremony';
import { useState } from 'react';
import { useSignerName } from '@/features/session/hooks/use-signer-name';
import { PUBLISHED_STAMP, websiteAddressOf } from '@/lib/publish-copy';
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
const WITHDRAWN_MESSAGE = 'Das Album ist von der Website genommen.';
const PUBLIC_GALLERY_PATH = '/gallery/';
const PUBLISHING: PublicationState = { kind: 'ready' };

export interface AlbumSelectionControl {
  draft: SelectionEntry[];
  isDirty: boolean;
  publication: PublicationState;
  hangKey: number;
  announcement: string;
  isSaving: boolean;
  isPublishing: boolean;
  ceremony: KkPublishCeremonyRun<AlbumDetails>;
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
  const signer = useSignerName();
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

  const stampOf = (published: AlbumDetails, stampedAt: string): KkPublishStamp => ({
    title: PUBLISHED_STAMP,
    signer,
    at: stampedAt,
    address: websiteAddressOf(`${PUBLIC_GALLERY_PATH}${published.albumId}`),
  });

  const ceremony = useKkPublishCeremony({
    stampOf,
    onPublished: () => {
      setHangKey((current) => current + 1);
    },
    onFailed: fail,
  });

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
    ceremony.start(() => publication.mutateAsync(album.albumId).then(() => album));
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
    publication: ceremony.isBusy ? PUBLISHING : publicationStateOf(album, draft, isDirty),
    hangKey,
    announcement,
    isSaving: selectionWrite.isPending,
    isPublishing: ceremony.isBusy || unpublication.isPending,
    ceremony,
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
