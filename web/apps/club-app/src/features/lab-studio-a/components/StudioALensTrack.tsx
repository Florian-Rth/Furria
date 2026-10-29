import { KkStudioALens } from '@furria/ui/KkStudioALens';
import type { FC, PropsWithChildren } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';

interface StudioALensTrackProps extends PropsWithChildren {
  player: MixPlayer;
  pixelsPerSecond: number;
  width: number;
}

export const StudioALensTrack: FC<StudioALensTrackProps> = ({
  player,
  pixelsPerSecond,
  width,
  children,
}) => {
  const offset = usePlaybackSeconds(player) * pixelsPerSecond;

  return (
    <KkStudioALens.Track offset={offset} width={width}>
      {children}
    </KkStudioALens.Track>
  );
};
