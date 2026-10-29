import { KkStudioAStrip } from '@furria/ui/KkStudioAStrip';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { shareOf } from '../studio-a-format';

interface StudioAPlayheadProps {
  player: MixPlayer;
  length: number;
}

export const StudioAPlayhead: FC<StudioAPlayheadProps> = ({ player, length }) => {
  const share = shareOf(usePlaybackSeconds(player), length);

  return <KkStudioAStrip.Head fraction={share} />;
};
