import { KkStudioEStage } from '@furria/ui/KkStudioEStage';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { STUDIO_E_FRONT, STUDIO_E_STAGE_LABEL } from '../studio-e-copy';
import type { StageScene } from '../studio-e-stage';
import { StudioEStageScene } from './StudioEStageScene';

interface StudioEStageLayerProps {
  studio: Studio;
  playback: StudioPlayback;
}

export const StudioEStageLayer: FC<StudioEStageLayerProps> = ({ studio, playback }) => {
  const { stage, paths, ownSpotId, player, countMarks, state } = playback;
  const scene: StageScene = { paths, spots: studio.spots, ownSpotId, stage };
  const ownPath = paths.find((path) => path.spotId === ownSpotId) ?? null;

  return (
    <KkStudioEStage
      label={STUDIO_E_STAGE_LABEL}
      frontLabel={STUDIO_E_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
    >
      <StudioEStageScene
        player={player}
        scene={scene}
        ownPath={ownPath}
        marks={countMarks}
        loop={state.loop}
        gliding={!state.playing}
      />
    </KkStudioEStage>
  );
};
