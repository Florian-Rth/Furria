import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanViewBox } from '../../floor-plan-view';
import { planGridPath, planGridSteps } from '../../floor-plan-view';
import { NON_SCALING, planPalette, planTint, STROKE } from '../floor-plan-paint';

interface KkFloorPlanGridProps {
  box: KkPlanViewBox;
  scale: number;
}

export const KkFloorPlanGrid: FC<KkFloorPlanGridProps> = ({ box, scale }) => {
  const steps = planGridSteps(scale);
  const isSingleStep = steps.minorCm === steps.majorCm;
  const minor = isSingleStep ? '' : planGridPath(box, steps.minorCm, steps.majorCm);
  const major = planGridPath(box, steps.majorCm, null);

  return (
    <Box
      component="g"
      aria-hidden
      data-kk-plan-grid
      sx={{ pointerEvents: 'none', fill: 'none', strokeWidth: STROKE.hair }}
    >
      <Box
        component="path"
        d={minor}
        vectorEffect={NON_SCALING}
        sx={(theme) => ({ stroke: planTint(planPalette(theme).divider, '55%') })}
      />
      <Box
        component="path"
        d={major}
        vectorEffect={NON_SCALING}
        sx={(theme) => ({ stroke: planPalette(theme).divider })}
      />
    </Box>
  );
};
