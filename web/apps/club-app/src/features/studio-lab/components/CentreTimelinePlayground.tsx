import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import { useCentreTimelinePlayground } from '../hooks/use-centre-timeline-playground';
import type { StudioLabVariants } from '../schemas';
import {
  TIMELINE_AREA,
  TIMELINE_HINT_CENTRE_DISTANCE,
  TIMELINE_HINT_CENTRE_HOLD,
} from '../studio-lab-copy';
import { CentreTimelineLayers } from './CentreTimelineLayers';
import { LabLiftOverlay } from './LabLiftOverlay';
import { LabTransportBar } from './LabTransportBar';

interface CentreTimelinePlaygroundProps {
  studio: ActStudio;
  variants: StudioLabVariants;
}

export const CentreTimelinePlayground: FC<CentreTimelinePlaygroundProps> = ({
  studio,
  variants,
}) => {
  const playground = useCentreTimelinePlayground(studio, variants);
  const hint =
    variants.precision === 'hold' ? TIMELINE_HINT_CENTRE_HOLD : TIMELINE_HINT_CENTRE_DISTANCE;
  const layers = <CentreTimelineLayers layers={playground.layers} />;
  const overlay = (
    <LabLiftOverlay lifted={playground.lifted} area={playground.area} magnified={layers} />
  );

  return (
    <Stack sx={{ gap: 1.5 }}>
      <KkTouchLab.Hint text={hint} />
      <LabTransportBar transport={playground.transport} />
      <KkTouchLab
        label={TIMELINE_AREA}
        size="track"
        areaRef={playground.area.areaRef}
        handlers={playground.area.handlers}
        overlay={overlay}
        sx={{ mt: 18 }}
      >
        {layers}
      </KkTouchLab>
    </Stack>
  );
};
