import type { KkBannerDeskActions } from '@furria/ui';
import { centredCrop, useKkNotice, useKkSheet } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import type { GalleryPhoto } from '@/features/gallery-pick';
import { photoSizeOf } from '@/features/gallery-pick';
import { toUploadFailureMessage, toUploadOwner } from '@/features/pictures';
import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import { usePictureDesk } from '@/lib/media/use-picture-desk';
import {
  useEventPictureCropMutation,
  useEventPictureFromGalleryMutation,
  useEventPictureRemovalMutation,
  useEventQuery,
} from '../api';
import type { EventBanner } from '../event-picture';
import { toEventBanner } from '../event-picture';
import { EVENT_GALLERY_SHEET_ID } from '../event-picture-copy';
import type { EventDetails } from '../schemas';

export interface EventPictureDesk {
  banner: EventBanner;
  actions: KkBannerDeskActions;
  fileInputRef: (node: HTMLInputElement | null) => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  pickPhoto: (photo: GalleryPhoto) => void;
}

export const useEventPictureDesk = (event: EventDetails): EventPictureDesk => {
  const { eventId } = event;
  const query = useEventQuery(eventId);
  const sheet = useKkSheet();
  const raiseNotice = useKkNotice();
  const cropping = useEventPictureCropMutation();
  const removal = useEventPictureRemovalMutation();
  const galleryPick = useEventPictureFromGalleryMutation();
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const editing = event.picture;

  const announce = useDevelopingPicture({
    isDeveloping: editing?.state === 'processing',
    isStalled: editing?.isStalled ?? false,
    refresh: () => {
      void query.refetch();
    },
    changes: ['event'],
  });

  const desk = usePictureDesk({
    cutsBeforeUpload: false,
    send: (upload) =>
      upload(toUploadOwner({ kind: 'eventPicture', ownerId: eventId })).then(announce),
    saveCrop: (crop) => cropping.mutateAsync({ eventId, crop }).then(announce),
    onUploadFailed: (failure) => {
      raiseNotice({ tone: 'error', message: toUploadFailureMessage(failure) });
    },
  });
  const { state } = desk;

  const chooseFile = (): void => {
    input?.click();
  };

  const actions: KkBannerDeskActions = {
    onUpload: chooseFile,
    onGallery: () => {
      sheet.open(EVENT_GALLERY_SHEET_ID);
    },
    onRetry: state.kind === 'failed' ? desk.submit : chooseFile,
    onCrop: () => {
      if (editing?.uncroppedUrl != null) {
        desk.recrop(editing.uncroppedUrl, editing.crop);
      }
    },
    onCropDone: desk.submit,
    onCropCancel: desk.dismiss,
    onRemove: () => {
      const isLocalUpload = state.kind === 'uploading' || state.kind === 'failed';
      desk.dismiss();
      if (!isLocalUpload) {
        removal.mutate(eventId);
      }
    },
    onCropChange: desk.changeCrop,
  };

  return {
    banner: toEventBanner(editing, state),
    actions,
    fileInputRef: setInput,
    onFileChosen: (change) => {
      const file = change.target.files?.[0];
      change.target.value = '';
      if (file !== undefined) {
        desk.choose(file);
      }
    },
    pickPhoto: (photo) => {
      sheet.close();
      desk.dismiss();
      galleryPick.mutate({
        eventId,
        galleryItemId: photo.mediaItemId,
        crop: centredCrop(photoSizeOf(photo), 'banner'),
      });
    },
  };
};
