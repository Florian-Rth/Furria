import { useDraggable } from '@dnd-kit/react';
import type { ActStudioHolder } from '@furria/studio/use-act-studio-holders';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';

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
