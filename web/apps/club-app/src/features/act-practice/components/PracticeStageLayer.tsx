import { stepRangeOf } from '@furria/studio/music-timeline';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkPracticeStage } from '@furria/ui/KkPracticeStage';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { PRACTICE_FRONT, practiceStageLabelOf } from '../practice-copy';
import type { StageScene } from '../practice-stage';
import { stageSummaryOf } from '../practice-stage';
import { frameKeyOf, stageFrameOf } from '../practice-stage-frame';
import { shownStepOf } from '../practice-stepping';
import { PracticeStageScene } from './PracticeStageScene';

interface PracticeStageLayerProps {
  studio: Studio;
  playback: StudioPlayback;
}

export const PracticeStageLayer: FC<PracticeStageLayerProps> = ({ studio, playback }) => {
  const { stage, paths, ownSpotId, player, countMarks, state, steps } = playback;
  const scene: StageScene = { paths, spots: studio.spots, ownSpotId, stage };
  const ownPath = paths.find((path) => path.spotId === ownSpotId) ?? null;
  const label = practiceStageLabelOf(stageSummaryOf(studio.spots, ownSpotId));
  const stepId = usePlaybackSelection(
    player,
    (seconds) => shownStepOf(steps, seconds)?.stepId ?? null,
  );
  const step = steps.find((candidate) => candidate.stepId === stepId) ?? null;
  const frame = stageFrameOf(paths, countMarks, step === null ? null : stepRangeOf(step), stage);

  return (
    <KkPracticeStage
      label={label}
      frontLabel={PRACTICE_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      frame={frame}
      frameKey={frameKeyOf(frame)}
    >
      <PracticeStageScene
        player={player}
        scene={scene}
        ownPath={ownPath}
        marks={countMarks}
        loop={state.loop}
        steps={steps}
        gliding={!state.playing}
      />
    </KkPracticeStage>
  );
};
