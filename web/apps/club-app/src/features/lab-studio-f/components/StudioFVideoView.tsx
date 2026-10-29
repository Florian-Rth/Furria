import { KkStudioFVideo } from '@furria/ui/KkStudioFVideo';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioVideo } from '@/features/acts/schemas';
import { useStudioFVideo } from '../hooks/use-studio-f-video';
import { STUDIO_F_VIDEO_LABEL } from '../studio-f-copy';

interface StudioFVideoViewProps {
  player: MixPlayer;
  video: StudioVideo;
  mirrored: boolean;
}

export const StudioFVideoView: FC<StudioFVideoViewProps> = ({ player, video, mirrored }) => {
  const ref = useStudioFVideo(player, video);

  return (
    <KkStudioFVideo
      videoRef={ref}
      source={video.urls.video}
      poster={video.urls.poster}
      label={video.name ?? STUDIO_F_VIDEO_LABEL}
      mirrored={mirrored}
    />
  );
};
