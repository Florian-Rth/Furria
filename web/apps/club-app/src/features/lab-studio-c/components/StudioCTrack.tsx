import { KkStudioCTimeline } from '@furria/ui/KkStudioCTimeline';
import type { FC, PropsWithChildren } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { MixPlayer } from '@/features/act-player/mix-player';
import { trackShiftOf } from '../studio-c-timeline';

interface StudioCTrackProps extends PropsWithChildren {
  player: MixPlayer;
  pixelsPerSecond: number;
  trackWidth: number;
  viewportWidth: number;
}

export const StudioCTrack: FC<StudioCTrackProps> = ({
  player,
  pixelsPerSecond,
  trackWidth,
  viewportWidth,
  children,
}) => {
  const seconds = usePlaybackSeconds(player);
  const shift = trackShiftOf(seconds, pixelsPerSecond, viewportWidth);

  return (
    <KkStudioCTimeline.Track width={trackWidth} shift={shift}>
      {children}
    </KkStudioCTimeline.Track>
  );
};
