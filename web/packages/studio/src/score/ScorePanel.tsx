import type { CountMark, MusicSegment } from '@furria/studio/music-timeline';
import { ScoreTrack } from '@furria/studio/ScoreTrack';
import { ScoreTransport } from '@furria/studio/ScoreTransport';
import { NO_MUSIC } from '@furria/studio/score-copy';
import type { ScoreStep } from '@furria/studio/score-steps';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

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

export const ScorePanel: FC<ScorePanelProps> = ({ player, nowStep, wide, ...track }) => {
  if (player.length <= 0) {
    return (
      <KkText variant="body2" tone="secondary">
        {NO_MUSIC}
      </KkText>
    );
  }

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <ScoreTransport player={player} nowStep={nowStep} wide={wide} />
      <ScoreTrack player={player} wide={wide} {...track} />
    </Stack>
  );
};
