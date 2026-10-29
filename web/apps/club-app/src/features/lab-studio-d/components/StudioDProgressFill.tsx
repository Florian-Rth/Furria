import { KkStudioDPlayer } from '@furria/ui/KkStudioDPlayer';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';

interface StudioDProgressFillProps {
  player: MixPlayer;
  length: number;
}

export const StudioDProgressFill: FC<StudioDProgressFillProps> = ({ player, length }) => {
  const seconds = usePlaybackSeconds(player);
  const share = length <= 0 ? 0 : Math.min(seconds / length, 1);

  return <KkStudioDPlayer.ProgressFill share={share} />;
};
