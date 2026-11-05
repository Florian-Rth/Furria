import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanAreaKind } from '../floor-plan-paint';
import {
  areaInk,
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  placeAt,
  planPalette,
  planTint,
  STROKE,
} from '../floor-plan-paint';
import { KkFloorPlanScreenText } from './KkFloorPlanScreenText';

interface KkFloorPlanAreaProps {
  id?: string;
  kind: KkPlanAreaKind;
  x: number;
  y: number;
  widthCm: number;
  heightCm: number;
  rotation: number;
  label: string;
  selected?: boolean;
  muted?: boolean;
}

export const KkFloorPlanArea: FC<KkFloorPlanAreaProps> = ({
  id,
  kind,
  x,
  y,
  widthCm,
  heightCm,
  rotation,
  label,
  selected = false,
  muted = false,
}) => (
  <Box
    component="g"
    transform={placeAt(x, y, rotation)}
    {...hitAttributes(id, muted)}
    data-kk-plan-area={kind}
    sx={mutedPaint(muted)}
  >
    <Box
      component="rect"
      x={-widthCm / 2}
      y={-heightCm / 2}
      width={widthCm}
      height={heightCm}
      vectorEffect={NON_SCALING}
      sx={(theme) => ({
        fill: planTint(areaInk(theme, kind), '16%'),
        stroke: selected ? planPalette(theme).primary.main : areaInk(theme, kind),
        strokeWidth: selected ? STROKE.page : STROKE.section,
      })}
    />
    <KkFloorPlanScreenText x={0} y={0} rotation={-rotation} text={label} emphasis />
  </Box>
);
