import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { countAt } from '@/features/act-player/music-timeline';
import { countLabelOf } from '@/features/act-practice/practice-copy';

interface LessonBeatLiveProps {
  player: MixPlayer;
  segments: readonly MusicSegment[];
}

export const LessonBeatLive: FC<LessonBeatLiveProps> = ({ player, segments }) => {
  const count = usePlaybackSelection(
    player,
    (seconds) => countAt(segments, seconds)?.count ?? null,
  );
  const label = countLabelOf(count);

  return <KkLesson.Beat count={count} label={label} />;
};
