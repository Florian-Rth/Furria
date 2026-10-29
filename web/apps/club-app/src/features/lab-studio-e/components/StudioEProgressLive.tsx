import type { KkStudioETransportShare } from '@furria/ui/KkStudioETransport';
import { KkStudioETransport } from '@furria/ui/KkStudioETransport';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { STUDIO_E_PROGRESS_LABEL } from '../studio-e-copy';

interface StudioEProgressLiveProps {
  player: MixPlayer;
  length: number;
  stops: readonly KkStudioETransportShare[];
  loop: KkStudioETransportShare | null;
  onSeek: (share: number) => void;
}

export const StudioEProgressLive: FC<StudioEProgressLiveProps> = ({
  player,
  length,
  stops,
  loop,
  onSeek,
}) => {
  const seconds = usePlaybackSeconds(player);
  const value = length > 0 ? seconds / length : 0;

  return (
    <KkStudioETransport.Progress
      value={value}
      stops={stops}
      loop={loop}
      label={STUDIO_E_PROGRESS_LABEL}
      onSeek={onSeek}
    />
  );
};
