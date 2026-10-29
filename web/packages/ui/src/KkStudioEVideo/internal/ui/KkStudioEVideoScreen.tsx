import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC, RefObject } from 'react';
import { kkTokens } from '../../../tokens';

export interface KkStudioEVideoSource {
  video: string;
  poster: string;
}

const INNER_RADIUS = kkTokens.radius.base - 4;

interface KkStudioEVideoScreenProps {
  source: KkStudioEVideoSource | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  mirrored: boolean;
  emptyLabel: string;
}

export const KkStudioEVideoScreen: FC<KkStudioEVideoScreenProps> = ({
  source,
  videoRef,
  mirrored,
  emptyLabel,
}) => {
  const face = {
    transform: mirrored ? 'scaleX(-1)' : 'none',
    visibility: source === null ? 'hidden' : 'visible',
  } as const;
  const videoUrl = source?.video;
  const posterUrl = source?.poster;
  const empty =
    source === null ? (
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          px: 3,
          textAlign: 'center',
          color: kkTokens.overlay.onPhotoText,
          opacity: kkTokens.opacity.dimmed,
        }}
      >
        {emptyLabel}
      </Typography>
    ) : null;

  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        borderRadius: `${INNER_RADIUS}px`,
        overflow: 'clip',
        backgroundColor: kkTokens.overlay.scrimInk,
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        style={face}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      {empty}
    </Box>
  );
};
