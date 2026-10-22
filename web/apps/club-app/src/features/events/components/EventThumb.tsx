import type { KkPictureUrls } from '@furria/ui/image-source';
import type { KkCoverThumbShape, KkCoverThumbSize } from '@furria/ui/KkCoverThumb';
import { KkCoverThumb } from '@furria/ui/KkCoverThumb';
import type { FC } from 'react';
import { toEventCover } from '@/lib/event-cover';

const THUMB_SIZES = '160px';

interface EventThumbProps {
  eventId: number;
  picture: KkPictureUrls | null;
  cancelled: boolean;
  shape?: KkCoverThumbShape;
  size?: KkCoverThumbSize;
}

export const EventThumb: FC<EventThumbProps> = ({ eventId, picture, cancelled, shape, size }) => {
  const cover = toEventCover({ eventId, picture, isCancelled: cancelled }, THUMB_SIZES);

  return (
    <KkCoverThumb
      image={cover.image}
      tone={cover.tone}
      alt=""
      shape={shape}
      size={size}
      dimmed={cancelled}
    />
  );
};
