import type { KkStudioCVideoFit } from '@furria/ui/KkStudioCVideo';
import { KkStudioCVideo } from '@furria/ui/KkStudioCVideo';
import type { FC } from 'react';
import { useRef } from 'react';
import { useSlavedVideo } from '@/features/act-player/hooks/use-slaved-video';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioVideo } from '@/features/acts/schemas';
import { STUDIO_C_VIDEO_LABEL } from '../studio-c-copy';

interface StudioCVideoLayerProps {
  player: MixPlayer;
  video: StudioVideo;
  mirrored: boolean;
  fit: KkStudioCVideoFit;
}

export const StudioCVideoLayer: FC<StudioCVideoLayerProps> = ({ player, video, mirrored, fit }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useSlavedVideo(player, video, ref);

  return (
    <KkStudioCVideo
      videoRef={ref}
      source={video.urls.video}
      poster={video.urls.poster}
      label={video.name ?? STUDIO_C_VIDEO_LABEL}
      mirrored={mirrored}
      fit={fit}
    />
  );
};
