import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkImageSource } from '../image-source';
import type { KkGroupTone } from '../internal/group-tone';
import { KkCoverPicture } from '../KkCoverPicture';
import { KkPhotoPlaceholder } from '../KkPhotoPlaceholder';
import type { KkSx } from '../kk-sx';
import type { KkEventPictureScale } from './internal/ui/KkEventPictureStamp';
import { KkEventPictureStamp } from './internal/ui/KkEventPictureStamp';

const INHERITED_CORNERS = { borderRadius: 'inherit' } as const;
const CANCELLED_PHOTO = { borderRadius: 'inherit', filter: 'grayscale(0.85)' } as const;

interface KkEventPictureProps {
  image: KkImageSource | null;
  tone: KkGroupTone;
  cancelledLabel?: string | null;
  scale?: KkEventPictureScale;
  priority?: boolean;
  sx?: KkSx;
}

export const KkEventPicture: FC<KkEventPictureProps> = ({
  image,
  tone,
  cancelledLabel = null,
  scale = 'card',
  priority = false,
  sx,
}) => {
  const isCancelled = cancelledLabel !== null;
  const photoPaint = isCancelled ? CANCELLED_PHOTO : INHERITED_CORNERS;
  const face =
    image === null ? (
      <KkPhotoPlaceholder tone={tone} fill />
    ) : (
      <KkCoverPicture image={image} alt="" priority={priority} sx={photoPaint} />
    );
  const stamp = isCancelled ? <KkEventPictureStamp label={cancelledLabel} scale={scale} /> : null;

  return (
    <Box
      data-kk-event-picture
      sx={[
        { position: 'relative', width: '100%', height: '100%', minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {face}
      {stamp}
    </Box>
  );
};
