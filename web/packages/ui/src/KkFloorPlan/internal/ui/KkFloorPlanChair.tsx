import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  placeAt,
  planPalette,
  planTint,
  STROKE,
} from '../floor-plan-paint';
import { KkFloorPlanNoteMark } from './KkFloorPlanNoteMark';
import { KkFloorPlanScreenText } from './KkFloorPlanScreenText';

interface KkFloorPlanChairProps {
  id?: string;
  x: number;
  y: number;
  rotation: number;
  widthCm: number;
  depthCm: number;
  number?: string | null;
  hasNote?: boolean;
  removed?: boolean;
  selected?: boolean;
  muted?: boolean;
}

const CORNER_SHARE = 0.18;
const BACK_SHARE = 0.22;

const seatPaint = (theme: Theme, selected: boolean, removed: boolean) => ({
  fill: removed ? 'transparent' : planTint(planPalette(theme).info.main, '30%'),
  stroke: selected ? planPalette(theme).primary.main : planPalette(theme).info.main,
  strokeWidth: selected ? STROKE.page : STROKE.hair,
  strokeDasharray: removed ? '3 3' : 'none',
});

export const KkFloorPlanChair: FC<KkFloorPlanChairProps> = ({
  id,
  x,
  y,
  rotation,
  widthCm,
  depthCm,
  number = null,
  hasNote = false,
  removed = false,
  selected = false,
  muted = false,
}) => {
  const corner = Math.min(widthCm, depthCm) * CORNER_SHARE;
  const back = removed ? null : (
    <Box
      component="rect"
      x={-widthCm / 2}
      y={depthCm / 2 - depthCm * BACK_SHARE}
      width={widthCm}
      height={depthCm * BACK_SHARE}
      rx={corner / 2}
      sx={(theme) => ({ fill: planPalette(theme).info.main })}
    />
  );
  const caption =
    number === null || removed ? null : (
      <KkFloorPlanScreenText x={0} y={0} rotation={-rotation} text={number} />
    );
  const note = hasNote ? <KkFloorPlanNoteMark x={widthCm / 2} y={-depthCm / 2} /> : null;

  return (
    <Box
      component="g"
      transform={placeAt(x, y, rotation)}
      {...hitAttributes(id, muted)}
      data-kk-plan-chair
      sx={mutedPaint(muted)}
    >
      <Box
        component="rect"
        x={-widthCm / 2}
        y={-depthCm / 2}
        width={widthCm}
        height={depthCm}
        rx={corner}
        vectorEffect={NON_SCALING}
        sx={(theme) => seatPaint(theme, selected, removed)}
      />
      {back}
      {caption}
      {note}
    </Box>
  );
};
