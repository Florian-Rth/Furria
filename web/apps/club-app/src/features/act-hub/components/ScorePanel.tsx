import { Timeline } from '@furria/studio/Timeline';
import { KkScoreTransport } from '@furria/ui/KkScoreTransport';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActHub } from '../hooks/use-act-hub';
import {
  LENS_LABEL,
  NO_MUSIC,
  PAUSE_LABEL,
  PLAY_LABEL,
  SCORE_LABEL,
  stepTitleOf,
} from '../score-copy';
import { ScoreClock } from './ScoreClock';

const REVEAL_SECONDS = 1.6;

interface ScorePanelProps {
  score: ActHub;
}

export const ScorePanel: FC<ScorePanelProps> = ({ score }) => {
  const { player, wide } = score;
  const active = score.nowStep;
  const nowName = active === null ? '' : stepTitleOf(active.number, active.name);
  const playLabel = player.playing ? PAUSE_LABEL : PLAY_LABEL;
  const lenses =
    wide && player.lenses.length > 2 ? (
      <KkScoreTransport.Lenses
        label={LENS_LABEL}
        lenses={player.lenses}
        value={player.lens}
        onChange={player.setLens}
      />
    ) : null;
  const clock =
    player.length > 0 ? <ScoreClock player={player.player} length={player.length} /> : null;
  const revealSeconds = score.reveal ? REVEAL_SECONDS : null;
  const selectPart = wide ? undefined : score.selectPart;
  const steps = wide ? (
    <Timeline.Steps
      label={SCORE_LABEL}
      steps={score.steps}
      activeKey={player.activeStepId}
      selectedKey={score.paneStepId}
      revealSeconds={revealSeconds}
      onSelect={score.selectRow}
    />
  ) : (
    <Timeline.Ticks
      steps={score.steps}
      activeKey={player.activeStepId}
      revealSeconds={revealSeconds}
    />
  );
  const counts = wide ? <Timeline.Counts marks={score.model.marks} /> : null;
  const track =
    player.length > 0 ? (
      <Timeline
        label={SCORE_LABEL}
        density={wide ? 'full' : 'track'}
        length={player.length}
        focus={player.focus}
        onSeek={player.seekTo}
      >
        <Timeline.Parts tone={score.tone} parts={score.parts} onSelect={selectPart} />
        <Timeline.Ruler />
        {counts}
        <Timeline.Wave
          segments={score.model.segments}
          peaks={player.peaks}
          player={player.player}
          playing={player.playing}
          revealSeconds={revealSeconds}
        />
        <Timeline.Cuts segments={score.model.segments} />
        {steps}
        <Timeline.Playhead player={player.player} playing={player.playing} />
      </Timeline>
    ) : (
      <KkText variant="body2" tone="secondary">
        {NO_MUSIC}
      </KkText>
    );

  if (player.length <= 0) {
    return track;
  }

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkScoreTransport>
        <KkScoreTransport.Play
          playing={player.playing}
          label={playLabel}
          disabled={!player.canPlay}
          onToggle={player.toggle}
        />
        {clock}
        <KkScoreTransport.Now
          number={active?.number ?? null}
          name={nowName}
          lit={player.playing && player.activeStepId !== null}
        />
        {lenses}
      </KkScoreTransport>
      {track}
    </Stack>
  );
};
