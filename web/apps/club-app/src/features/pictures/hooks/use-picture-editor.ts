import type { KkCrop } from '@furria/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { PictureEditing } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type { PictureDeskState } from '@/lib/media/picture-desk';
import { useDevelopingPicture } from '@/lib/media/use-developing-picture';
import { usePictureDesk } from '@/lib/media/use-picture-desk';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toUploadFailureMessage } from '../picture-labels';
import type { PictureTarget } from '../picture-target';
import { toUploadOwner } from '../picture-target';
import { requestPictureCrop, requestPictureRemoval } from '../requests';

export type PicturePhase =
  | { kind: 'view' }
  | { kind: 'choosing'; source: string }
  | { kind: 'recropping'; source: string }
  | { kind: 'uploading'; share: number; cropped: boolean };

interface PictureEditorOptions {
  target: PictureTarget;
  editing: PictureEditing | null;
  refresh: () => void;
}

export interface PictureRemovalControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export interface PictureEditorControl {
  phase: PicturePhase;
  rejection: string | null;
  isStalled: boolean;
  initialCrop: KkCrop | null;
  canRecrop: boolean;
  isSaving: boolean;
  canSubmit: boolean;
  choose: (file: File | null) => void;
  recrop: () => void;
  cancel: () => void;
  setCrop: (crop: KkCrop) => void;
  submit: () => void;
  unreadable: () => void;
  removal: PictureRemovalControl;
}

const phaseOf = (state: PictureDeskState): PicturePhase => {
  switch (state.kind) {
    case 'resting':
      return { kind: 'view' };
    case 'cropping':
      return { kind: state.photo === null ? 'recropping' : 'choosing', source: state.source };
    case 'saving':
      return { kind: 'recropping', source: state.source };
    case 'failed':
      return { kind: 'choosing', source: state.photo.source };
    case 'uploading':
      return { kind: 'uploading', share: state.share, cropped: state.crop !== null };
  }
};

const initialCropOf = (state: PictureDeskState): KkCrop | null => {
  switch (state.kind) {
    case 'cropping':
      return state.initialCrop;
    case 'failed':
      return state.crop;
    default:
      return null;
  }
};

const canSubmitOf = (state: PictureDeskState): boolean =>
  state.kind === 'failed' || (state.kind === 'cropping' && state.crop !== null);

export const usePictureEditor = ({
  target,
  editing,
  refresh,
}: PictureEditorOptions): PictureEditorControl => {
  const [saveRejection, setSaveRejection] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalRejection, setRemovalRejection] = useState<string | null>(null);

  const cropMutation = useMutation({
    mutationFn: (chosen: KkCrop) =>
      withFreshAccessToken((accessToken) => requestPictureCrop(target, chosen, accessToken)),
  });
  const removalMutation = useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestPictureRemoval(target, accessToken)),
  });

  const isDeveloping = editing?.state === 'processing';
  const isStalled = isDeveloping && editing.isStalled;
  const announce = useDevelopingPicture({
    isDeveloping,
    isStalled,
    refresh,
    changes: ['picture'],
  });

  const desk = usePictureDesk({
    cutsBeforeUpload: true,
    send: (upload) => upload(toUploadOwner(target)).then(announce),
    saveCrop: (crop) => cropMutation.mutateAsync(crop).then(announce),
    onSaveFailed: (error) => {
      setSaveRejection(toWriteErrorMessage(error));
    },
  });
  const { state } = desk;

  const rejection = state.kind === 'failed' ? toUploadFailureMessage(state.failure) : saveRejection;

  const removal: PictureRemovalControl = {
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
      removalMutation.mutate(undefined, {
        onSuccess: () => {
          setIsRemoving(false);
          void announce();
        },
        onError: (error) => {
          setRemovalRejection(toWriteErrorMessage(error));
        },
      });
    },
    isSaving: removalMutation.isPending,
    rejection: removalRejection,
  };

  const isSaving = state.kind === 'uploading' || state.kind === 'saving';

  return {
    phase: phaseOf(state),
    rejection,
    isStalled,
    initialCrop: initialCropOf(state),
    canRecrop: editing?.uncroppedUrl != null,
    isSaving,
    canSubmit: canSubmitOf(state),
    choose: (file) => {
      if (file !== null) {
        setSaveRejection(null);
        desk.choose(file);
      }
    },
    recrop: () => {
      if (editing?.uncroppedUrl != null) {
        setSaveRejection(null);
        desk.recrop(editing.uncroppedUrl, editing.crop);
      }
    },
    cancel: () => {
      setSaveRejection(null);
      desk.dismiss();
    },
    setCrop: desk.changeCrop,
    submit: () => {
      setSaveRejection(null);
      desk.submit();
    },
    unreadable: desk.unreadable,
    removal,
  };
};
