import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { NON_SCALING, planPalette, planTint, STROKE } from '../floor-plan-paint';

interface KkFloorPlanMarqueeProps {
  from: KkPlanPoint;
  to: KkPlanPoint;
}

export const KkFloorPlanMarquee: FC<KkFloorPlanMarqueeProps> = ({ from, to }) => (
  <Box
    component="rect"
    aria-hidden
    data-kk-plan-marquee
    x={Math.min(from.x, to.x)}
    y={Math.min(from.y, to.y)}
    width={Math.abs(to.x - from.x)}
    height={Math.abs(to.y - from.y)}
    vectorEffect={NON_SCALING}
    sx={(theme) => ({
      pointerEvents: 'none',
      fill: planTint(planPalette(theme).primary.main, '8%'),
      stroke: planPalette(theme).primary.main,
      strokeWidth: STROKE.hair,
      strokeDasharray: '5 4',
    })}
  />
);
