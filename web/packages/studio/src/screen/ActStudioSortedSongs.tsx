import { DragDropProvider } from '@dnd-kit/react';
import { ActStudioSongSortRow } from '@furria/studio/ActStudioSongSortRow';
import type { ActStudioSongs } from '@furria/studio/use-act-studio-songs';
import type { FC } from 'react';

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
