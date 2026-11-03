import { ScoreClock } from '@furria/studio/ScoreClock';
import { LENS_LABEL, PAUSE_LABEL, PLAY_LABEL, stepTitleOf } from '@furria/studio/score-copy';
import type { ScoreStep } from '@furria/studio/score-steps';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import type { ScoreTimeline } from '@furria/studio/use-score-timeline';
import { KkScoreTransport } from '@furria/ui/KkScoreTransport';
import type { FC } from 'react';

const LENS_MINIMUM = 3;

interface ScoreTransportProps {
  player: ScorePlayer;
  timeline: ScoreTimeline;
  nowStep: ScoreStep | null;
  wide: boolean;
}

export const ScoreTransport: FC<ScoreTransportProps> = ({ player, timeline, nowStep, wide }) => {
  const nowName = nowStep === null ? '' : stepTitleOf(nowStep.number, nowStep.name);
  const nowNumber = nowStep?.number ?? null;
  const nowLit = player.playing && player.activeStepId !== null;
  const playLabel = player.playing ? PAUSE_LABEL : PLAY_LABEL;
  const playDisabled = !player.canPlay;
  const lenses =
    wide && timeline.lenses.length >= LENS_MINIMUM ? (
      <KkScoreTransport.Lenses
        label={LENS_LABEL}
        lenses={timeline.lenses}
        value={timeline.lens}
        onChange={timeline.chooseLens}
      />
    ) : null;

  return (
    <KkScoreTransport>
      <KkScoreTransport.Play
        playing={player.playing}
        label={playLabel}
        disabled={playDisabled}
        onToggle={player.toggle}
      />
      <ScoreClock player={player.player} length={player.length} />
      <KkScoreTransport.Now number={nowNumber} name={nowName} lit={nowLit} />
      {lenses}
    </KkScoreTransport>
  );
};
