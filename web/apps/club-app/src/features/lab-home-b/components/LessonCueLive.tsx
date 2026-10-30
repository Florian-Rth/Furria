import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { cueTextOf } from '@/features/act-practice/practice-copy';
import { cueOf, ownWayAt } from '@/features/act-practice/practice-way';
import { cueLabelOf } from '../lesson-copy';
import { cueCountOf, cueOfCount } from '../lesson-picture';

interface LessonCueLiveProps {
  player: MixPlayer;
  ownPath: SpotPath | null;
  marks: readonly CountMark[];
  loop: TimelineRange | null;
}

export const LessonCueLive: FC<LessonCueLiveProps> = ({ player, ownPath, marks, loop }) => {
  const count = usePlaybackSelection(player, (seconds) =>
    ownPath === null ? null : cueCountOf(cueOf(ownWayAt(ownPath.keyframes, marks, seconds, loop))),
  );
  const cue = cueOfCount(count);
  const text = cue === null ? null : cueTextOf(cue);
  const tone = cue?.tone ?? 'soon';
  const label = cueLabelOf(cue);

  return <KkLesson.Cue text={text} tone={tone} label={label} />;
};
