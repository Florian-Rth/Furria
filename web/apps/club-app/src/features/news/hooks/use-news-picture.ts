import type { KkCrop } from '@furria/ui';
import { useKkNotice, useKkSheet } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import {
  PictureUploadError,
  toUploadFailureMessage,
  uploadOwnedPicture,
} from '@/features/pictures';
import { useNewsPictureCrop, useNewsPictureFromGallery, useNewsPictureRemoval } from '../api';
import { GALLERY_SHEET_ID, PICTURE_ACTION_FAILED, PICTURE_UPLOAD_FAILED } from '../editor-copy';
import { centredBannerCropOf, newsUploadOwnerOf } from '../news-picture';
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

const UPLOAD_KEY_PREFIX = 'upload:';

const uploadingPicture = (file: File, progress: number, failed: boolean): NewsPicture => ({
  key: `${UPLOAD_KEY_PREFIX}${file.name}:${file.lastModified}`,
  state: failed ? 'failed' : 'uploading',
  progress,
  uncroppedSource: null,
  source: null,
  crop: null,
});

const uploadFailureOf = (error: Error): string =>
  error instanceof PictureUploadError
    ? toUploadFailureMessage(error.failure)
    : PICTURE_UPLOAD_FAILED;

export const useNewsPicture = (editor: NewsEditor): NewsPictureDesk => {
  const sheet = useKkSheet();
  const raiseNotice = useKkNotice();
  const cropping = useNewsPictureCrop();
  const removal = useNewsPictureRemoval();
  const galleryPick = useNewsPictureFromGallery();
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const pendingCrop = useRef<KkCrop | null>(null);
  const lastFile = useRef<File | null>(null);
  const currentUpload = useRef<AbortController | null>(null);
  const picture = editor.version.picture;

  const failNotice = (): void => {
    raiseNotice({ tone: 'error', message: PICTURE_ACTION_FAILED });
  };

  const cancelUpload = (): void => {
    currentUpload.current?.abort();
    currentUpload.current = null;
  };

  const startUpload = (file: File): void => {
    cancelUpload();
    const upload = new AbortController();
    currentUpload.current = upload;
    const isCurrent = (): boolean => currentUpload.current === upload;
    lastFile.current = file;
    setIsCropping(false);
    editor.showUpload(uploadingPicture(file, 0, false));
    editor
      .settlePicture((newsPostId) =>
        uploadOwnedPicture({
          file,
          owner: newsUploadOwnerOf(newsPostId),
          crop: null,
          signal: upload.signal,
          onProgress: (share) => {
            if (isCurrent()) {
              editor.showUpload(uploadingPicture(file, share, false));
            }
          },
        }),
      )
      .then(
        () => {
          if (isCurrent()) {
            currentUpload.current = null;
            editor.showUpload(null);
          }
        },
        (error: Error) => {
          if (isCurrent()) {
            currentUpload.current = null;
            editor.showUpload(uploadingPicture(file, 0, true));
            raiseNotice({ tone: 'error', message: uploadFailureOf(error) });
          }
        },
      );
  };

  return {
    picture,
    isCropping,
    fileInputRef: setInput,
    chooseFile: () => {
      input?.click();
    },
    onFileChosen: (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file !== undefined) {
        startUpload(file);
      }
    },
    openGallery: () => {
      sheet.open(GALLERY_SHEET_ID);
    },
    pickPhoto: (photo) => {
      sheet.close();
      setIsCropping(false);
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
      pendingCrop.current = picture?.crop ?? null;
      setIsCropping(true);
    },
    onCropChange: (crop) => {
      pendingCrop.current = crop;
    },
    finishCrop: () => {
      setIsCropping(false);
      const crop = pendingCrop.current;
      if (picture === null || crop === null) {
        return;
      }
      editor
        .settlePicture((newsPostId) => cropping.mutateAsync({ newsPostId, crop }))
        .catch(failNotice);
    },
    cancelCrop: () => {
      setIsCropping(false);
    },
    remove: () => {
      setIsCropping(false);
      if (picture?.key.startsWith(UPLOAD_KEY_PREFIX)) {
        cancelUpload();
        editor.showUpload(null);
        return;
      }
      editor.settlePicture((newsPostId) => removal.mutateAsync(newsPostId)).catch(failNotice);
    },
    retry: () => {
      if (lastFile.current !== null) {
        startUpload(lastFile.current);
      }
    },
  };
};
