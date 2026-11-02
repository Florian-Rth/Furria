import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import { StagePlace } from '../layout/StagePlace';

interface StageKeyProps {
  x: number;
  y: number;
}

const KEY_LAYER = 0;

export const StageKey: FC<StageKeyProps> = ({ x, y }) => (
  <StagePlace x={x} y={y} layer={KEY_LAYER}>
    <KkStageInk.Key />
  </StagePlace>
);
