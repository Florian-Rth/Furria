import { useSortable } from '@dnd-kit/react/sortable';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { SongRowView } from '../hooks/use-lists-playground';
import { MOVE_SONG } from '../studio-lab-copy';

interface SongSortRowProps {
  song: SongRowView;
  index: number;
}

export const SongSortRow: FC<SongSortRowProps> = ({ song, index }) => {
  const sortable = useSortable({ id: song.songId, index });

  return (
    <KkTouchLab.Row
      rowRef={sortable.ref}
      handleRef={sortable.handleRef}
      position={index + 1}
      label={song.label}
      detail={song.detail}
      handleLabel={MOVE_SONG}
      dragging={sortable.isDragging}
    />
  );
};
