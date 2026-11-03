import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import { StagePlace } from '../layout/StagePlace';

interface StageHandleProps {
  x: number;
  y: number;
  active: boolean;
}

const HANDLE_LAYER = 5;

export const StageHandle: FC<StageHandleProps> = ({ x, y, active }) => (
  <StagePlace x={x} y={y} layer={HANDLE_LAYER}>
    <KkStageInk.Handle active={active} />
  </StagePlace>
);
