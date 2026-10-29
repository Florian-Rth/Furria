import { KkStudioAStage } from '@furria/ui/KkStudioAStage';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import type { StudioAPractice } from '../hooks/use-studio-a-practice';
import { useStudioAStage } from '../hooks/use-studio-a-stage';
import { STUDIO_A_FRONT, STUDIO_A_STAGE_LABEL } from '../studio-a-copy';
import { StudioADots } from './StudioADots';

interface StudioAStageLayerProps {
  studio: Studio;
  playback: StudioPlayback;
  practice: StudioAPractice;
  mirrored: boolean;
}

export const StudioAStageLayer: FC<StudioAStageLayerProps> = ({
  studio,
  playback,
  practice,
  mirrored,
}) => {
  const view = useStudioAStage(studio, playback, practice, mirrored);
  const ownTag = view.ownTag === null ? null : <KkStudioAStage.Tag text={view.ownTag} mark="own" />;
  const openTag =
    view.openTag === null ? null : <KkStudioAStage.Tag text={view.openTag} mark="open" />;

  const legend = (
    <>
      {ownTag}
      {openTag}
      <KkStudioAStage.Tag text={STUDIO_A_FRONT} mark="front" />
    </>
  );

  return (
    <KkStudioAStage
      label={STUDIO_A_STAGE_LABEL}
      widthMetres={view.stage.widthMetres}
      depthMetres={view.stage.depthMetres}
      artworkSvg={view.stage.artworkSvg}
      legend={legend}
    >
      <KkStudioAStage.Way points={view.way} aspect={view.aspect} />
      <StudioADots player={playback.player} scene={view.scene} />
    </KkStudioAStage>
  );
};
