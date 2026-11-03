import type { MixPlayer } from '@furria/studio/mix-player';
import { ScoreFormation } from '@furria/studio/ScoreFormation';
import { AUDIENCE_LABEL, FORMATION_TITLE, OPEN_SPOT } from '@furria/studio/score-copy';
import type { LiveScene } from '@furria/studio/score-live';
import { liveDotsOf } from '@furria/studio/score-live';
import type { ScoreStepView } from '@furria/studio/score-views';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkFormationLegend } from '@furria/ui/KkFormationLegend';
import type { FC } from 'react';

interface ScoreLiveFormationProps {
  scene: LiveScene;
  player: MixPlayer;
  view: ScoreStepView;
}

export const ScoreLiveFormation: FC<ScoreLiveFormationProps> = ({ scene, player, view }) => {
  const seconds = usePlaybackSeconds(player);
  const dots = liveDotsOf(scene, view.step.range, seconds, view.dots);
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
      stage={scene.stage}
      dots={dots}
      density="full"
      frontLabel={AUDIENCE_LABEL}
    />
  );

  return <KkFormationLegend figure={figure} entries={entries} openLabel={OPEN_SPOT} />;
};
