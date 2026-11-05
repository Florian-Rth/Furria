import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  PLAN_HANDLE_ATTRIBUTE,
  PLAN_HANDLE_PX,
  planPalette,
  STROKE,
  screenConstantAt,
} from '../floor-plan-paint';
import { useFloorPlanScale, useFloorPlanTouch } from '../logic/floor-plan-context';

export type KkPlanHandleShape = 'square' | 'round' | 'knob';

interface KkFloorPlanHandleProps {
  id: string;
  x: number;
  y: number;
  shape?: KkPlanHandleShape;
}

const HIT_PX = 22;
const TOUCH_HIT_PX = 44;
const TOUCH_MARK_PX = 16;
const KNOB_MARK_PX = 24;

export const KkFloorPlanHandle: FC<KkFloorPlanHandleProps> = ({ id, x, y, shape = 'square' }) => {
  const scale = useFloorPlanScale();
  const touch = useFloorPlanTouch();
  const markPx = shape === 'knob' ? KNOB_MARK_PX : touch ? TOUCH_MARK_PX : PLAN_HANDLE_PX;
  const hitPx = touch ? TOUCH_HIT_PX : HIT_PX;
  const half = markPx / 2;
  const mark =
    shape === 'square' ? (
      <rect x={-half} y={-half} width={markPx} height={markPx} rx={2} />
    ) : (
      <circle cx={0} cy={0} r={half} />
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
        r={hitPx / 2}
        sx={{ fill: 'transparent', stroke: 'none' }}
      />
      {mark}
    </Box>
  );
};
