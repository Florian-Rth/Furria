import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import { SCORE_LABEL } from '@furria/studio/score-copy';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import { Timeline } from '@furria/studio/Timeline';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';

const REVEAL_SECONDS = 1.6;

interface ScoreTrackProps {
  player: ScorePlayer;
  segments: readonly MusicSegment[];
  marks: readonly CountMark[];
  parts: readonly TimelinePart[];
  steps: readonly TimelineStep[];
  tone: KkGroupTone | null;
  wide: boolean;
  reveal: boolean;
  selectedStepId: number | null;
  onSelectStep: (stepId: number) => void;
  onSelectPart: (partId: number) => void;
}

export const ScoreTrack: FC<ScoreTrackProps> = ({
  player,
  segments,
  marks,
  parts,
  steps,
  tone,
  wide,
  reveal,
  selectedStepId,
  onSelectStep,
  onSelectPart,
}) => {
  const revealSeconds = reveal ? REVEAL_SECONDS : null;
  const selectPart = wide ? undefined : onSelectPart;
  const density = wide ? 'full' : 'track';
  const stepMarks = wide ? (
    <Timeline.Steps
      label={SCORE_LABEL}
      steps={steps}
      activeKey={player.activeStepId}
      selectedKey={selectedStepId}
      revealSeconds={revealSeconds}
      onSelect={onSelectStep}
    />
  ) : (
    <Timeline.Ticks steps={steps} activeKey={player.activeStepId} revealSeconds={revealSeconds} />
  );
  const counts = wide ? <Timeline.Counts marks={marks} /> : null;

  return (
    <Timeline
      label={SCORE_LABEL}
      density={density}
      length={player.length}
      focus={player.focus}
      onSeek={player.seekTo}
    >
      <Timeline.Parts tone={tone} parts={parts} onSelect={selectPart} />
      <Timeline.Ruler />
      {counts}
      <Timeline.Wave
        segments={segments}
        peaks={player.peaks}
        player={player.player}
        playing={player.playing}
        revealSeconds={revealSeconds}
      />
      <Timeline.Cuts segments={segments} />
      {stepMarks}
      <Timeline.Playhead player={player.player} playing={player.playing} />
    </Timeline>
  );
};
