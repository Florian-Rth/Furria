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
  faded?: boolean;
  conflict?: boolean;
  selected?: boolean;
  muted?: boolean;
}

const CORNER_SHARE = 0.18;
const BACK_SHARE = 0.22;

interface SeatLook {
  selected: boolean;
  removed: boolean;
  faded: boolean;
  conflict: boolean;
}

const strokeOf = (theme: Theme, look: SeatLook): string => {
  if (look.selected || look.conflict) {
    return planPalette(theme).primary.main;
  }

  return look.faded ? planTint(planPalette(theme).info.main, '45%') : planPalette(theme).info.main;
};

const seatPaint = (theme: Theme, look: SeatLook) => ({
  fill: look.removed || look.faded ? 'transparent' : planTint(planPalette(theme).info.main, '30%'),
  stroke: strokeOf(theme, look),
  strokeWidth: look.selected ? STROKE.page : STROKE.hair,
  strokeDasharray: look.removed || look.faded ? '3 3' : 'none',
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
  faded = false,
  conflict = false,
  selected = false,
  muted = false,
}) => {
  const corner = Math.min(widthCm, depthCm) * CORNER_SHARE;
  const look: SeatLook = { selected, removed, faded, conflict };
  const back =
    removed || faded ? null : (
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
    number === null || removed || faded ? null : (
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
        sx={(theme) => seatPaint(theme, look)}
      />
      {back}
      {caption}
      {note}
    </Box>
  );
};
