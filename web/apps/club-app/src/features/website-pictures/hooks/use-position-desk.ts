import { aspectOf } from '@furria/ui/image-aspect';
import type { KkCrop } from '@furria/ui/image-crop';
import { centredCrop } from '@furria/ui/image-crop';
import { useKkNotice } from '@furria/ui/KkNotice';
import { useKkSheet } from '@furria/ui/sheet-store';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { photoSizeOf } from '@/features/gallery-pick/gallery-photo';
import type { GalleryPhoto } from '@/features/gallery-pick/schemas';
import { toUploadFailureMessage } from '@/features/pictures/picture-labels';
import type { PictureDeskState } from '@/lib/media/picture-desk';
import { deskSourceOf } from '@/lib/media/picture-desk';
import { usePictureDesk } from '@/lib/media/use-picture-desk';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  useWebsitePictureCrop,
  useWebsitePictureFromGallery,
  useWebsitePictureFromSlot,
  useWebsitePictureRemoval,
  useWebsitePictureTransfer,
} from '../api';
import type { SlotPositionRef } from '../types';
import type { BoardPosition } from '../website-board';
import {
  COPY_SHEET_ID,
  DESK_SHEET_ID,
  GALLERY_SHEET_ID,
  NOTICES,
  TRANSFER_SHEET_ID,
} from '../website-copy';

export type DeskPhase = 'view' | 'cropping' | 'saving' | 'uploading' | 'failed';

type CutIntent =
  | { kind: 'recrop' }
  | { kind: 'gallery'; galleryItemId: number }
  | { kind: 'copy'; source: SlotPositionRef };

export interface DeskRemoval {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export interface PositionDesk {
  phase: DeskPhase;
  cropSource: string | null;
  initialCrop: KkCrop | null;
  canCommit: boolean;
  uploadShare: number;
  uploadSource: string | null;
  isUncutUpload: boolean;
  rejection: string | null;
  altCopied: boolean;
  fileInputRef: (node: HTMLInputElement | null) => void;
  chooseFile: () => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  openGallery: () => void;
  pickPhoto: (photo: GalleryPhoto) => void;
  openCopy: () => void;
  copyFrom: (source: BoardPosition) => void;
  openTransfer: () => void;
  transferTo: (target: SlotPositionRef) => void;
  recrop: () => void;
  setCrop: (crop: KkCrop) => void;
  commit: () => void;
  cancel: () => void;
  unreadable: () => void;
  removal: DeskRemoval;
}

const phaseOf = (state: PictureDeskState): DeskPhase =>
  state.kind === 'resting' ? 'view' : state.kind;

const cropSourceOf = (state: PictureDeskState): string | null =>
  state.kind === 'cropping' || state.kind === 'saving' ? state.source : null;

const initialCropOf = (state: PictureDeskState): KkCrop | null =>
  state.kind === 'cropping' ? state.initialCrop : null;

const canCommitOf = (state: PictureDeskState): boolean =>
  state.kind === 'failed' || (state.kind === 'cropping' && state.crop !== null);

export const usePositionDesk = (
  position: BoardPosition,
  announce: () => Promise<void>,
  onMoved: (target: SlotPositionRef) => void,
): PositionDesk => {
  const sheet = useKkSheet();
  const raiseNotice = useKkNotice();
  const cropping = useWebsitePictureCrop();
  const galleryPick = useWebsitePictureFromGallery();
  const slotCopy = useWebsitePictureFromSlot();
  const removalMutation = useWebsitePictureRemoval();
  const transfer = useWebsitePictureTransfer();
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const [intent, setIntent] = useState<CutIntent>({ kind: 'recrop' });
  const [rejection, setRejection] = useState<string | null>(null);
  const [altCopied, setAltCopied] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalRejection, setRemovalRejection] = useState<string | null>(null);
  const at: SlotPositionRef = { slot: position.slot, position: position.position };
  const aspect = aspectOf(position.aspect);

  const reopenDesk = (): void => {
    sheet.open(DESK_SHEET_ID);
  };

  const rejectOnDesk = (message: string | null): void => {
    setRejection(message);
    reopenDesk();
  };

