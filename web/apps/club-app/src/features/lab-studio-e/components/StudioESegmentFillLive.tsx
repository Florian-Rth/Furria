import { KkStudioESegments } from '@furria/ui/KkStudioESegments';
import type { FC } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioStep } from '@/features/acts/schemas';
import { fillOf } from '../studio-e-controls';

interface StudioESegmentFillLiveProps {
  player: MixPlayer;
  step: StudioStep;
  current: boolean;
}

export const StudioESegmentFillLive: FC<StudioESegmentFillLiveProps> = ({
  player,
  step,
  current,
}) => {
  const value = usePlaybackSelection(player, (seconds) => fillOf(step, seconds));

  return <KkStudioESegments.Fill value={value} current={current} />;
};
