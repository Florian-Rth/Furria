import { ScoreFormation } from '@furria/studio/ScoreFormation';
import { AUDIENCE_LABEL, FORMATION_TITLE, OPEN_SPOT } from '@furria/studio/score-copy';
import type { ScoreHub } from '@furria/studio/score-hub';
import { liveDotsOf } from '@furria/studio/score-live';
import type { ScoreStepView } from '@furria/studio/score-views';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkFormationLegend } from '@furria/ui/KkFormationLegend';
import type { FC } from 'react';

interface ScoreLiveFormationProps {
  score: ScoreHub;
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
