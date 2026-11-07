import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import type { StageGridLine } from '../../stage-grid';

interface StageGridProps {
  lines: readonly StageGridLine[];
}

export const StageGrid: FC<StageGridProps> = ({ lines }) => <KkStageInk.Grid lines={lines} />;
