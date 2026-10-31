import { KkPracticeStage } from '@furria/ui/KkPracticeStage';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { PRACTICE_FRONT, practiceStageLabelOf } from '../practice-copy';
import type { StageScene } from '../practice-stage';
import { stageSummaryOf } from '../practice-stage';
import { PracticeStageScene } from './PracticeStageScene';

interface PracticeStageLayerProps {
  studio: Studio;
  playback: StudioPlayback;
}

export const PracticeStageLayer: FC<PracticeStageLayerProps> = ({ studio, playback }) => {
  const { stage, paths, ownSpotId, player, countMarks, state } = playback;
  const scene: StageScene = { paths, spots: studio.spots, ownSpotId, stage };
  const ownPath = paths.find((path) => path.spotId === ownSpotId) ?? null;
  const label = practiceStageLabelOf(stageSummaryOf(studio.spots, ownSpotId));

  return (
    <KkPracticeStage
      label={label}
      frontLabel={PRACTICE_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
    >
      <PracticeStageScene
        player={player}
        scene={scene}
        ownPath={ownPath}
        marks={countMarks}
        loop={state.loop}
        gliding={!state.playing}
      />
    </KkPracticeStage>
  );
};
