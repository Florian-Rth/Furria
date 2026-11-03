import { stepRangeOf } from '@furria/studio/music-timeline';
import type { StageScene } from '@furria/studio/practice-stage';
import { stageSummaryOf } from '@furria/studio/practice-stage';
import { stageFrameOf } from '@furria/studio/practice-stage-frame';
import { shownStepOf } from '@furria/studio/practice-stepping';
import { Stage } from '@furria/studio/Stage';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { ActStudio } from '@/features/acts/schemas';
import { PRACTICE_FRONT, practiceStageLabelOf } from '../practice-copy';
import { PracticeStageScene } from './PracticeStageScene';

interface PracticeStageLayerProps {
  studio: ActStudio;
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
    <Stage
      label={label}
      stage={stage}
      viewpoint="dancers"
      fit="contain"
      frame={frame}
      frontLabel={PRACTICE_FRONT}
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
    </Stage>
  );
};
