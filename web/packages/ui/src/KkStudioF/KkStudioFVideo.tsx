import Box from '@mui/material/Box';
import type { FC, Ref } from 'react';
import { kkTokens } from '../tokens';

interface KkStudioFVideoProps {
  videoRef: Ref<HTMLVideoElement>;
  source: string;
  poster: string;
  label: string;
  mirrored: boolean;
}

export const KkStudioFVideo: FC<KkStudioFVideoProps> = ({
  videoRef,
  source,
  poster,
  label,
  mirrored,
}) => {
  const flip = mirrored ? 'scaleX(-1)' : 'scaleX(1)';

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
      data-kk-studio-f-video
      sx={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        backgroundColor: kkTokens.color.dark.darkroom,
        transform: flip,
        transition: 'transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)',
        pointerEvents: 'none',
      }}
    />
  );
};
