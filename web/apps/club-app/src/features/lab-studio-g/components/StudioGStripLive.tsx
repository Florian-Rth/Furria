import { KkStudioGTimeline } from '@furria/ui/KkStudioGTimeline';
import type { FC, PropsWithChildren } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';

interface StudioGStripLiveProps extends PropsWithChildren {
  player: MixPlayer;
  pixelsPerSecond: number;
  lengthSeconds: number;
}

export const StudioGStripLive: FC<StudioGStripLiveProps> = ({
  player,
  pixelsPerSecond,
  lengthSeconds,
  children,
}) => {
  const seconds = usePlaybackSeconds(player);

  return (
    <KkStudioGTimeline.Strip
      offsetPx={seconds * pixelsPerSecond}
      pixelsPerSecond={pixelsPerSecond}
      lengthSeconds={lengthSeconds}
    >
      {children}
    </KkStudioGTimeline.Strip>
  );
};
