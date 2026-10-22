import { centredCrop } from '@furria/ui/image-crop';
import { useKkSheet } from '@furria/ui/sheet-store';
import { photoSizeOf } from '@/features/gallery-pick/gallery-photo';
import type { GalleryPhoto } from '@/features/gallery-pick/schemas';
import type { PictureSectionDesk } from '@/features/pictures/hooks/use-picture-section';
import { usePictureSection } from '@/features/pictures/hooks/use-picture-section';
import { useEventPictureFromGalleryMutation, useEventQuery } from '../api';
import { EVENT_GALLERY_SHEET_ID } from '../event-picture-copy';
import type { EventDetails } from '../schemas';

export interface EventPictureDesk {
  section: PictureSectionDesk;
  pickPhoto: (photo: GalleryPhoto) => void;
}

export const useEventPictureDesk = (event: EventDetails): EventPictureDesk => {
  const { eventId } = event;
  const query = useEventQuery(eventId);
  const sheet = useKkSheet();
  const galleryPick = useEventPictureFromGalleryMutation();

  const section = usePictureSection({
    target: { kind: 'eventPicture', ownerId: eventId },
    editing: event.picture,
    refresh: () => {
      void query.refetch();
    },
    onGallery: () => {
      sheet.open(EVENT_GALLERY_SHEET_ID);
    },
  });

  return {
    section,
    pickPhoto: (photo) => {
      sheet.close();
      section.dismiss();
      galleryPick.mutate({
        eventId,
        galleryItemId: photo.mediaItemId,
        crop: centredCrop(photoSizeOf(photo), 'banner'),
      });
    },
  };
};
