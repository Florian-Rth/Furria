import { useKkNotice } from '@furria/ui/KkNotice';
import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAlbumCreation, useGalleryHubQuery } from '../api';
import { toHubErrorMessage } from '../hub-copy';
import { NO_ALBUM } from '../inbox-copy';
import { defaultSlotsOf } from '../inbox-desk';
import type { GalleryHubAlbum } from '../schemas';

export const BASKET_COUNT = 3;
const EMPTY_VALUE = '';

export interface InboxBaskets {
  slots: readonly (number | null)[];
  albumOf: (slot: number) => GalleryHubAlbum | undefined;
  options: KkSelectOption[];
  valueOf: (slot: number) => string;
  setSlot: (slot: number, value: string) => void;
  newTitle: string;
  onNewTitle: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  creating: boolean;
  createAlbum: () => void;
  albumsFailure: string | null;
  albumsRetrying: boolean;
  retryAlbums: () => void;
}

const padded = (albumIds: readonly number[]): (number | null)[] =>
  Array.from({ length: BASKET_COUNT }, (_, slot) => albumIds[slot] ?? null);

const withAlbumIn = (slots: readonly (number | null)[], albumId: number): (number | null)[] => {
  const free = slots.indexOf(null);
  const slot = free < 0 ? BASKET_COUNT - 1 : free;
  return slots.map((current, index) => (index === slot ? albumId : current));
};

export const useInboxBaskets = (): InboxBaskets => {
  const hub = useGalleryHubQuery();
  const creation = useAlbumCreation();
  const raiseNotice = useKkNotice();
  const [slots, setSlots] = useState<(number | null)[] | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const albums = hub.data?.sections.flatMap((section) => section.albums) ?? [];

  if (slots === null && hub.data !== undefined) {
    setSlots(padded(defaultSlotsOf(albums, BASKET_COUNT)));
  }

  const shown = slots ?? padded([]);
  const albumOf = (slot: number): GalleryHubAlbum | undefined =>
    albums.find((album) => album.albumId === shown[slot]);

  const setSlot = (slot: number, value: string): void => {
    const albumId = value === EMPTY_VALUE ? null : Number(value);
    setSlots(shown.map((current, index) => (index === slot ? albumId : current)));
  };

  const createAlbum = (): void => {
    const title = newTitle.trim();
    if (title === '') {
      return;
    }
    creation.mutate(
      { title, description: null, calendarEntryId: null, sessionStartYear: null },
      {
        onSuccess: (created) => {
          setSlots((current) => withAlbumIn(current ?? padded([]), created.albumId));
          setNewTitle('');
        },
        onError: (error) => {
          const message = toWriteErrorMessage(error);
          if (message !== null) {
            raiseNotice({ tone: 'error', message });
          }
        },
      },
    );
  };

  return {
    slots: shown,
    albumOf,
    options: [
      { value: EMPTY_VALUE, label: NO_ALBUM },
      ...albums.map((album) => ({ value: String(album.albumId), label: album.title })),
    ],
    valueOf: (slot) => {
      const albumId = shown[slot];
      return albumId === null || albumId === undefined ? EMPTY_VALUE : String(albumId);
    },
    setSlot,
    newTitle,
    onNewTitle: (event) => setNewTitle(event.target.value),
    creating: creation.isPending,
    createAlbum,
    albumsFailure: hub.data === undefined ? toHubErrorMessage(hub.error) : null,
    albumsRetrying: hub.isFetching,
    retryAlbums: () => {
      void hub.refetch();
    },
  };
};
