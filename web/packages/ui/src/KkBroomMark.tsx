import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  BROOM_CROSS_ANGLE,
  BROOM_CROSS_ORIGIN,
  BROOM_VIEWBOX,
  BroomGlyph,
} from './internal/broom-glyph';

const viewBox = `${BROOM_VIEWBOX.x} ${BROOM_VIEWBOX.y} ${BROOM_VIEWBOX.width} ${BROOM_VIEWBOX.height}`;
const leftBroom = `rotate(-${BROOM_CROSS_ANGLE} ${BROOM_CROSS_ORIGIN})`;
const rightBroom = `rotate(${BROOM_CROSS_ANGLE} ${BROOM_CROSS_ORIGIN})`;

interface KkBroomMarkProps {
  size?: number;
  sx?: SxProps<Theme>;
}

export const KkBroomMark: FC<KkBroomMarkProps> = ({ size = 34, sx }) => {
  const height = (size * BROOM_VIEWBOX.height) / BROOM_VIEWBOX.width;

  return (
    <Box
      component="svg"
      viewBox={viewBox}
      width={size}
      height={height}
      aria-hidden
      sx={[{ display: 'block', fill: 'currentColor' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <g transform={leftBroom}>
        <BroomGlyph />
      </g>
      <g transform={rightBroom}>
        <BroomGlyph />
      </g>
    </Box>
  );
};
