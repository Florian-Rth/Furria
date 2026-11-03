import type { WaveReadout } from '@furria/studio/use-act-studio-wave';
import { KkDragReadout } from '@furria/ui/KkDragReadout';
import type { FC } from 'react';

interface ActStudioWaveReadoutProps {
  readout: WaveReadout | null;
}

export const ActStudioWaveReadout: FC<ActStudioWaveReadoutProps> = ({ readout }) =>
  readout === null ? null : (
    <KkDragReadout x={readout.x} y={readout.y} value={readout.value} detail={readout.detail} />
  );
