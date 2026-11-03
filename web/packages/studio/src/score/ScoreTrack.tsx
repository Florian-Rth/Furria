import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import { SCORE_LABEL } from '@furria/studio/score-copy';
import { SCORE_PART_LANE, SCORE_STEP_LANE } from '@furria/studio/score-targets';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import { Timeline } from '@furria/studio/Timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import type { KkGroupTone } from '@furria/ui/group-tone';
import type { FC } from 'react';

const REVEAL_SECONDS = 1.6;

interface ScoreTrackProps {
  player: ScorePlayer;
  centre: CentreScrub;
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
  centre,
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
  const partLane = wide ? undefined : SCORE_PART_LANE;
  const density = wide ? 'full' : 'track';

  return (
    <Timeline label={SCORE_LABEL} density={density} length={player.length} centre={centre}>
      <Timeline.Parts tone={tone} parts={parts} lane={partLane} onSelect={selectPart} />
      <Timeline.Ruler />
      <Timeline.Counts marks={marks} />
      <Timeline.Wave segments={segments} peaks={player.peaks} revealSeconds={revealSeconds} />
      <Timeline.Cuts segments={segments} />
      <Timeline.Steps
        label={SCORE_LABEL}
        steps={steps}
        activeKey={player.activeStepId}
        selectedKey={selectedStepId}
        revealSeconds={revealSeconds}
        lane={SCORE_STEP_LANE}
        onSelect={onSelectStep}
      />
    </Timeline>
  );
};
