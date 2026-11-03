import { useDroppable } from '@dnd-kit/react';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC, PropsWithChildren } from 'react';

interface ActStudioHolderPlaceProps extends PropsWithChildren {
  id: number | string;
  label: string;
  wide: boolean;
}

export const ActStudioHolderPlace: FC<ActStudioHolderPlaceProps> = ({
  id,
  label,
  wide,
  children,
}) => {
  const droppable = useDroppable({ id });

  return (
    <KkStudioList.Place
      placeRef={droppable.ref}
      label={label}
      over={droppable.isDropTarget}
      wide={wide}
    >
      {children}
    </KkStudioList.Place>
  );
};
