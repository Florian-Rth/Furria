import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { fillOf } from '@/features/act-practice/practice-controls';
import type { StudioStep } from '@/features/acts/schemas';
import { countsLabelOf } from '../lesson-copy';
import type { StepCounts } from '../lesson-counts';
import { cellIndexAtSeconds, eightPlaceOf } from '../lesson-counts';

const FILL_GRAIN = 100;

interface LessonCountsLiveProps {
  player: MixPlayer;
  step: StudioStep | null;
  counts: StepCounts;
}

export const LessonCountsLive: FC<LessonCountsLiveProps> = ({ player, step, counts }) => {
  const counted = counts.cells.length > 0;
  const lit = usePlaybackSelection(player, (seconds) =>
    counted ? cellIndexAtSeconds(counts.cells, seconds) : -1,
  );
  const progress = usePlaybackSelection(player, (seconds) =>
    counted || step === null ? 0 : Math.round(fillOf(step, seconds) * FILL_GRAIN) / FILL_GRAIN,
  );
  const label = countsLabelOf(eightPlaceOf(counts.cells, lit));

  return <KkLesson.Counts groups={counts.groups} lit={lit} progress={progress} label={label} />;
};
