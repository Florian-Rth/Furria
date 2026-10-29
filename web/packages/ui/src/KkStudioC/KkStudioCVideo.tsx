import Box from '@mui/material/Box';
import type { FC, Ref } from 'react';
import type { KkSx } from '../kk-sx';

export type KkStudioCVideoFit = 'cover' | 'contain';

interface KkStudioCVideoProps {
  videoRef: Ref<HTMLVideoElement>;
  source: string;
  poster: string;
  label: string;
  mirrored: boolean;
  fit: KkStudioCVideoFit;
  sx?: KkSx;
}

export const KkStudioCVideo: FC<KkStudioCVideoProps> = ({
  videoRef,
  source,
  poster,
  label,
  mirrored,
  fit,
  sx,
}) => {
  const flip = mirrored ? 'scaleX(-1)' : 'none';

  return (
    <Box
      component="video"
      ref={videoRef}
      src={source}
      poster={poster}
      aria-label={label}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      data-kk-studio-c-video
      sx={[
        {
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: fit,
          backgroundColor: 'film.base',
          transform: flip,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};
