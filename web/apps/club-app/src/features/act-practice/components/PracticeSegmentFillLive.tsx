import { KkPracticeSegments } from '@furria/ui/KkPracticeSegments';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioStep } from '@/features/acts/schemas';
import { fillOf } from '../practice-controls';

interface PracticeSegmentFillLiveProps {
  player: MixPlayer;
  step: StudioStep;
  current: boolean;
}

export const PracticeSegmentFillLive: FC<PracticeSegmentFillLiveProps> = ({
  player,
  step,
  current,
}) => {
  const value = usePlaybackSelection(player, (seconds) => fillOf(step, seconds));

  return <KkPracticeSegments.Fill value={value} current={current} />;
};
