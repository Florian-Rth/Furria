import type { KkBannerDeskActions, KkCrop } from '@furria/ui';
import { useKkNotice } from '@furria/ui';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useApiMutation } from '@/lib/api/api-mutation';
import type { PictureEditing } from '@/lib/api/schemas';
import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import { usePictureDesk } from '@/lib/media/use-picture-desk';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { PictureBanner } from '../picture-banner';
import { toPictureBanner } from '../picture-banner';
import { toUploadFailureMessage } from '../picture-labels';
import type { PictureKind, PictureTarget } from '../picture-target';
import { PICTURE_CHANGES, toUploadOwner } from '../picture-target';
import { requestPictureCrop, requestPictureRemoval } from '../requests';

const PICTURE_FAILURE = { failure: toWriteErrorMessage };

interface PictureSectionOptions {
  target: PictureTarget;
  editing: PictureEditing | null;
  refresh: () => void;
  onGallery?: () => void;
}

export interface PictureSectionDesk {
  kind: PictureKind;
  banner: PictureBanner;
  actions: KkBannerDeskActions;
  fileInputRef: (node: HTMLInputElement | null) => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  dismiss: () => void;
}

export const usePictureSection = ({
  target,
  editing,
  refresh,
  onGallery,
}: PictureSectionOptions): PictureSectionDesk => {
  const raiseNotice = useKkNotice();
  const changes = PICTURE_CHANGES[target.kind];
  const cropping = useApiMutation({
    request: (crop: KkCrop, accessToken) => requestPictureCrop(target, crop, accessToken),
    changes,
    notice: PICTURE_FAILURE,
  });
  const removal = useApiMutation({
    request: (_input: void, accessToken) => requestPictureRemoval(target, accessToken),
    changes,
    notice: PICTURE_FAILURE,
  });
  const [input, setInput] = useState<HTMLInputElement | null>(null);

  const announce = useDevelopingPicture({
    isDeveloping: editing?.state === 'processing',
    refresh,
    changes,
  });

  const desk = usePictureDesk({
    cutsBeforeUpload: false,
    send: (upload) => upload(toUploadOwner(target)).then(announce),
    saveCrop: (crop) => cropping.mutateAsync(crop).then(announce),
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
    onGallery,
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
        removal.mutate();
      }
    },
    onCropChange: desk.changeCrop,
  };

  return {
    kind: target.kind,
    banner: toPictureBanner(editing, state),
    actions,
    fileInputRef: setInput,
    onFileChosen: (change) => {
      const file = change.target.files?.[0];
      change.target.value = '';
      if (file !== undefined) {
        desk.choose(file);
      }
    },
    dismiss: desk.dismiss,
  };
};
