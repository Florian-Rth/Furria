import { DragDropProvider } from '@dnd-kit/react';
import type { FC } from 'react';
import type { ActStudioSongs } from '../hooks/use-act-studio-songs';
import { ActStudioSongSortRow } from './ActStudioSongSortRow';

interface ActStudioSortedSongsProps {
  songs: ActStudioSongs;
}

export const ActStudioSortedSongs: FC<ActStudioSortedSongsProps> = ({ songs }) => {
  const rows = songs.rows.map((song, index) => (
    <ActStudioSongSortRow key={song.key} song={song} index={index} />
  ));

  return (
    <DragDropProvider plugins={songs.dragPlugins} onDragEnd={songs.onDragEnd}>
      {rows}
    </DragDropProvider>
  );
};
