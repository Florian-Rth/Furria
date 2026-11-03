import { apiStatusOf, refusalMessageOf } from '@furria/api-client';
import { STUDIO_CHANGED_ELSEWHERE, STUDIO_RELOAD } from '@furria/studio/studio-copy';
import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import { toWriteErrorMessage } from '@/lib/write-error';

const CONFLICT_STATUS = 409;
const RELOAD_ACTION = 'reload';

export const studioFailureOf = (
  error: Error,
  reload: () => void,
): string | KkNoticeRequest | null => {
  if (apiStatusOf(error) !== CONFLICT_STATUS) {
    return toWriteErrorMessage(error);
  }

  return {
    tone: 'error',
    message: refusalMessageOf(error) ?? STUDIO_CHANGED_ELSEWHERE,
    actions: [{ id: RELOAD_ACTION, label: STUDIO_RELOAD, onSelect: reload }],
  };
};
