import Box from '@mui/material/Box';
import type { FC, RefObject } from 'react';

export interface KkVideoSource {
  video: string;
  poster: string;
}

export type KkVideoFocus = 'centre' | 'top';

interface KkVideoPictureProps {
  label: string;
  source: KkVideoSource | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  mirrored: boolean;
  focus: KkVideoFocus;
}

export const KkVideoPicture: FC<KkVideoPictureProps> = ({
  label,
  source,
  videoRef,
  mirrored,
  focus,
}) => {
  const face = {
    transform: mirrored ? 'scaleX(-1)' : 'none',
    visibility: source === null ? 'hidden' : 'inherit',
  } as const;
  const objectPosition = focus === 'top' ? 'center top' : 'center';

  return (
    <Box
      component="video"
      ref={videoRef}
      src={source?.video}
      poster={source?.poster}
      aria-label={label}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      data-kk-video-picture
      style={face}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition,
        pointerEvents: 'none',
      }}
    />
  );
};
