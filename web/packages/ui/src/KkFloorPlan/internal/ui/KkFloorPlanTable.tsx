import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkPlanTableShape } from '../floor-plan-paint';
import {
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  placeAt,
  planPalette,
  STROKE,
} from '../floor-plan-paint';
import { KkFloorPlanScreenText } from './KkFloorPlanScreenText';

interface KkFloorPlanTableProps {
  id?: string;
  shape: KkPlanTableShape;
  x: number;
  y: number;
  lengthCm: number;
  widthCm: number;
  rotation: number;
  segments?: number;
  number?: string | null;
  selected?: boolean;
  conflict?: boolean;
  muted?: boolean;
}

const edgeOf = (theme: Theme, selected: boolean, conflict: boolean): string =>
  selected
    ? planPalette(theme).primary.main
    : conflict
      ? planPalette(theme).error.main
      : planPalette(theme).text.primary;

export const KkFloorPlanTable: FC<KkFloorPlanTableProps> = ({
  id,
  shape,
  x,
  y,
  lengthCm,
  widthCm,
  rotation,
  segments = 1,
  number = null,
  selected = false,
  conflict = false,
  muted = false,
}) => {
  const bodyPaint = (theme: Theme) => ({
    fill: planPalette(theme).background.paper,
    stroke: edgeOf(theme, selected, conflict),
    strokeWidth: selected ? STROKE.page : STROKE.section,
  });
  const piece = lengthCm / Math.max(segments, 1);
  const joints = Array.from({ length: Math.max(segments - 1, 0) }, (_, index) => {
    const jointX = -lengthCm / 2 + piece * (index + 1);

    return (
      <Box
        key={jointX}
        component="line"
        x1={jointX}
        y1={-widthCm / 2}
        x2={jointX}
        y2={widthCm / 2}
        vectorEffect={NON_SCALING}
        sx={(theme) => ({ stroke: planPalette(theme).divider, strokeWidth: STROKE.hair })}
      />
    );
  });
  const body =
    shape === 'round' ? (
      <Box
        component="circle"
        cx={0}
        cy={0}
        r={lengthCm / 2}
        vectorEffect={NON_SCALING}
        sx={bodyPaint}
      />
    ) : (
      <Box
        component="rect"
        x={-lengthCm / 2}
        y={-widthCm / 2}
        width={lengthCm}
        height={widthCm}
        vectorEffect={NON_SCALING}
        sx={bodyPaint}
      />
    );
  const caption =
    number === null ? null : (
      <KkFloorPlanScreenText x={0} y={0} rotation={-rotation} text={number} emphasis />
    );

  return (
    <Box
      component="g"
      transform={placeAt(x, y, rotation)}
      {...hitAttributes(id, muted)}
      data-kk-plan-table={shape}
      sx={mutedPaint(muted)}
    >
      {body}
      {joints}
      {caption}
    </Box>
  );
};
