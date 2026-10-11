import type { KkCrop } from '@furria/ui';
import { useKkNotice, useKkSheet } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { toUploadFailureMessage } from '@/features/pictures';
import { usePictureDesk } from '@/lib/media/use-picture-desk';
import { useNewsPictureCrop, useNewsPictureFromGallery, useNewsPictureRemoval } from '../api';
import { GALLERY_SHEET_ID, PICTURE_ACTION_FAILED } from '../editor-copy';
import { centredBannerCropOf, uploadOverlayOf } from '../news-picture';
import type { GalleryPhoto } from '../schemas';
import type { NewsPicture } from '../types';
import type { NewsEditor } from './use-news-editor';

export interface NewsPictureDesk {
  picture: NewsPicture | null;
  isCropping: boolean;
  fileInputRef: (node: HTMLInputElement | null) => void;
  chooseFile: () => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  openGallery: () => void;
  pickPhoto: (photo: GalleryPhoto) => void;
  startCrop: () => void;
  onCropChange: (crop: KkCrop) => void;
  finishCrop: () => void;
  cancelCrop: () => void;
  remove: () => void;
  retry: () => void;
}

export const useNewsPicture = (editor: NewsEditor): NewsPictureDesk => {
  const sheet = useKkSheet();
  const raiseNotice = useKkNotice();
  const cropping = useNewsPictureCrop();
  const removal = useNewsPictureRemoval();
  const galleryPick = useNewsPictureFromGallery();
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const picture = editor.version.picture;

  const failNotice = (): void => {
    raiseNotice({ tone: 'error', message: PICTURE_ACTION_FAILED });
  };

  const desk = usePictureDesk({
    cutsBeforeUpload: false,
    send: (upload) =>
      editor.settlePicture((newsPostId) => upload({ kind: 'news', id: newsPostId })),
    saveCrop: (crop) =>
      editor.settlePicture((newsPostId) => cropping.mutateAsync({ newsPostId, crop })),
    onChange: (state) => {
      editor.showUpload(uploadOverlayOf(state));
    },
    onUploadFailed: (failure) => {
      raiseNotice({ tone: 'error', message: toUploadFailureMessage(failure) });
    },
    onSaveFailed: failNotice,
  });
  const isLocalUpload = desk.state.kind === 'uploading' || desk.state.kind === 'failed';

  return {
    picture,
    isCropping: desk.state.kind === 'cropping',
    fileInputRef: setInput,
    chooseFile: () => {
      input?.click();
    },
    onFileChosen: (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file !== undefined) {
        desk.choose(file);
      }
    },
    openGallery: () => {
      sheet.open(GALLERY_SHEET_ID);
    },
    pickPhoto: (photo) => {
      sheet.close();
      desk.dismiss();
      editor
        .settlePicture((newsPostId) =>
          galleryPick.mutateAsync({
            newsPostId,
            galleryItemId: photo.mediaItemId,
            crop: centredBannerCropOf(photo.width, photo.height),
          }),
        )
        .catch(failNotice);
    },
    startCrop: () => {
      const source = picture?.uncroppedSource ?? picture?.source ?? null;
      if (source !== null) {
        desk.recrop(source, picture?.crop ?? null);
      }
    },
    onCropChange: desk.changeCrop,
    finishCrop: desk.submit,
    cancelCrop: desk.dismiss,
    remove: () => {
      desk.dismiss();
      if (!isLocalUpload) {
        editor.settlePicture((newsPostId) => removal.mutateAsync(newsPostId)).catch(failNotice);
      }
    },
    retry: desk.submit,
  };
};
