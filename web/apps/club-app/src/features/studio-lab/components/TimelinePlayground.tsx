import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import { useTimelinePlayground } from '../hooks/use-timeline-playground';
import type { StudioLabVariants } from '../schemas';
import { TIMELINE_AREA, TIMELINE_HINT_DISTANCE, TIMELINE_HINT_HOLD } from '../studio-lab-copy';
import { LabLiftOverlay } from './LabLiftOverlay';
import { LabTransportBar } from './LabTransportBar';
import { TimelineLayers } from './TimelineLayers';

interface TimelinePlaygroundProps {
  studio: ActStudio;
  variants: StudioLabVariants;
}

export const TimelinePlayground: FC<TimelinePlaygroundProps> = ({ studio, variants }) => {
  const playground = useTimelinePlayground(studio, variants);
  const hint = variants.precision === 'hold' ? TIMELINE_HINT_HOLD : TIMELINE_HINT_DISTANCE;
  const layers = <TimelineLayers layers={playground.layers} />;
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
