import Box from '@mui/material/Box';
import type { FC, RefObject } from 'react';

export interface KkPracticeScreenVideoSource {
  video: string;
  poster: string;
}

interface KkPracticeScreenVideoProps {
  source: KkPracticeScreenVideoSource | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  mirrored: boolean;
}

export const KkPracticeScreenVideo: FC<KkPracticeScreenVideoProps> = ({
  source,
  videoRef,
  mirrored,
}) => {
  const face = {
    transform: mirrored ? 'scaleX(-1)' : 'none',
    visibility: source === null ? 'hidden' : 'inherit',
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
      data-kk-practice-video
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
