import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import type { UploadLinksPage } from '../hooks/use-upload-links-page';
import {
  CANCEL_LABEL,
  REVOKE_CONFIRM,
  REVOKE_EXPLANATION,
  REVOKE_EYEBROW,
  REVOKE_QUESTION,
  SHEET_CLOSE,
} from '../upload-link-copy';

interface UploadLinkRevokeDialogProps {
  page: UploadLinksPage;
}

export const UploadLinkRevokeDialog: FC<UploadLinkRevokeDialogProps> = ({ page }) => (
  <KkConfirmDialog
    open={page.revokeAsked}
    onClose={page.onCancelRevoke}
    onConfirm={page.onConfirmRevoke}
    tone="danger"
    eyebrow={REVOKE_EYEBROW}
    question={REVOKE_QUESTION}
    explanation={REVOKE_EXPLANATION}
    facts={page.revokeFacts}
    confirmLabel={REVOKE_CONFIRM}
    cancelLabel={CANCEL_LABEL}
    closeLabel={SHEET_CLOSE}
    busy={page.revoking}
  />
);
