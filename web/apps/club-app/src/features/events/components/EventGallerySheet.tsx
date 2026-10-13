import { useKkSheet } from '@furria/ui';
import type { FC } from 'react';
import type { GalleryPhoto } from '@/features/gallery-pick';
import { GalleryPickSheet, usePickableAlbumsQuery } from '@/features/gallery-pick';
import {
  EVENT_GALLERY_EMPTY,
  EVENT_GALLERY_NOTE,
  EVENT_GALLERY_SHEET_ID,
  EVENT_GALLERY_TITLE,
} from '../event-picture-copy';

interface EventGallerySheetProps {
  onPick: (photo: GalleryPhoto) => void;
}

export const EventGallerySheet: FC<EventGallerySheetProps> = ({ onPick }) => {
  const { openSheetId } = useKkSheet();
  const albums = usePickableAlbumsQuery(openSheetId === EVENT_GALLERY_SHEET_ID);

  return (
    <GalleryPickSheet
      id={EVENT_GALLERY_SHEET_ID}
      title={EVENT_GALLERY_TITLE}
      note={EVENT_GALLERY_NOTE}
      emptyNote={EVENT_GALLERY_EMPTY}
      albums={albums.data ?? []}
      onPick={onPick}
    />
  );
};
