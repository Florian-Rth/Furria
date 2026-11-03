import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import { useRailPlayground } from '../hooks/use-rail-playground';
import type { StudioLabVariants } from '../schemas';
import { RAIL_AREA, RAIL_HINT } from '../studio-lab-copy';
import { LabTransportBar } from './LabTransportBar';

interface RailPlaygroundProps {
  studio: ActStudio;
  variants: StudioLabVariants;
}

export const RailPlayground: FC<RailPlaygroundProps> = ({ studio, variants }) => {
  const playground = useRailPlayground(studio, variants);

  return (
    <Stack sx={{ gap: 1.5 }}>
      <KkTouchLab.Hint text={RAIL_HINT} />
      <LabTransportBar transport={playground.transport} />
      <KkTouchLab
        label={RAIL_AREA}
        size="rail"
        areaRef={playground.area.areaRef}
        handlers={playground.area.handlers}
      >
        <KkTouchLab.RailTrack x={playground.x}>
          {playground.steps.map((step) => (
            <KkTouchLab.RailStep
              key={step.stepId}
              left={step.left}
              width={step.width}
              name={step.name}
              detail={step.detail}
              state={step.state}
            />
          ))}
        </KkTouchLab.RailTrack>
        <KkTouchLab.Centre />
      </KkTouchLab>
    </Stack>
  );
};
