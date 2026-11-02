import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useStagePlayground } from '../hooks/use-stage-playground';
import type { StudioLabVariants } from '../schemas';
import { STAGE_AREA, STAGE_HINT } from '../studio-lab-copy';
import { KeyLaneArea } from './KeyLaneArea';
import { LabLiftOverlay } from './LabLiftOverlay';
import { LabTransportBar } from './LabTransportBar';
import { StageLayers } from './StageLayers';
import { StageSelectionSheet } from './StageSelectionSheet';
import { StageSelectionToolbar } from './StageSelectionToolbar';

interface StagePlaygroundProps {
  studio: Studio;
  variants: StudioLabVariants;
}

export const StagePlayground: FC<StagePlaygroundProps> = ({ studio, variants }) => {
  const playground = useStagePlayground(studio, variants);
  const layers = <StageLayers layers={playground.layers} />;
  const overlay = (
    <>
      <StageSelectionToolbar selection={playground.selection} />
      <LabLiftOverlay lifted={playground.lifted} area={playground.area} magnified={layers} />
    </>
  );

  return (
    <Stack sx={{ gap: 1.5 }}>
      <KkTouchLab.Hint text={STAGE_HINT} />
      <KkTouchLab
        label={STAGE_AREA}
        size="stage"
        areaRef={playground.area.areaRef}
        handlers={playground.area.handlers}
        overlay={overlay}
        sx={{ height: '52dvh' }}
      >
        {layers}
      </KkTouchLab>
      <KeyLaneArea lane={playground.lane} />
      <LabTransportBar transport={playground.transport} />
      <StageSelectionSheet selection={playground.selection} />
    </Stack>
  );
};
