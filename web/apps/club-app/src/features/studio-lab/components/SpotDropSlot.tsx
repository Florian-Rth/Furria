import { useDroppable } from '@dnd-kit/react';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC, PropsWithChildren } from 'react';

interface SpotDropSlotProps extends PropsWithChildren {
  id: number | string;
  label: string;
}

export const SpotDropSlot: FC<SpotDropSlotProps> = ({ id, label, children }) => {
  const droppable = useDroppable({ id });

  return (
    <KkTouchLab.Slot slotRef={droppable.ref} label={label} over={droppable.isDropTarget}>
      {children}
    </KkTouchLab.Slot>
  );
};
