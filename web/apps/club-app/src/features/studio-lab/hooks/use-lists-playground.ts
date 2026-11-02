import type { DragEndEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { formatReadoutTime } from '@furria/studio/drag-readout';
import { useState } from 'react';
import type { Studio } from '@/features/acts/schemas';
import type { SpotHolding } from '../list-order';
import { reordered, withHolderMoved } from '../list-order';
import { spotLabelOf } from '../studio-lab-copy';

export interface SongRowView {
  songId: number;
  label: string;
  detail: string;
}

export interface HolderView {
  personId: number;
  name: string;
}

export interface SpotSlotView {
  spotId: number;
  label: string;
  holder: HolderView | null;
}

export interface ListsPlayground {
  songs: readonly SongRowView[];
  spots: readonly SpotSlotView[];
  pool: readonly HolderView[];
  onSongDragEnd: (event: DragEndEvent) => void;
  onSpotDragEnd: (event: DragEndEvent) => void;
}

export const POOL_ID = 'pool';
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

export const useListsPlayground = (studio: Studio): ListsPlayground => {
  const [songIds, setSongIds] = useState<readonly number[]>(() =>
    [...studio.songs]
      .sort((left, right) => left.position - right.position)
      .map((song) => song.songId),
  );
  const [holdings, setHoldings] = useState<readonly SpotHolding[]>(() =>
    [...studio.spots]
      .sort((left, right) => left.number - right.number)
      .map((spot) => ({
        spotId: spot.spotId,
        number: spot.number,
        personId: spot.person?.personId ?? null,
      })),
  );
  const people = studio.spots.flatMap((spot) =>
    spot.person === null
      ? []
      : [
          {
            personId: spot.person.personId,
            name: `${spot.person.firstName} ${spot.person.lastName.charAt(0)}.`,
          },
        ],
  );
  const personOf = (personId: number | null): HolderView | null =>
    people.find((person) => person.personId === personId) ?? null;
  const held = new Set(holdings.map((holding) => holding.personId));

  return {
    songs: songIds.flatMap((songId) => {
      const song = studio.songs.find((candidate) => candidate.songId === songId);

      return song === undefined
        ? []
        : [
            {
              songId,
              label: song.fileName.replace(FILE_EXTENSION, ''),
              detail: formatReadoutTime(song.endSeconds - song.startSeconds),
            },
          ];
    }),
    spots: holdings.map((holding) => {
      return {
        spotId: holding.spotId,
        label: spotLabelOf(holding.number),
        holder: personOf(holding.personId),
      };
    }),
    pool: people.filter((person) => !held.has(person.personId)),
    onSongDragEnd: (event) => {
      const source = event.operation.source;
      if (event.canceled || !isSortable(source)) {
        return;
      }
      setSongIds((current) => reordered(current, source.initialIndex, source.index));
    },
    onSpotDragEnd: (event) => {
      const personId = event.operation.source?.id;
      const target = event.operation.target?.id;
      if (event.canceled || typeof personId !== 'number' || target === undefined) {
        return;
      }
      setHoldings((current) =>
        withHolderMoved(current, personId, typeof target === 'number' ? target : null),
      );
    },
  };
};
