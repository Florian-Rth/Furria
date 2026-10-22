import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkCornerTag } from '@furria/ui/KkCornerTag';
import type { FC } from 'react';
import { useBrowserModeLeave } from '../hooks/use-browser-mode-leave';
import {
  BROWSER_MODE_LEAVE_BODY,
  BROWSER_MODE_LEAVE_CANCEL,
  BROWSER_MODE_LEAVE_CLOSE,
  BROWSER_MODE_LEAVE_CONFIRM,
  BROWSER_MODE_LEAVE_EYEBROW,
  BROWSER_MODE_LEAVE_TITLE,
  BROWSER_MODE_TAG,
  BROWSER_MODE_TAG_LABEL,
} from '../install-copy';

const NO_FACTS = [] as const;

export const BrowserModeTag: FC = () => {
  const { isAsking, ask, cancel, leave } = useBrowserModeLeave();

  return (
    <>
      <KkCornerTag label={BROWSER_MODE_TAG} ariaLabel={BROWSER_MODE_TAG_LABEL} onPress={ask} />
      <KkConfirmDialog
        open={isAsking}
        onClose={cancel}
        onConfirm={leave}
        eyebrow={BROWSER_MODE_LEAVE_EYEBROW}
        question={BROWSER_MODE_LEAVE_TITLE}
        explanation={BROWSER_MODE_LEAVE_BODY}
        facts={NO_FACTS}
        confirmLabel={BROWSER_MODE_LEAVE_CONFIRM}
        cancelLabel={BROWSER_MODE_LEAVE_CANCEL}
        closeLabel={BROWSER_MODE_LEAVE_CLOSE}
      />
    </>
  );
};
