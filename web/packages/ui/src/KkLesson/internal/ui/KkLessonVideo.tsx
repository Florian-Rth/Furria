import Box from '@mui/material/Box';
import type { FC, RefObject } from 'react';
import type { KkPracticeScreenVideoSource } from '../../../KkPracticeScreen/KkPracticeScreen';

interface KkLessonVideoProps {
  label: string;
  source: KkPracticeScreenVideoSource | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  mirrored: boolean;
}

export const KkLessonVideo: FC<KkLessonVideoProps> = ({ label, source, videoRef, mirrored }) => {
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
      aria-label={label}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      data-kk-lesson-video
      style={face}
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'center top',
        pointerEvents: 'none',
      }}
    />
  );
};
