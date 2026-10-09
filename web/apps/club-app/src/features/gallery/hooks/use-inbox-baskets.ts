import type { KkSelectOption } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useAlbumCreation, useGalleryHubQuery } from '../api';
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
  };
};
