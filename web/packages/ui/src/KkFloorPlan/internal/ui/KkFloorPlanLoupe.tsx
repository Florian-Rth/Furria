import Box from '@mui/material/Box';
import type { FC } from 'react';
import { planPalette, STROKE, screenConstantAt } from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';

interface KkFloorPlanLoupeProps {
  x: number;
  y: number;
}

const RING_PX = 28;
const CROSS_PX = 10;

export const KkFloorPlanLoupe: FC<KkFloorPlanLoupeProps> = ({ x, y }) => {
  const scale = useFloorPlanScale();

  return (
    <Box
      component="g"
      aria-hidden
      transform={screenConstantAt(x, y, scale)}
      data-kk-plan-loupe
      sx={(theme) => ({
        pointerEvents: 'none',
        fill: 'none',
        stroke: planPalette(theme).primary.main,
        strokeWidth: STROKE.section,
      })}
    >
      <circle cx={0} cy={0} r={RING_PX} />
      <line x1={-CROSS_PX} y1={0} x2={CROSS_PX} y2={0} />
      <line x1={0} y1={-CROSS_PX} x2={0} y2={CROSS_PX} />
    </Box>
  );
};
