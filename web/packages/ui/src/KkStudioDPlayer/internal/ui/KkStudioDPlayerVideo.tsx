import Box from '@mui/material/Box';
import type { FC, Ref } from 'react';

const MIRROR_SECONDS = 0.5;

export interface KkStudioDPlayerVideoSource {
  video: string;
  poster: string;
}

interface KkStudioDPlayerVideoProps {
  label: string;
  source: KkStudioDPlayerVideoSource | null;
  videoRef: Ref<HTMLVideoElement>;
  mirrored: boolean;
}

export const KkStudioDPlayerVideo: FC<KkStudioDPlayerVideoProps> = ({
  label,
  source,
  videoRef,
  mirrored,
}) => {
  if (source === null) {
    return null;
  }

  return (
    <Box
      key={source.video}
      component="video"
      ref={videoRef}
      src={source.video}
      poster={source.poster}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-label={label}
      data-kk-studio-d-video={mirrored ? 'mirrored' : 'straight'}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: mirrored ? 'scaleX(-1)' : 'none',
        transition: `transform ${MIRROR_SECONDS}s cubic-bezier(.2,.8,.2,1)`,
      }}
    />
  );
};
