import type { MixPlayer } from '@furria/studio/mix-player';
import type { StudioStep } from '@furria/studio/studio-schemas';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { fillOf } from '@/features/act-practice/practice-controls';
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
