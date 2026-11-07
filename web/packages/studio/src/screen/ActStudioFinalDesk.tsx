import { ActStudioFinalDeskBody } from '@furria/studio/ActStudioFinalDeskBody';
import { finalDeskLabelOf, STUDIO_FINAL_DESK_CLOSE } from '@furria/studio/studio-copy';
import type { FinalDesk } from '@furria/studio/use-final-desk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface ActStudioFinalDeskProps {
  desk: FinalDesk;
  onClose: () => void;
}

export const ActStudioFinalDesk: FC<ActStudioFinalDeskProps> = ({ desk, onClose }) => {
  const label = finalDeskLabelOf(desk.kind);

  return (
    <KkLaneInspector>
      <KkLaneInspector.Top>
        <KkLaneInspector.Head eyebrow={label} title={desk.title} />
        <KkLaneInspector.Close label={STUDIO_FINAL_DESK_CLOSE} onClose={onClose} />
      </KkLaneInspector.Top>
      <ActStudioFinalDeskBody desk={desk} />
    </KkLaneInspector>
  );
};
