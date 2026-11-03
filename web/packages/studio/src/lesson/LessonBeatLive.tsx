import { beatLabelOf, eightTextOf, LESSON_EIGHT } from '@furria/studio/lesson-copy';
import type { StepCounts } from '@furria/studio/lesson-counts';
import { cellIndexAtSeconds, eightPlaceOf } from '@furria/studio/lesson-counts';
import type { MixPlayer } from '@furria/studio/mix-player';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { countAt } from '@furria/studio/music-timeline';
import { countLabelOf } from '@furria/studio/practice-copy';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';

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
