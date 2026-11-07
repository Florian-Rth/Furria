import type { KkBannerDeskActions } from '@furria/ui/banner-desk-types';
import type { KkCrop } from '@furria/ui/image-crop';
import { useKkNotice } from '@furria/ui/KkNotice';
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { toUploadFailureMessage } from '@/features/pictures/picture-labels';
import { useApiMutation } from '@/lib/api/api-mutation';
import { startUpload } from '@/lib/media/start-upload';
import { useRefreshAfter } from '@/lib/query/use-refresh-after';
import { LOGO_NOTES, toLogoNotSentMessage } from '../manage-sessions-labels';
import { measureLogoAspect } from '../measure-logo';
import { requestSessionLogoCrop, requestSessionLogoRemoval } from '../requests';
import type { SessionLogoEditing } from '../schemas';
import type { SessionLogoBanner, SessionLogoDesk } from '../session-logo-draft';
import {
  cancelLogoCut,
  changeLogoCut,
  clearLogo,
  finishLogoCut,
  KEPT_LOGO_DESK,
  logoChangeOf,
  stageLogo,
  startLogoCut,
  toSessionLogoBanner,
} from '../session-logo-draft';
import { toLogoFileRejection } from '../session-logo-file';

const LOGO_CHANGES = ['sessionRecord'] as const;
const REMOVAL_FAILED_REASON = 'Entferne es bitte noch einmal.';
const RECUT_FAILED_REASON = 'Setz den Zuschnitt bitte noch einmal.';

interface RecutInput {
  sessionId: number;
  crop: KkCrop;
}

export interface SessionLogoControl {
  banner: SessionLogoBanner;
  note: string | null;
  actions: KkBannerDeskActions;
  isChanged: boolean;
  rejection: string | null;
  fileInputRef: (node: HTMLInputElement | null) => void;
  onFileChosen: (event: ChangeEvent<HTMLInputElement>) => void;
  pick: (file: File | null) => void;
  sendTo: (sessionId: number) => Promise<void>;
}

export const useSessionLogo = (stored: SessionLogoEditing | null): SessionLogoControl => {
  const raiseNotice = useKkNotice();
  const refreshAfter = useRefreshAfter();
  const removal = useApiMutation({
    request: requestSessionLogoRemoval,
    changes: LOGO_CHANGES,
  });
  const recut = useApiMutation({
    request: (input: RecutInput, accessToken) =>
      requestSessionLogoCrop(input.sessionId, input.crop, accessToken),
    changes: LOGO_CHANGES,
  });
  const [desk, setDesk] = useState<SessionLogoDesk>(KEPT_LOGO_DESK);
  const [rejection, setRejection] = useState<string | null>(null);
  const [input, setInput] = useState<HTMLInputElement | null>(null);
  const latestPick = useRef(0);

  const stagedSource = desk.draft.kind === 'staged' ? desk.draft.source : null;
  useEffect(
    () => (stagedSource === null ? undefined : () => URL.revokeObjectURL(stagedSource)),
    [stagedSource],
  );

  const banner = toSessionLogoBanner(stored, desk);

  const reportNotSent = (reason: string): void => {
    raiseNotice({ tone: 'error', message: toLogoNotSentMessage(reason) });
  };

  const chooseFile = (): void => {
    input?.click();
  };

  const pick = (file: File | null): void => {
    if (file === null) {
      return;
    }

    const refusal = toLogoFileRejection(file);
    setRejection(refusal);
    if (refusal !== null) {
      return;
    }

    latestPick.current += 1;
    const pickNumber = latestPick.current;
    const source = URL.createObjectURL(file);
    void measureLogoAspect(source).then((aspect) => {
      if (pickNumber !== latestPick.current) {
        URL.revokeObjectURL(source);
        return;
      }
      setDesk(stageLogo({ file, source, aspect }));
    });
  };

  const actions: KkBannerDeskActions = {
    onUpload: chooseFile,
    onRetry: chooseFile,
    onCrop: () => {
      setDesk((held) => startLogoCut(held, stored));
    },
    onCropDone: () => {
      setDesk(finishLogoCut);
    },
    onCropCancel: () => {
      setDesk(cancelLogoCut);
    },
    onRemove: () => {
      latestPick.current += 1;
      setRejection(null);
      setDesk(clearLogo());
    },
    onCropChange: (crop) => {
      setDesk((held) => changeLogoCut(held, crop));
    },
  };

  const upload = async (file: File, crop: KkCrop | null, sessionId: number): Promise<void> => {
    const outcome = await startUpload({ file, owner: { kind: 'session', id: sessionId }, crop })
      .done;

    if (outcome.kind === 'failed') {
      reportNotSent(toUploadFailureMessage(outcome.failure));
      return;
    }

    await refreshAfter(LOGO_CHANGES);
  };

  const recutLogo = async (crop: KkCrop, sessionId: number): Promise<void> => {
    try {
      await recut.mutateAsync({ sessionId, crop });
    } catch {
      reportNotSent(RECUT_FAILED_REASON);
    }
  };

  const remove = async (sessionId: number): Promise<void> => {
    try {
      await removal.mutateAsync(sessionId);
    } catch {
      reportNotSent(REMOVAL_FAILED_REASON);
    }
  };

  const { draft } = desk;

  return {
    banner,
    note: LOGO_NOTES[banner.note],
    actions,
    isChanged: draft.kind !== 'kept',
    rejection,
    fileInputRef: setInput,
    onFileChosen: (change) => {
      pick(change.target.files?.[0] ?? null);
      change.target.value = '';
    },
    pick,
    sendTo: async (sessionId) => {
      switch (logoChangeOf(draft, stored !== null)) {
        case 'upload':
          if (draft.kind === 'staged') {
            await upload(draft.file, draft.crop ?? desk.cut?.crop ?? null, sessionId);
          }
          return;
        case 'recut':
          if (draft.kind === 'recut') {
            await recutLogo(draft.crop, sessionId);
          }
          return;
        case 'remove':
          await remove(sessionId);
          return;
        case 'none':
          return;
      }
    },
  };
};
