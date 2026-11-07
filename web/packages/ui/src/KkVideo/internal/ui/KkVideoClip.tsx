import Box from '@mui/material/Box';
import type { FC } from 'react';

const OFFSET_DIGITS = 2;

interface KkVideoClipProps {
  label: string;
  source: string;
  poster: string;
  offsetSeconds: number;
}

export const KkVideoClip: FC<KkVideoClipProps> = ({ label, source, poster, offsetSeconds }) => {
  const fragment = `${source}#t=${Math.max(0, offsetSeconds).toFixed(OFFSET_DIGITS)}`;

  return (
    <Box
      component="video"
      key={fragment}
      aria-label={label}
      controls
      playsInline
      preload="none"
      poster={poster}
      src={fragment}
      data-kk-video-clip
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
};
