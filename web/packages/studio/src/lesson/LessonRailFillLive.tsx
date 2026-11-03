import type { MixPlayer } from '@furria/studio/mix-player';
import { fillOf } from '@furria/studio/practice-controls';
import type { StudioStep } from '@furria/studio/studio-schemas';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { KkLesson } from '@furria/ui/KkLesson';
import type { FC } from 'react';

interface LessonRailFillLiveProps {
  player: MixPlayer;
  step: StudioStep;
}

export const LessonRailFillLive: FC<LessonRailFillLiveProps> = ({ player, step }) => {
  const value = usePlaybackSelection(player, (seconds) => fillOf(step, seconds));

  return <KkLesson.RailFill value={value} />;
};
