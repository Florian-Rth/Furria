import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import { StagePlace } from '../layout/StagePlace';

const TARGET_LAYER = 1;

interface StageTargetProps {
  x: number;
  y: number;
}

export const StageTarget: FC<StageTargetProps> = ({ x, y }) => (
  <StagePlace x={x} y={y} layer={TARGET_LAYER}>
    <KkStageInk.Ring />
  </StagePlace>
);
