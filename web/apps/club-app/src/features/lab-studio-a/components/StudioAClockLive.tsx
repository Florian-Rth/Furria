import { KkStudioAClock } from '@furria/ui/KkStudioAClock';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { clockOf, minuteOf } from '../studio-a-format';

interface StudioAClockLiveProps {
  player: MixPlayer;
  length: number;
}

export const StudioAClockLive: FC<StudioAClockLiveProps> = ({ player, length }) => {
  const now = clockOf(usePlaybackSeconds(player));
  const total = minuteOf(length);

  return <KkStudioAClock now={now} total={total} />;
};
