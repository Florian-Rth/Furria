import { useDraggable } from '@dnd-kit/react';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { HolderView } from '../hooks/use-lists-playground';

interface HolderChipProps {
  holder: HolderView;
}

export const HolderChip: FC<HolderChipProps> = ({ holder }) => {
  const draggable = useDraggable({ id: holder.personId });

  return (
    <KkTouchLab.Person
      personRef={draggable.ref}
      name={holder.name}
      dragging={draggable.isDragging}
    />
  );
};
