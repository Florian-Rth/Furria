import type { KkCrop } from '@furria/ui';
import { useEffect, useRef, useState } from 'react';
import type { UploadHandle, UploadOwner } from './media-upload';
import type { PictureDeskEffect, PictureDeskEvent, PictureDeskState } from './picture-desk';
import { advanceDesk, deskSourceOf, RESTING_DESK } from './picture-desk';
import { startUpload } from './start-upload';
import type { UploadFailure } from './upload-failure';
import { failureOfError, UploadFailedError } from './upload-failure';

export type PictureSend = (owner: UploadOwner) => Promise<void>;

interface PictureDeskOptions {
  cutsBeforeUpload: boolean;
  send: (upload: PictureSend) => Promise<void>;
  saveCrop: (crop: KkCrop) => Promise<void>;
  onChange?: (state: PictureDeskState) => void;
  onUploadFailed?: (failure: UploadFailure) => void;
  onSaveFailed?: (error: Error) => void;
}

export interface PictureDesk {
  state: PictureDeskState;
  choose: (file: File) => void;
  recrop: (source: string, crop: KkCrop | null) => void;
  changeCrop: (crop: KkCrop) => void;
  submit: () => void;
  unreadable: () => void;
  dismiss: () => void;
}

interface RunningUpload {
  stop: () => void;
}

export const usePictureDesk = ({
  cutsBeforeUpload,
  send,
  saveCrop,
  onChange,
  onUploadFailed,
  onSaveFailed,
}: PictureDeskOptions): PictureDesk => {
  const [state, setState] = useState<PictureDeskState>(RESTING_DESK);
  const latest = useRef<PictureDeskState>(RESTING_DESK);
  const running = useRef<RunningUpload | null>(null);

  const source = deskSourceOf(state);
  useEffect(() => (source === null ? undefined : () => URL.revokeObjectURL(source)), [source]);

  const isAt = (kind: PictureDeskState['kind'], attempt: number): boolean =>
    latest.current.kind === kind && latest.current.attempt === attempt;

  const runUpload = (attempt: number, file: File, crop: KkCrop | null): void => {
    let handle: UploadHandle | null = null;
    let isStopped = false;
    running.current = {
      stop: () => {
        isStopped = true;
        handle?.cancel();
      },
    };
    const upload: PictureSend = async (owner) => {
      if (isStopped) {
        throw new UploadFailedError('interrupted');
      }
      handle = startUpload({ file, owner, crop });
      handle.progress(({ share }) => {
        dispatch({ kind: 'progressed', attempt, share });
      });
      const outcome = await handle.done;
      if (outcome.kind !== 'sent') {
        throw new UploadFailedError(outcome.kind === 'failed' ? outcome.failure : 'interrupted');
      }
    };
    send(upload).then(
      () => {
        dispatch({ kind: 'uploaded', attempt });
      },
      (error: Error) => {
        const failure = failureOfError(error);
        dispatch({ kind: 'uploadFailed', attempt, failure });
        if (isAt('failed', attempt)) {
          onUploadFailed?.(failure);
        }
      },
    );
  };

  const runSave = (attempt: number, crop: KkCrop): void => {
    saveCrop(crop).then(
      () => {
        dispatch({ kind: 'saved', attempt });
      },
      (error: Error) => {
        dispatch({ kind: 'saveFailed', attempt });
        if (isAt('cropping', attempt)) {
          onSaveFailed?.(error);
        }
      },
    );
  };

  const perform = (effect: PictureDeskEffect): void => {
    switch (effect.kind) {
      case 'stop':
        running.current?.stop();
        running.current = null;
        return;
      case 'upload':
        runUpload(effect.attempt, effect.file, effect.crop);
        return;
      case 'save':
        runSave(effect.attempt, effect.crop);
        return;
    }
  };

  const dispatch = (event: PictureDeskEvent): void => {
    const previous = latest.current;
    const step = advanceDesk(previous, event, { cutsBeforeUpload });
    latest.current = step.state;
    if (step.state !== previous) {
      setState(step.state);
      onChange?.(step.state);
    }
    for (const effect of step.effects) {
      perform(effect);
    }
  };

  return {
    state,
    choose: (file) => {
      dispatch({ kind: 'chosen', photo: { file, source: URL.createObjectURL(file) } });
    },
    recrop: (recropSource, crop) => {
      dispatch({ kind: 'recrop', source: recropSource, crop });
    },
    changeCrop: (crop) => {
      dispatch({ kind: 'cropChanged', crop });
    },
    submit: () => {
      dispatch({ kind: 'submitted' });
    },
    unreadable: () => {
      dispatch({ kind: 'unreadable' });
    },
    dismiss: () => {
      dispatch({ kind: 'dismissed' });
    },
  };
};
