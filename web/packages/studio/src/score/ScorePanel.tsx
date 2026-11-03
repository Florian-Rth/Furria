import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import { ScoreTransport } from '@furria/studio/ScoreTransport';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import { NO_MUSIC, SCORE_LABEL } from '@furria/studio/score-copy';
import type { ScoreStep } from '@furria/studio/score-steps';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import { useScoreTimeline } from '@furria/studio/use-score-timeline';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

const REVEAL_SECONDS = 1.6;

interface ScorePanelProps {
  player: ScorePlayer;
  nowStep: ScoreStep | null;
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

export const ScorePanel: FC<ScorePanelProps> = ({
  player,
  nowStep,
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
  const timeline = useScoreTimeline({
    player,
    marks,
    parts,
    steps,
    wide,
    onSelectStep,
    onSelectPart,
  });

  const revealSeconds = reveal ? REVEAL_SECONDS : null;
  const selectPart = wide ? undefined : onSelectPart;
  const density = wide ? 'full' : 'track';
  const wave = { segments, peaks: player.peaks, revealSeconds, counts: marks, cuts: true };
  const partBands = { parts, tone, onSelect: selectPart };
  const stepBlocks = {
    steps,
    activeKey: player.activeStepId,
    selectedKey: selectedStepId,
    revealSeconds,
    onSelect: onSelectStep,
  };

  if (player.length <= 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {NO_MUSIC}
      </KkText>
    );
  }

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <ScoreTransport player={player} timeline={timeline} nowStep={nowStep} wide={wide} />
      <StudioTimeline
        label={SCORE_LABEL}
        density={density}
        length={player.length}
        centre={timeline.centre}
        ruler
        parts={partBands}
        wave={wave}
        steps={stepBlocks}
      />
    </Stack>
  );
};
