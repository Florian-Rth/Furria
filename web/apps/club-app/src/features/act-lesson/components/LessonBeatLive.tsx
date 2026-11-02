import type { MixPlayer } from '@furria/studio/mix-player';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { countAt } from '@furria/studio/music-timeline';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { countLabelOf } from '@/features/act-practice/practice-copy';
import { beatLabelOf, eightTextOf, LESSON_EIGHT } from '../lesson-copy';
import type { StepCounts } from '../lesson-counts';
import { cellIndexAtSeconds, eightPlaceOf } from '../lesson-counts';

interface LessonBeatLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
  counts: StepCounts;
}

export const LessonBeatLive: FC<LessonBeatLiveProps> = ({ player, segments, counts }) => {
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );
  const lit = usePlaybackSelection(player, (seconds) => cellIndexAtSeconds(counts.cells, seconds));
  const place = eightPlaceOf(counts.cells, lit);
  const eyebrow = place === null ? '' : LESSON_EIGHT;

  return (
    <KkLesson.Beat
      count={count}
      eyebrow={eyebrow}
      eight={eightTextOf(place)}
      label={beatLabelOf(countLabelOf(count), place)}
    />
  );
};
