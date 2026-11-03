import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const OFFSET_DIGITS = 2;

interface KkScoreVideoProps {
  label: string;
  source: string;
  poster: string;
  offsetSeconds: number;
  sx?: KkSx;
}

export const KkScoreVideo: FC<KkScoreVideoProps> = ({
  label,
  source,
  poster,
  offsetSeconds,
  sx,
}) => {
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
      data-kk-score-video
      sx={[
        {
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 9',
          objectFit: 'contain',
          bgcolor: 'common.black',
          borderRadius: `${kkTokens.radius.base}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};
