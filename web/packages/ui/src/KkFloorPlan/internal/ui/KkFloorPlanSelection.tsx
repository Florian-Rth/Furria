import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanResizeHandle } from '../../floor-plan-view';
import { PLAN_ROTATE_HANDLE } from '../../floor-plan-view';
import {
  NON_SCALING,
  PLAN_ROTATE_REACH_PX,
  placeAt,
  planPalette,
  STROKE,
} from '../floor-plan-paint';
import { useFloorPlanScale, useFloorPlanTouch } from '../logic/floor-plan-context';
import { KkFloorPlanHandle } from './KkFloorPlanHandle';

interface KkFloorPlanSelectionProps {
  x: number;
  y: number;
  widthCm: number;
  heightCm: number;
  rotation: number;
  resizable?: boolean;
  rotatable?: boolean;
}

const RESIZE_HANDLES: readonly { id: KkPlanResizeHandle; x: number; y: number }[] = [
  { id: 'nw', x: -1, y: -1 },
  { id: 'n', x: 0, y: -1 },
  { id: 'ne', x: 1, y: -1 },
  { id: 'e', x: 1, y: 0 },
  { id: 'se', x: 1, y: 1 },
  { id: 's', x: 0, y: 1 },
  { id: 'sw', x: -1, y: 1 },
  { id: 'w', x: -1, y: 0 },
];

const FRAME_GAP_PX = 4;
const KNOB_REACH_PX = 40;

export const KkFloorPlanSelection: FC<KkFloorPlanSelectionProps> = ({
  x,
  y,
  widthCm,
  heightCm,
  rotation,
  resizable = false,
  rotatable = false,
}) => {
  const scale = useFloorPlanScale();
  const gap = FRAME_GAP_PX / scale;
  const halfWidth = widthCm / 2 + gap;
  const halfHeight = heightCm / 2 + gap;
  const touch = useFloorPlanTouch();
  const reach = PLAN_ROTATE_REACH_PX / scale;
  const knobReach = KNOB_REACH_PX / scale;
  const resizers = resizable
    ? RESIZE_HANDLES.map((handle) => (
        <KkFloorPlanHandle
          key={handle.id}
          id={handle.id}
          x={handle.x * halfWidth}
          y={handle.y * halfHeight}
        />
      ))
    : null;
  const desktopRotator = (
    <>
      <line x1={0} y1={-halfHeight} x2={0} y2={-halfHeight - reach} vectorEffect={NON_SCALING} />
      <KkFloorPlanHandle id={PLAN_ROTATE_HANDLE} x={0} y={-halfHeight - reach} shape="round" />
    </>
  );
  const touchRotator = (
    <>
      <line x1={0} y1={halfHeight} x2={0} y2={halfHeight + knobReach} vectorEffect={NON_SCALING} />
      <KkFloorPlanHandle id={PLAN_ROTATE_HANDLE} x={0} y={halfHeight + knobReach} shape="knob" />
    </>
  );
  const rotator = rotatable ? (touch ? touchRotator : desktopRotator) : null;

  return (
    <Box
      component="g"
      transform={placeAt(x, y, rotation)}
      data-kk-plan-selection
      sx={(theme) => ({
        fill: 'none',
        stroke: planPalette(theme).primary.main,
        strokeWidth: STROKE.hair,
      })}
    >
      <Box
        component="rect"
        x={-halfWidth}
        y={-halfHeight}
        width={halfWidth * 2}
        height={halfHeight * 2}
        vectorEffect={NON_SCALING}
        sx={{ pointerEvents: 'none', strokeDasharray: '5 4' }}
      />
      {rotator}
      {resizers}
    </Box>
  );
};
