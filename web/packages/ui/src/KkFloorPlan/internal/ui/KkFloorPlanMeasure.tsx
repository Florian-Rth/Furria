import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { planDistance, planMidpoint } from '../../floor-plan-view';
import { NON_SCALING, planPalette, STROKE } from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';
import { KkFloorPlanChip } from './KkFloorPlanChip';

interface KkFloorPlanMeasureProps {
  from: KkPlanPoint;
  to: KkPlanPoint;
  label: string;
}

const TICK_PX = 7;

export const KkFloorPlanMeasure: FC<KkFloorPlanMeasureProps> = ({ from, to, label }) => {
  const scale = useFloorPlanScale();
  const length = Math.max(planDistance(from, to), 1e-6);
  const normalX = (-(to.y - from.y) / length) * (TICK_PX / scale);
  const normalY = ((to.x - from.x) / length) * (TICK_PX / scale);
  const ends: readonly (readonly [string, KkPlanPoint])[] = [
    ['start', from],
    ['end', to],
  ];
  const ticks = ends.map(([key, end]) => (
    <line
      key={key}
      x1={end.x - normalX}
      y1={end.y - normalY}
      x2={end.x + normalX}
      y2={end.y + normalY}
      vectorEffect={NON_SCALING}
    />
  ));
  const middle = planMidpoint(from, to);

  return (
    <Box
      component="g"
      aria-hidden
      data-kk-plan-measure
      sx={(theme) => ({
        pointerEvents: 'none',
        stroke: planPalette(theme).text.primary,
        strokeWidth: STROKE.section,
        fill: 'none',
      })}
    >
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect={NON_SCALING} />
      {ticks}
      <KkFloorPlanChip x={middle.x} y={middle.y} label={label} tone="ink" />
    </Box>
  );
};
