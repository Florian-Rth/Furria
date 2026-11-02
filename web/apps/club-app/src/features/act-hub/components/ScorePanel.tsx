import { KkScoreTrack } from '@furria/ui/KkScoreTrack';
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
import { ScorePlayhead } from './ScorePlayhead';

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
  const ruler = wide ? <KkScoreTrack.Ruler ticks={player.ticks} /> : null;
  const parts = wide ? (
    <KkScoreTrack.Parts tone={score.tone} parts={score.parts} />
  ) : (
    <KkScoreTrack.Parts tone={score.tone} parts={score.parts} onSelect={score.selectPart} />
  );
  const steps = wide ? (
    <KkScoreTrack.Steps
      label={SCORE_LABEL}
      blocks={score.blocks}
      activeKey={player.activeStepId}
      selectedKey={score.paneStepId}
      interactive
      revealSeconds={revealSeconds}
      onSelect={score.selectRow}
    />
  ) : (
    <KkScoreTrack.Ticks
      ticks={score.ticks}
      activeKey={player.activeStepId}
      revealSeconds={revealSeconds}
    />
  );
  const track =
    player.length > 0 ? (
      <KkScoreTrack
        label={SCORE_LABEL}
        size={wide ? 'full' : 'strip'}
        zoom={player.zoom}
        onSeek={player.seekShare}
      >
        {parts}
        {ruler}
        <KkScoreTrack.Wave
          bars={player.bars}
          seams={score.model.seams}
          eights={wide ? score.model.eights : []}
          reveal={score.reveal}
          revealSeconds={REVEAL_SECONDS}
        />
        {steps}
        <ScorePlayhead
          player={player.player}
          length={player.length}
          bars={player.bars}
          playing={player.playing}
        />
      </KkScoreTrack>
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
