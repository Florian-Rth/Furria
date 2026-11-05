import Box from '@mui/material/Box';
import type { FC } from 'react';
import { PLAN_NOTE_MARK_PX, planPalette, STROKE, screenConstantAt } from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';

interface KkFloorPlanNoteMarkProps {
  x: number;
  y: number;
}

export const KkFloorPlanNoteMark: FC<KkFloorPlanNoteMarkProps> = ({ x, y }) => {
  const scale = useFloorPlanScale();

  return (
    <Box
      component="g"
      aria-hidden
      transform={screenConstantAt(x, y, scale)}
      data-kk-plan-note-mark
      sx={{ pointerEvents: 'none' }}
    >
      <Box
        component="circle"
        cx={0}
        cy={0}
        r={PLAN_NOTE_MARK_PX / 2}
        sx={(theme) => ({
          fill: planPalette(theme).warning.main,
          stroke: planPalette(theme).background.paper,
          strokeWidth: STROKE.hair,
        })}
      />
    </Box>
  );
};
