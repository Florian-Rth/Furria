import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkScoreFormation } from '@furria/ui/KkScoreFormation';
import type { FC } from 'react';
import type { ActHub, ScoreStepView } from '../hooks/use-act-hub';
import { AUDIENCE_LABEL, FORMATION_TITLE, OPEN_SPOT } from '../score-copy';
import { liveDotsOf } from '../score-live';

interface ScoreLiveFormationProps {
  score: ActHub;
  view: ScoreStepView;
}

export const ScoreLiveFormation: FC<ScoreLiveFormationProps> = ({ score, view }) => {
  const seconds = usePlaybackSeconds(score.player.player);
  const { model, studio } = score;
  const dots = liveDotsOf(
    {
      paths: model.paths,
      spots: studio.spots,
      stage: model.stage,
      ownSpotId: model.ownSpotId,
    },
    view.step.range,
    seconds,
    view.dots,
  );

  return (
    <KkScoreFormation
      label={FORMATION_TITLE}
      widthMetres={model.stage.widthMetres}
      depthMetres={model.stage.depthMetres}
      dots={dots}
      size="stage"
      audienceLabel={AUDIENCE_LABEL}
      openLabel={OPEN_SPOT}
    />
  );
};
