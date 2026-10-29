import { KkStudioAStrip } from '@furria/ui/KkStudioAStrip';
import type { FC, PropsWithChildren } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { shareOf } from '../studio-a-format';

interface StudioAPlayedProps extends PropsWithChildren {
  player: MixPlayer;
  length: number;
}

export const StudioAPlayed: FC<StudioAPlayedProps> = ({ player, length, children }) => {
  const share = shareOf(usePlaybackSeconds(player), length);

  return <KkStudioAStrip.Played fraction={share}>{children}</KkStudioAStrip.Played>;
};
