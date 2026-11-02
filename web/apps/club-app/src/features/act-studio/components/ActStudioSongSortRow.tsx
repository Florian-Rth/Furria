import { useSortable } from '@dnd-kit/react/sortable';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';
import type { ActStudioSortableSongRow } from '../hooks/use-act-studio-songs';

interface ActStudioSongSortRowProps {
  song: ActStudioSortableSongRow;
  index: number;
}

export const ActStudioSongSortRow: FC<ActStudioSongSortRowProps> = ({ song, index }) => {
  const sortable = useSortable({ id: song.key, index });

  return (
    <KkStudioList.SortRow
      rowRef={sortable.ref}
      handleRef={sortable.handleRef}
      handleLabel={song.moveLabel}
      dragging={sortable.isDragging}
      lead={song.lead}
      title={song.title}
      meta={song.meta}
      badge={song.badge}
      badgeTone={song.badgeTone}
      selected={song.selected}
      label={song.label}
      onPress={song.press}
    />
  );
};
