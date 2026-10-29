import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, RefObject } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const FLIP = 'transform 420ms cubic-bezier(0.65, 0, 0.35, 1)';

const FRAME = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: `${kkTokens.radius.base}px`,
  bgcolor: kkTokens.overlay.scrimInk,
  isolation: 'isolate',
} as const;

const PICTURE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  borderRadius: `${kkTokens.radius.base}px`,
  transition: FLIP,
} as const;

const TAG = {
  position: 'absolute',
  zIndex: 1,
  px: 0.75,
  py: 0.25,
  borderRadius: `${kkTokens.radius.bar}px`,
  bgcolor: kkTokens.crop.veil,
  color: kkTokens.overlay.onPhotoText,
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  maxWidth: '70%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const NAME_TAG = (theme: Theme): CSSObject => ({
  ...TAG,
  left: theme.spacing(1),
  bottom: theme.spacing(1),
});

const MIRROR_TAG = (theme: Theme): CSSObject => ({
  ...TAG,
  right: theme.spacing(1),
  top: theme.spacing(1),
});

const emptyPaint = (theme: Theme): CSSObject => ({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'dashed',
  borderColor: (theme.vars ?? theme).palette.divider,
  color: (theme.vars ?? theme).palette.text.secondary,
  typography: 'caption',
  fontWeight: 700,
  textAlign: 'center',
});

export interface KkStudioBVideoSource {
  src: string;
  poster: string;
  name: string;
}

interface KkStudioBVideoProps {
  source: KkStudioBVideoSource | null;
  mirrored: boolean;
  mirroredLabel: string;
  emptyLabel: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  sx?: KkSx;
}

export const KkStudioBVideo: FC<KkStudioBVideoProps> = ({
  source,
  mirrored,
  mirroredLabel,
  emptyLabel,
  videoRef,
  sx,
}) => {
  const callerSx = Array.isArray(sx) ? sx : [sx];

  if (source === null) {
    return (
      <Box data-kk-studio-b-video="none" sx={[emptyPaint, ...callerSx]}>
        {emptyLabel}
      </Box>
    );
  }

  const flip = { transform: mirrored ? 'scaleX(-1)' : 'scaleX(1)' };
  const mirrorTag = mirrored ? (
    <Box component="span" sx={MIRROR_TAG}>
      {mirroredLabel}
    </Box>
  ) : null;

  return (
    <Box data-kk-studio-b-video="playing" sx={[FRAME, ...callerSx]}>
      <Box
        component="video"
        ref={videoRef}
        src={source.src}
        poster={source.poster}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        style={flip}
        sx={PICTURE}
      />
      <Box component="span" sx={NAME_TAG}>
        {source.name}
      </Box>
      {mirrorTag}
    </Box>
  );
};
