import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkPhotoPlaceholder } from './KkPhotoPlaceholder';
import type { KkPhotoOrientation } from './photo-frame';
import { resolvePhotoFrame } from './photo-frame';
import { kkTokens } from './tokens';

interface KkPhotoProps {
  alt: string;
  orientation: KkPhotoOrientation;
  placeholderLabel: string;
  source?: string;
  sx?: SxProps<Theme>;
}

export const KkPhoto: FC<KkPhotoProps> = ({ alt, orientation, placeholderLabel, source, sx }) => {
  const frame = resolvePhotoFrame(orientation);

  return (
    <Box
      data-kk-photo
      sx={[
        {
          width: '100%',
          aspectRatio: frame.aspectRatio,
          borderRadius: `${kkTokens.radius.base}px`,
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {source === undefined ? (
        <KkPhotoPlaceholder label={placeholderLabel} fill />
      ) : (
        <Box
          component="img"
          src={source}
          alt={alt}
          width={frame.width}
          height={frame.height}
          loading="lazy"
          decoding="async"
          sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </Box>
  );
};
