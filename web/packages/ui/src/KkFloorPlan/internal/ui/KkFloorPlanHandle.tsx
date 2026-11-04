import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  PLAN_HANDLE_ATTRIBUTE,
  PLAN_HANDLE_PX,
  planPalette,
  STROKE,
  screenConstantAt,
} from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';

export type KkPlanHandleShape = 'square' | 'round';

interface KkFloorPlanHandleProps {
  id: string;
  x: number;
  y: number;
  shape?: KkPlanHandleShape;
}

const HIT_PX = 22;

export const KkFloorPlanHandle: FC<KkFloorPlanHandleProps> = ({ id, x, y, shape = 'square' }) => {
  const scale = useFloorPlanScale();
  const half = PLAN_HANDLE_PX / 2;
  const mark =
    shape === 'round' ? (
      <circle cx={0} cy={0} r={half} />
    ) : (
      <rect x={-half} y={-half} width={PLAN_HANDLE_PX} height={PLAN_HANDLE_PX} rx={2} />
    );
  const attributes = { [PLAN_HANDLE_ATTRIBUTE]: id };

  return (
    <Box
      component="g"
      transform={screenConstantAt(x, y, scale)}
      {...attributes}
      data-kk-plan-handle-shape={shape}
      sx={(theme) => ({
        cursor: 'pointer',
        fill: planPalette(theme).background.paper,
        stroke: planPalette(theme).primary.main,
        strokeWidth: STROKE.section,
      })}
    >
      <Box
        component="circle"
        cx={0}
        cy={0}
        r={HIT_PX / 2}
        sx={{ fill: 'transparent', stroke: 'none' }}
      />
      {mark}
    </Box>
  );
};
