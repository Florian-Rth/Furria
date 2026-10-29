import Box from '@mui/material/Box';
import type { FC, RefObject } from 'react';

export interface KkStudioEScreenVideoSource {
  video: string;
  poster: string;
}

interface KkStudioEScreenVideoProps {
  source: KkStudioEScreenVideoSource | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  mirrored: boolean;
}

export const KkStudioEScreenVideo: FC<KkStudioEScreenVideoProps> = ({
  source,
  videoRef,
  mirrored,
}) => {
  const face = {
    transform: mirrored ? 'scaleX(-1)' : 'none',
    visibility: source === null ? 'hidden' : 'visible',
  } as const;

  return (
    <Box
      component="video"
      ref={videoRef}
      src={source?.video}
      poster={source?.poster}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      data-kk-studio-e-video
      style={face}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        pointerEvents: 'none',
      }}
    />
  );
};
