import type { UploadFailure } from '@furria/api-client/upload-failure';
import { useEffect, useRef, useState } from 'react';
import { toUploadFailureMessage } from '@/features/pictures/picture-labels';
import { intakeTusTransport } from '@/lib/media/intake-tus-transport';
import type { UploadHandle } from '@/lib/media/media-upload';
import { uploadVia } from '@/lib/media/media-upload';
import type { PortraitCut } from '../portrait-pick';

const LINK_ENDED_FAILURES: readonly UploadFailure[] = ['ended', 'gone'];

interface FailedUpload {
  cut: PortraitCut;
  failure: UploadFailure;
}

interface PortraitUploadInput {
  token: string;
  shown: PortraitCut | null;
  onLinkEnded: () => void;
}

export interface PortraitUpload {
  share: number | null;
  rejection: string | null;
  send: (cut: PortraitCut) => Promise<boolean>;
}

export const usePortraitUpload = ({
  token,
  shown,
  onLinkEnded,
}: PortraitUploadInput): PortraitUpload => {
  const [share, setShare] = useState<number | null>(null);
  const [sent, setSent] = useState<PortraitCut | null>(null);
  const [failed, setFailed] = useState<FailedUpload | null>(null);
  const running = useRef<UploadHandle | null>(null);

  useEffect(
    () => () => {
      running.current?.cancel();
    },
    [],
  );

  const upload = async (cut: PortraitCut): Promise<UploadFailure | null> => {
    const handle = uploadVia(intakeTusTransport(token), {
      file: cut.photo.file,
      owner: { kind: 'intake' },
      crop: cut.crop,
    });
    running.current = handle;
    handle.progress((progress) => {
      setShare(progress.share);
    });
    const outcome = await handle.done;
    switch (outcome.kind) {
      case 'sent':
        return null;
      case 'failed':
        return outcome.failure;
      case 'stopped':
        return 'interrupted';
    }
  };

  const send = async (cut: PortraitCut): Promise<boolean> => {
    if (cut === sent) {
      return true;
    }
    setFailed(null);
    setShare(0);
    const failure = await upload(cut).catch((): UploadFailure => 'interrupted');
    running.current = null;
    setShare(null);
    if (failure === null) {
      setSent(cut);
      return true;
    }
    setFailed({ cut, failure });
    if (LINK_ENDED_FAILURES.includes(failure)) {
      onLinkEnded();
    }
    return false;
  };

  return {
    share,
    rejection:
      failed !== null && failed.cut === shown ? toUploadFailureMessage(failed.failure) : null,
    send,
  };
};
