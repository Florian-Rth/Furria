import { useDraggable } from '@dnd-kit/react';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';
import type { ActStudioHolder } from '../hooks/use-act-studio-holders';

interface ActStudioHolderChipProps {
  holder: ActStudioHolder;
}

export const ActStudioHolderChip: FC<ActStudioHolderChipProps> = ({ holder }) => {
  const draggable = useDraggable({ id: holder.personId });

  return (
    <KkStudioList.Holder
      holderRef={draggable.ref}
      text={holder.text}
      label={holder.label}
      dragging={draggable.isDragging}
    />
  );
};
