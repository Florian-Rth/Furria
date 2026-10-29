import type { KkStudioDStageSize } from '@furria/ui/KkStudioDStage';
import { KkStudioDStage } from '@furria/ui/KkStudioDStage';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioDStageView as StudioDStageModel } from '../hooks/use-studio-d-stage';
import { STUDIO_D_STAGE_LABEL } from '../studio-d-copy';
import { StudioDDots } from './StudioDDots';

interface StudioDStageViewProps {
  player: MixPlayer;
  view: StudioDStageModel;
  size: KkStudioDStageSize;
}

export const StudioDStageView: FC<StudioDStageViewProps> = ({ player, view, size }) => {
  const way = size === 'full' ? <KkStudioDStage.Way points={view.way} /> : null;

  return (
    <KkStudioDStage
      label={STUDIO_D_STAGE_LABEL}
      widthMetres={view.stage.widthMetres}
      depthMetres={view.stage.depthMetres}
      artworkSvg={view.stage.artworkSvg}
      size={size}
    >
      {way}
      <StudioDDots player={player} scene={view.scene} size={size} />
    </KkStudioDStage>
  );
};
