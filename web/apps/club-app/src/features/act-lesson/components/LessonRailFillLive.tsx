import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { fillOf } from '@/features/act-practice/practice-controls';
import type { StudioStep } from '@/features/acts/schemas';

interface LessonRailFillLiveProps {
  player: MixPlayer;
  step: StudioStep;
}

export const LessonRailFillLive: FC<LessonRailFillLiveProps> = ({ player, step }) => {
  const value = usePlaybackSelection(player, (seconds) => fillOf(step, seconds));

  return <KkLesson.RailFill value={value} />;
};
