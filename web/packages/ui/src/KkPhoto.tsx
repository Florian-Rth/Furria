import Box from '@mui/material/Box';
import type { CSSObject, SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkImageSource } from './image-source';
import type { KkGroupTone } from './internal/group-tone';
import type { KkPhotoStampScale } from './internal/KkPhotoStamp';
import { KkPhotoStamp } from './internal/KkPhotoStamp';
import { KkImage } from './KkImage';
import { KkPhotoPlaceholder } from './KkPhotoPlaceholder';
import type { KkPhotoOrientation } from './photo-frame';
import { resolvePhotoFrame } from './photo-frame';
import { kkTokens } from './tokens';

export type KkPhotoFit = 'cover' | 'contain';
export type KkPhotoSize = 'full' | 'thumb';

const STAMPED_FILTER = 'grayscale(0.85)';
const DIMMED_FILTER = 'grayscale(1)';

interface PhotoFrame {
  fill: boolean;
  size: KkPhotoSize;
  aspectRatio: string;
  dimmed: boolean;
}

const sizePaint = (theme: Theme, frame: PhotoFrame): CSSObject => {
  if (frame.fill) {
    return { width: '100%', height: '100%', borderRadius: 'inherit' };
  }
  if (frame.size === 'thumb') {
    return {
      width: theme.spacing(8),
      flexShrink: 0,
      aspectRatio: frame.aspectRatio,
      borderRadius: theme.spacing(1),
    };
  }

  return { width: '100%', aspectRatio: frame.aspectRatio, borderRadius: `${kkTokens.radius.base}px` };
};

const framePaint = (theme: Theme, frame: PhotoFrame): CSSObject => ({
  position: 'relative',
  minWidth: 0,
  overflow: 'hidden',
  ...sizePaint(theme, frame),
  ...(frame.dimmed ? { filter: DIMMED_FILTER, opacity: kkTokens.opacity.dimmed } : {}),
});

const imagePaint = (fit: KkPhotoFit, stamped: boolean): CSSObject => ({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: fit,
  filter: stamped ? STAMPED_FILTER : 'none',
});

interface KkPhotoProps {
  alt: string;
  image?: KkImageSource | null;
  orientation?: KkPhotoOrientation;
  aspectRatio?: string;
  fill?: boolean;
  size?: KkPhotoSize;
  fit?: KkPhotoFit;
  priority?: boolean;
  placeholderLabel?: string;
  tint?: string;
  tone?: KkGroupTone;
  stampLabel?: string | null;
  stampScale?: KkPhotoStampScale;
  dimmed?: boolean;
  sx?: SxProps<Theme>;
}

export const KkPhoto: FC<KkPhotoProps> = ({
  alt,
  image,
  orientation = 'landscape',
  aspectRatio,
  fill = false,
  size = 'full',
  fit = 'cover',
  priority = false,
  placeholderLabel,
  tint,
  tone,
  stampLabel = null,
  stampScale = 'card',
  dimmed = false,
  sx,
}) => {
  const frame = resolvePhotoFrame(orientation);
  const photoFrame = { fill, size, aspectRatio: aspectRatio ?? frame.aspectRatio, dimmed };
  const isStamped = stampLabel !== null && !dimmed;
  const loading = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';
  const face =
    image === undefined || image === null ? (
      <KkPhotoPlaceholder label={placeholderLabel} tint={tint} tone={tone} fill />
    ) : (
      <KkImage
        src={image.src}
        srcSet={image.srcSet}
        sizes={image.sizes}
        alt={alt}
        width={frame.width}
        height={frame.height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        sx={imagePaint(fit, isStamped)}
      />
    );
  const stamp = isStamped ? <KkPhotoStamp label={stampLabel} scale={stampScale} /> : null;

  return (
    <Box
      data-kk-photo
      sx={[
        (theme: Theme) => framePaint(theme, photoFrame),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {face}
      {stamp}
    </Box>
  );
};
