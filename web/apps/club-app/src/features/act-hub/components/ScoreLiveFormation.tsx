import { liveDotsOf } from '@furria/studio/score-live';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkFormationLegend } from '@furria/ui/KkFormationLegend';
import type { FC } from 'react';
import type { ActHub, ScoreStepView } from '../hooks/use-act-hub';
import { AUDIENCE_LABEL, FORMATION_TITLE, OPEN_SPOT } from '../score-copy';
import { ScoreFormation } from './ScoreFormation';

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

  const entries = dots.map((dot) => ({
    key: dot.id,
    number: dot.number,
    caption: dot.caption,
    own: dot.own,
    open: dot.open,
  }));
  const figure = (
    <ScoreFormation
      label={FORMATION_TITLE}
      stage={model.stage}
      dots={dots}
      density="full"
      frontLabel={AUDIENCE_LABEL}
    />
  );

  return <KkFormationLegend figure={figure} entries={entries} openLabel={OPEN_SPOT} />;
};
