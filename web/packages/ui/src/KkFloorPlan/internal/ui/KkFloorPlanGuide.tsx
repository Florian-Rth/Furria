import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { planMidpoint } from '../../floor-plan-view';
import { NON_SCALING, planPalette, STROKE } from '../floor-plan-paint';
import { KkFloorPlanChip } from './KkFloorPlanChip';

interface KkFloorPlanGuideProps {
  from: KkPlanPoint;
  to: KkPlanPoint;
  label?: string | null;
}

export const KkFloorPlanGuide: FC<KkFloorPlanGuideProps> = ({ from, to, label = null }) => {
  const middle = planMidpoint(from, to);
  const caption =
    label === null ? null : (
      <KkFloorPlanChip x={middle.x} y={middle.y} label={label} tone="accent" />
    );

  return (
    <Box component="g" aria-hidden data-kk-plan-guide sx={{ pointerEvents: 'none' }}>
      <Box
        component="line"
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        vectorEffect={NON_SCALING}
        sx={(theme) => ({
          stroke: planPalette(theme).primary.main,
          strokeWidth: STROKE.hair,
          strokeDasharray: '4 3',
        })}
      />
      {caption}
    </Box>
  );
};
