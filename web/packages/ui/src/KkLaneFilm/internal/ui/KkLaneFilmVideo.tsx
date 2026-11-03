import Box from '@mui/material/Box';
import type { FC, RefObject } from 'react';

export interface KkLaneFilmSource {
  video: string;
  poster: string;
}

interface KkLaneFilmVideoProps {
  source: KkLaneFilmSource | null;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export const KkLaneFilmVideo: FC<KkLaneFilmVideoProps> = ({ source, videoRef }) => {
  const face = { visibility: source === null ? 'hidden' : 'inherit' } as const;

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
      data-kk-lane-film-video
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
