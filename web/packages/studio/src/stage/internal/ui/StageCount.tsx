import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import { StagePlace } from '../layout/StagePlace';

const COUNT_LAYER = 0;

interface StageCountProps {
  x: number;
  y: number;
  count: number;
}

export const StageCount: FC<StageCountProps> = ({ x, y, count }) => (
  <StagePlace x={x} y={y} layer={COUNT_LAYER}>
    <KkStageInk.Count count={count} />
  </StagePlace>
);
