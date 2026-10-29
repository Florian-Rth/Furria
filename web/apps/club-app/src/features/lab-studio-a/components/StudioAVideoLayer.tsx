import { KkStudioAFold } from '@furria/ui/KkStudioAFold';
import { KkStudioAVideo } from '@furria/ui/KkStudioAVideo';
import type { FC } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { useStudioAVideo } from '../hooks/use-studio-a-video';
import { STUDIO_A_MIRRORED, STUDIO_A_NO_VIDEO, STUDIO_A_VIDEO_LABEL } from '../studio-a-copy';

interface StudioAVideoLayerProps {
  studio: Studio;
  playback: StudioPlayback;
  mirrored: boolean;
}

export const StudioAVideoLayer: FC<StudioAVideoLayerProps> = ({ studio, playback, mirrored }) => {
  const video = useStudioAVideo(studio, playback);

  return (
    <KkStudioAFold open={video.shown}>
      <KkStudioAVideo
        label={STUDIO_A_VIDEO_LABEL}
        source={video.source}
        videoRef={video.ref}
        mirrored={mirrored}
        caption={video.caption}
        mirrorLabel={STUDIO_A_MIRRORED}
        emptyLabel={STUDIO_A_NO_VIDEO}
      />
    </KkStudioAFold>
  );
};
