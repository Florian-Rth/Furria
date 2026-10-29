import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, Ref } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

export interface KkStudioAVideoSource {
  video: string;
  poster: string;
}

const SCREEN = kkTokens.color.light.ink;
const SCREEN_INK = kkTokens.color.dark.ink;
const SCREEN_SUB = kkTokens.color.dark.sub;
const TAG_GLASS = `color-mix(in srgb, ${kkTokens.color.light.ink} 62%, transparent)`;
const MIRROR_SECONDS = 0.32;

const tagPaint: CSSObject = {
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1,
  color: SCREEN_INK,
  backgroundColor: TAG_GLASS,
  backdropFilter: 'blur(6px)',
  borderRadius: `${kkTokens.radius.chip}px`,
  px: 1,
  py: 0.5,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
};

interface KkStudioAVideoProps {
  label: string;
  source: KkStudioAVideoSource | null;
  videoRef: Ref<HTMLVideoElement>;
  mirrored: boolean;
  caption: string | null;
  mirrorLabel: string;
  emptyLabel: string;
  sx?: KkSx;
}

export const KkStudioAVideo: FC<KkStudioAVideoProps> = ({
  label,
  source,
  videoRef,
  mirrored,
  caption,
  mirrorLabel,
  emptyLabel,
  sx,
}) => {
  const flip = mirrored ? 'scaleX(-1)' : 'none';
  const screen =
    source === null ? (
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          color: SCREEN_SUB,
        }}
      >
        {emptyLabel}
      </Typography>
    ) : (
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
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: flip,
          transition: `transform ${MIRROR_SECONDS}s cubic-bezier(.2,.8,.2,1)`,
        }}
      />
    );
  const captionTag =
    caption === null ? null : (
      <Box component="span" sx={tagPaint}>
        {caption}
      </Box>
    );
  const mirrorTag =
    mirrored && source !== null ? (
      <Box component="span" sx={tagPaint}>
        {mirrorLabel}
      </Box>
    ) : null;

  return (
    <Box
      data-kk-studio-a-video
      sx={[
        {
          position: 'relative',
          width: '100%',
          aspectRatio: { xs: '16 / 9', desktop: 'auto' },
          height: { desktop: '100%' },
          minHeight: { desktop: '12rem' },
          backgroundColor: SCREEN,
          borderRadius: `${kkTokens.radius.base}px`,
          overflow: 'clip',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {screen}
      <Stack
        direction="row"
        sx={{
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 8,
          gap: 0.5,
          pointerEvents: 'none',
          minWidth: 0,
        }}
      >
        {captionTag}
        {mirrorTag}
      </Stack>
    </Box>
  );
};
