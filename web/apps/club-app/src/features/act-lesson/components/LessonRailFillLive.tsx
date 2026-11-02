import type { MixPlayer } from '@furria/studio/mix-player';
import type { StudioStep } from '@furria/studio/studio-schemas';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { fillOf } from '@/features/act-practice/practice-controls';

interface LessonRailFillLiveProps {
  player: MixPlayer;
  step: StudioStep;
}

export const LessonRailFillLive: FC<LessonRailFillLiveProps> = ({ player, step }) => {
  const value = usePlaybackSelection(player, (seconds) => fillOf(step, seconds));

  return <KkLesson.RailFill value={value} />;
};
