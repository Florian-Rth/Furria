import { KkStageInk } from '@furria/ui/KkStageInk';
import type { FC } from 'react';
import { StagePlace } from '../layout/StagePlace';

interface StageEchoProps {
  x: number;
  y: number;
}

const ECHO_LAYER = 0;

export const StageEcho: FC<StageEchoProps> = ({ x, y }) => (
  <StagePlace x={x} y={y} layer={ECHO_LAYER}>
    <KkStageInk.Echo />
  </StagePlace>
);
