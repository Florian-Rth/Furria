import type { CountMark } from '@furria/studio/music-timeline';
import { scoreLensesOf, scoreLensOf, WHOLE_LENS } from '@furria/studio/score-lens';
import { scoreTapOf, scoreTargetsOf } from '@furria/studio/score-targets';
import type { TimelinePart, TimelineStep } from '@furria/studio/Timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useCentreScrub } from '@furria/studio/use-centre-scrub';
import type { ScorePlayer } from '@furria/studio/use-score-player';
import type { KkScoreLens } from '@furria/ui/KkScoreTransport';
import { useState } from 'react';

export interface ScoreTimeline {
  centre: CentreScrub;
  lens: string;
  lenses: KkScoreLens[];
  chooseLens: (id: string) => void;
}

interface UseScoreTimelineOptions {
  player: ScorePlayer;
  marks: readonly CountMark[];
  parts: readonly TimelinePart[];
  steps: readonly TimelineStep[];
  wide: boolean;
  onSelectStep: (stepId: number) => void;
  onSelectPart: (partId: number) => void;
}

export const useScoreTimeline = ({
  player,
  marks,
  parts,
  steps,
  wide,
  onSelectStep,
  onSelectPart,
}: UseScoreTimelineOptions): ScoreTimeline => {
  const [picked, setPicked] = useState(WHOLE_LENS);
  const targets = scoreTargetsOf(parts, steps, wide);
  const centre = useCentreScrub({
    player: player.player,
    length: player.length,
    countMarks: marks,
    targets,
    startFitted: wide,
    onTargetTap: (key) => {
      const tap = scoreTapOf(targets, key);
      if (tap?.kind === 'step') {
        onSelectStep(tap.id);
      }
      if (tap?.kind === 'part') {
        onSelectPart(tap.id);
      }
    },
  });

  return {
    centre,
    lens: scoreLensOf(parts, picked).lens,
    lenses: scoreLensesOf(parts),
    chooseLens: (id) => {
      const { lens, focus } = scoreLensOf(parts, id);
      setPicked(lens);
      if (focus === null) {
        centre.fit();
        return;
      }
      centre.frame(focus.start, focus.end);
      centre.centreOn(focus.start);
    },
  };
};
