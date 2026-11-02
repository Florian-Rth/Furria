import type { DragReadout } from '@furria/studio/use-drag-lift';
import { KkDragReadout } from '@furria/ui/KkDragReadout';
import type { FC } from 'react';

interface StudioStageReadoutProps {
  readout: DragReadout<string> | null;
}

export const StudioStageReadout: FC<StudioStageReadoutProps> = ({ readout }) =>
  readout === null ? null : (
    <KkDragReadout
      x={readout.placement.x}
      y={readout.placement.y}
      value={readout.value}
      detail={null}
    />
  );