  const saveCut = (crop: KkCrop): Promise<void> => {
    switch (intent.kind) {
      case 'recrop':
        return cropping.mutateAsync({ at, crop, aspect });
      case 'gallery':
        return galleryPick.mutateAsync({ at, crop, aspect, galleryItemId: intent.galleryItemId });
      case 'copy':
        return slotCopy.mutateAsync({ at, crop, aspect, source: intent.source }).then(() => {
          setAltCopied(true);
        });
    }
  };

  const desk = usePictureDesk({
    cutsBeforeUpload: true,
    send: (upload) =>
      upload({ kind: 'website', slot: position.slot, position: position.position, aspect })
        .then(() => {
          raiseNotice({ tone: 'success', message: NOTICES.uploaded });
        })
        .then(announce),
    saveCrop: (crop) => saveCut(crop).then(announce),
    onUploadFailed: (failure) => {
      rejectOnDesk(toUploadFailureMessage(failure));
    },
    onSaveFailed: (error) => {
      rejectOnDesk(toWriteErrorMessage(error));
    },
  });
  const { state } = desk;

  const startCut = (next: CutIntent, source: string, crop: KkCrop | null): void => {
    setRejection(null);
    setIntent(next);
    desk.recrop(source, crop);
  };

  const removal: DeskRemoval = {
    isOpen: isRemoving,
    open: () => {
      setRemovalRejection(null);
      setIsRemoving(true);
    },
    close: () => {
      setIsRemoving(false);
    },
    submit: () => {
      setRemovalRejection(null);
      removalMutation.mutate(at, {
        onSuccess: () => {
          setIsRemoving(false);
          desk.dismiss();
        },
        onError: (error) => {
          setRemovalRejection(toWriteErrorMessage(error));
        },
      });
    },
    isSaving: removalMutation.isPending,
    rejection: removalRejection,
  };

  return {
    phase: phaseOf(state),
    cropSource: cropSourceOf(state),
    initialCrop: initialCropOf(state),
    canCommit: canCommitOf(state),
    uploadShare: state.kind === 'uploading' ? state.share : 0,
    uploadSource: deskSourceOf(state),
    isUncutUpload: state.kind === 'uploading' && state.crop === null,
    rejection,
    altCopied,
    fileInputRef: setInput,
    chooseFile: () => {
      input?.click();
    },
    onFileChosen: (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file !== undefined) {
        setRejection(null);
        setAltCopied(false);
        desk.choose(file);
      }
    },
    openGallery: () => {
      sheet.open(GALLERY_SHEET_ID);
    },
    pickPhoto: (photo) => {
      setAltCopied(false);
      startCut(
        { kind: 'gallery', galleryItemId: photo.mediaItemId },
        photo.urls.small,
        centredCrop(photoSizeOf(photo), position.aspect),
      );
      reopenDesk();
    },
    openCopy: () => {
      sheet.open(COPY_SHEET_ID);
    },
    copyFrom: (source) => {
      const original = source.picture?.picture.uncroppedUrl ?? null;
      if (original !== null) {
        startCut(
          { kind: 'copy', source: { slot: source.slot, position: source.position } },
          original,
          null,
        );
      }
      reopenDesk();
    },
    openTransfer: () => {
      sheet.open(TRANSFER_SHEET_ID);
    },
    transferTo: (target) => {
      sheet.close();
      setRejection(null);
      void transfer.mutateAsync({ from: at, to: target }).then(
        () => {
          onMoved(target);
        },
        (error: Error) => {
          rejectOnDesk(toWriteErrorMessage(error));
        },
      );
    },
    recrop: () => {
      const original = position.picture?.picture.uncroppedUrl ?? null;
      if (original !== null) {
        const storedCrop = position.status === 'mismatch' ? null : position.picture?.picture.crop;
        startCut({ kind: 'recrop' }, original, storedCrop ?? null);
      }
    },
    setCrop: desk.changeCrop,
    commit: () => {
      setRejection(null);
      desk.submit();
    },
    cancel: () => {
      setRejection(null);
      desk.dismiss();
    },
    unreadable: desk.unreadable,
    removal,
  };
};
