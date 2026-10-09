import type { KkCrop } from '@furria/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PictureEditing } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toUploadFailureMessage } from '../picture-labels';
import type { PictureTarget } from '../picture-target';
import { requestPictureCrop, requestPictureRemoval } from '../requests';
import { PictureUploadError, uploadPicture } from '../upload-picture';

const PROCESSING_POLL_MS = 2_000;

export type PicturePhase =
  | { kind: 'view' }
  | { kind: 'choosing'; file: File; source: string }
  | { kind: 'recropping'; source: string }
  | { kind: 'uploading'; file: File; source: string; share: number; cropped: boolean };

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

const toUploadRejection = (error: Error): string =>
  error instanceof PictureUploadError
    ? toUploadFailureMessage(error.failure)
    : (toWriteErrorMessage(error) ?? toUploadFailureMessage('interrupted'));

export const usePictureEditor = ({
  target,
  editing,
  refresh,
}: PictureEditorOptions): PictureEditorControl => {
  const [phase, setPhase] = useState<PicturePhase>({ kind: 'view' });
  const [crop, setCrop] = useState<KkCrop | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
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

  const queryClient = useQueryClient();
  const isProcessing = editing?.state === 'processing';
  const wasProcessing = useRef(isProcessing);
  const pollWhileProcessing = useEffectEvent((): void => {
    refresh();
  });
  const refreshEveryView = useEffectEvent((): void => {
    void queryClient.invalidateQueries();
  });
  useEffect(() => {
    const finishedProcessing = wasProcessing.current && !isProcessing;
    wasProcessing.current = isProcessing;
    if (finishedProcessing) {
      refreshEveryView();
    }
    if (!isProcessing) {
      return undefined;
    }
    const timer = window.setInterval(pollWhileProcessing, PROCESSING_POLL_MS);
    return () => window.clearInterval(timer);
  }, [isProcessing]);

  const localSource = phase.kind === 'choosing' || phase.kind === 'uploading' ? phase.source : null;
  useEffect(
    () => (localSource === null ? undefined : () => URL.revokeObjectURL(localSource)),
    [localSource],
  );

  const finish = async (): Promise<void> => {
    await queryClient.invalidateQueries();
    setPhase({ kind: 'view' });
    setCrop(null);
  };

  const upload = (file: File, source: string, chosen: KkCrop | null): void => {
    setRejection(null);
    setPhase({ kind: 'uploading', file, source, share: 0, cropped: chosen !== null });
    uploadPicture({
      file,
      target,
      crop: chosen,
      onProgress: (share) => {
        setPhase({ kind: 'uploading', file, source, share, cropped: chosen !== null });
      },
    }).then(finish, (error: Error) => {
      setRejection(toUploadRejection(error));
      setPhase({ kind: 'choosing', file, source });
    });
  };

  const choose = (file: File | null): void => {
    if (file === null) {
      return;
    }
    setRejection(null);
    setCrop(null);
    setPhase({ kind: 'choosing', file, source: URL.createObjectURL(file) });
  };

  const recrop = (): void => {
    if (editing?.uncroppedUrl == null) {
      return;
    }
    setRejection(null);
    setCrop(null);
    setPhase({ kind: 'recropping', source: editing.uncroppedUrl });
  };

  const cancel = (): void => {
    setRejection(null);
    setCrop(null);
    setPhase({ kind: 'view' });
  };

  const submit = (): void => {
    if (crop === null) {
      return;
    }
    if (phase.kind === 'choosing') {
      upload(phase.file, phase.source, crop);
      return;
    }
    if (phase.kind === 'recropping') {
      setRejection(null);
      cropMutation.mutate(crop, {
        onSuccess: () => {
          void finish();
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      });
    }
  };

  const unreadable = (): void => {
    if (phase.kind === 'choosing') {
      upload(phase.file, phase.source, null);
    }
  };

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
          void queryClient.invalidateQueries();
        },
        onError: (error) => {
          setRemovalRejection(toWriteErrorMessage(error));
        },
      });
    },
    isSaving: removalMutation.isPending,
    rejection: removalRejection,
  };

  const isSaving = phase.kind === 'uploading' || cropMutation.isPending;

  return {
    phase,
    rejection,
    initialCrop: phase.kind === 'recropping' ? (editing?.crop ?? null) : null,
    canRecrop: editing?.uncroppedUrl != null,
    isSaving,
    canSubmit: crop !== null && !isSaving,
    choose,
    recrop,
    cancel,
    setCrop,
    submit,
    unreadable,
    removal,
  };
};
