import { KkStudioEVideo } from '@furria/ui/KkStudioEVideo';
import type { FC } from 'react';
import type { StudioEVideo } from '../hooks/use-studio-e-video';
import {
  STUDIO_E_CLOSE,
  STUDIO_E_MIRRORED,
  STUDIO_E_NO_VIDEO,
  STUDIO_E_VIDEO_TITLE,
} from '../studio-e-copy';

interface StudioEVideoLayerProps {
  video: StudioEVideo;
}

export const StudioEVideoLayer: FC<StudioEVideoLayerProps> = ({ video }) => {
  const title = video.caption ?? STUDIO_E_VIDEO_TITLE;

  return (
    <KkStudioEVideo open={video.open} label={STUDIO_E_VIDEO_TITLE}>
      <KkStudioEVideo.Head>
        <KkStudioEVideo.Title text={title} />
        <KkStudioEVideo.Mirror
          text={STUDIO_E_MIRRORED}
          mirrored={video.mirrored}
          onToggle={video.toggleMirror}
        />
        <KkStudioEVideo.Close label={STUDIO_E_CLOSE} onClose={video.close} />
      </KkStudioEVideo.Head>
      <KkStudioEVideo.Screen
        source={video.source}
        videoRef={video.ref}
        mirrored={video.mirrored}
        emptyLabel={STUDIO_E_NO_VIDEO}
      />
    </KkStudioEVideo>
  );
};
