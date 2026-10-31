import type { KkImageSource } from '@furria/ui/image-source';
import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect, useState } from 'react';
import { toUploadFailureMessage } from '@/features/pictures/picture-labels';
import { useApiMutation } from '@/lib/api/api-mutation';
import { startUpload } from '@/lib/media/start-upload';
import { useRefreshAfter } from '@/lib/query/use-refresh-after';
import { toSessionLogoImage } from '@/lib/session-logo-image';
import { LOGO_PREVIEW_LINES, toLogoNotSentMessage } from '../manage-sessions-labels';
import { requestSessionLogoRemoval } from '../requests';
import type { SessionLogoEditing } from '../schemas';
import type { SessionLogoDraft } from '../session-logo-draft';
import { KEPT_LOGO, logoChangeOf, logoPreviewOf } from '../session-logo-draft';
import { toLogoFileRejection } from '../session-logo-file';

const PREVIEW_SIZES = '56px';
const LOGO_CHANGES = ['sessionRecord'] as const;
const REMOVAL_FAILED_REASON = 'Entferne es bitte noch einmal.';

export interface SessionLogoControl {
  image: KkImageSource | null;
  statusLine: string | null;
  hasLogo: boolean;
  isChanged: boolean;
  rejection: string | null;
  pick: (file: File | null) => void;
  clear: () => void;
  sendTo: (sessionId: number) => Promise<void>;
}

const previewImageOf = (
  stored: SessionLogoEditing | null,
  draft: SessionLogoDraft,
): KkImageSource | null => {
  const preview = logoPreviewOf(stored, draft);

  switch (preview.kind) {
    case 'staged':
      return { src: preview.source };
    case 'stored':
      return toSessionLogoImage(preview.logo, PREVIEW_SIZES);
    default:
      return null;
  }
};

export const useSessionLogo = (stored: SessionLogoEditing | null): SessionLogoControl => {
  const raiseNotice = useKkNotice();
  const refreshAfter = useRefreshAfter();
  const removal = useApiMutation({
    request: requestSessionLogoRemoval,
    changes: LOGO_CHANGES,
  });
  const [draft, setDraft] = useState<SessionLogoDraft>(KEPT_LOGO);
  const [rejection, setRejection] = useState<string | null>(null);

  const stagedPreview = draft.kind === 'staged' ? draft.preview : null;
  useEffect(
    () => (stagedPreview === null ? undefined : () => URL.revokeObjectURL(stagedPreview)),
    [stagedPreview],
  );

  const preview = logoPreviewOf(stored, draft);

  const reportNotSent = (reason: string): void => {
    raiseNotice({ tone: 'error', message: toLogoNotSentMessage(reason) });
  };

  const upload = async (file: File, sessionId: number): Promise<void> => {
    const outcome = await startUpload({ file, owner: { kind: 'session', id: sessionId } }).done;

    if (outcome.kind === 'failed') {
      reportNotSent(toUploadFailureMessage(outcome.failure));
      return;
    }

    await refreshAfter(LOGO_CHANGES);
  };

  const remove = async (sessionId: number): Promise<void> => {
    try {
      await removal.mutateAsync(sessionId);
    } catch {
      reportNotSent(REMOVAL_FAILED_REASON);
    }
  };

  return {
    image: previewImageOf(stored, draft),
    statusLine: LOGO_PREVIEW_LINES[preview.kind],
    hasLogo: preview.kind !== 'none',
    isChanged: draft.kind !== 'kept',
    rejection,
    pick: (file) => {
      if (file === null) {
        return;
      }

      const refusal = toLogoFileRejection(file);
      setRejection(refusal);
      if (refusal === null) {
        setDraft({ kind: 'staged', file, preview: URL.createObjectURL(file) });
      }
    },
    clear: () => {
      setRejection(null);
      setDraft({ kind: 'cleared' });
    },
    sendTo: async (sessionId) => {
      switch (logoChangeOf(draft, stored !== null)) {
        case 'upload':
          if (draft.kind === 'staged') {
            await upload(draft.file, sessionId);
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
