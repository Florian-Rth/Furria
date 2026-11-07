import type { WaveReadout } from '@furria/studio/wave-readout';
import { KkDragReadout } from '@furria/ui/KkDragReadout';
import type { FC } from 'react';

interface ActStudioWaveReadoutProps {
  readout: WaveReadout | null;
}

export const ActStudioWaveReadout: FC<ActStudioWaveReadoutProps> = ({ readout }) =>
  readout === null ? null : (
    <KkDragReadout x={readout.x} y={readout.y} value={readout.value} detail={readout.detail} />
  );
