import { KkDragReadout } from '@furria/ui/KkDragReadout';
import type { FC } from 'react';
import type { WaveReadout } from '../hooks/use-act-studio-wave';

interface ActStudioWaveReadoutProps {
  readout: WaveReadout | null;
}

export const ActStudioWaveReadout: FC<ActStudioWaveReadoutProps> = ({ readout }) =>
  readout === null ? null : (
    <KkDragReadout x={readout.x} y={readout.y} value={readout.value} detail={readout.detail} />
  );
