import type { Studio, StudioSong } from '@/features/acts/schemas';

const EXTENSION = /\.[a-z0-9]{2,4}$/i;

export const songNameOf = (song: StudioSong): string => song.fileName.replace(EXTENSION, '');

export const songsInOrder = (studio: Studio): StudioSong[] =>
  [...studio.songs].sort((left, right) => left.position - right.position);
