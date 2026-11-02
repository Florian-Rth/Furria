import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
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
