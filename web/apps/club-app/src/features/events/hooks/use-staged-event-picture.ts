import type { KkBannerDeskActions, KkCrop } from '@furria/ui';
import { centredCrop, useKkNotice, useKkSheet } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';
import type { GalleryPhoto } from '@/features/gallery-pick';
import { photoSizeOf } from '@/features/gallery-pick';
import { toUploadOwner } from '@/features/pictures';
import { startUpload } from '@/lib/media/start-upload';
import { useEventPictureFromGalleryMutation } from '../api';
import { EVENT_GALLERY_SHEET_ID } from '../event-picture-copy';
import type {
  StagedEventPicture,
  StagedPictureBanner,
  StagedPictureSource,
} from '../staged-event-picture';
import { toStagedPictureBanner } from '../staged-event-picture';

const SEND_FAILED_MESSAGE =
  'Die Veranstaltung steht, aber das Bild kam nicht an. Setz es auf der Seite der Veranstaltung noch einmal.';

export interface StagedEventPictureDesk {
  banner: StagedPictureBanner;
  actions: KkBannerDeskActions;
  fileInputRef: (node: HTMLInputElement | null) => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  pickPhoto: (photo: GalleryPhoto) => void;
  sendTo: (eventId: number) => Promise<void>;
}

export const useStagedEventPicture = (): StagedEventPictureDesk => {
  const sheet = useKkSheet();
  const raiseNotice = useKkNotice();
  const galleryPick = useEventPictureFromGalleryMutation();
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [staged, setStaged] = useState<StagedEventPicture | null>(null);

  const fileSource = staged?.file === null ? null : (staged?.source ?? null);
  useEffect(
    () => (fileSource === null ? undefined : () => URL.revokeObjectURL(fileSource)),
    [fileSource],
  );

  const chooseFile = (): void => {
    input?.click();
  };

  const stage = (next: StagedPictureSource, draft: KkCrop | null): void => {
    setStaged({ ...next, crop: null, draft, isCropping: true });
  };

  const actions: KkBannerDeskActions = {
    onUpload: chooseFile,
    onGallery: () => {
      sheet.open(EVENT_GALLERY_SHEET_ID);
    },
    onRetry: chooseFile,
    onCrop: () => {
      setStaged((held) => (held === null ? null : { ...held, draft: held.crop, isCropping: true }));
    },
    onCropDone: () => {
      setStaged((held) =>
        held === null || held.draft === null
          ? held
          : { ...held, crop: held.draft, isCropping: false },
      );
    },
    onCropCancel: () => {
      setStaged((held) =>
        held === null || held.crop === null
          ? null
          : { ...held, draft: held.crop, isCropping: false },
      );
    },
    onRemove: () => {
      setStaged(null);
    },
    onCropChange: (crop) => {
      setStaged((held) => (held === null ? null : { ...held, draft: crop }));
    },
  };

  const sendFile = async (file: File, eventId: number, crop: KkCrop): Promise<void> => {
    const owner = toUploadOwner({ kind: 'eventPicture', ownerId: eventId });
    const outcome = await startUpload({ file, owner, crop }).done;

    if (outcome.kind !== 'sent') {
      throw new Error(outcome.kind);
    }
  };

  const send = (held: StagedEventPicture, eventId: number, crop: KkCrop): Promise<void> => {
    if (held.file !== null) {
      return sendFile(held.file, eventId, crop);
    }
    if (held.galleryItemId !== null) {
      return galleryPick.mutateAsync({ eventId, galleryItemId: held.galleryItemId, crop });
    }

    return Promise.resolve();
  };

  return {
    banner: toStagedPictureBanner(staged),
    actions,
    fileInputRef: setInput,
    onFileChosen: (change) => {
      const file = change.target.files?.[0];
      change.target.value = '';
      if (file !== undefined) {
        stage({ source: URL.createObjectURL(file), file, galleryItemId: null }, null);
      }
    },
    pickPhoto: (photo) => {
      sheet.close();
      stage(
        { source: photo.urls.small, file: null, galleryItemId: photo.mediaItemId },
        centredCrop(photoSizeOf(photo), 'banner'),
      );
    },
    sendTo: async (eventId) => {
      if (staged === null || staged.crop === null) {
        return;
      }
      try {
        await send(staged, eventId, staged.crop);
      } catch {
        raiseNotice({ tone: 'error', message: SEND_FAILED_MESSAGE });
      }
    },
  };
};
