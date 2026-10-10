import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { DIALOG_CANCEL, DIALOG_CLOSE, LIFECYCLE_COPY, WITHDRAW_ADOPTS } from '../../editor-copy';
import type { EditorDialogState } from '../../hooks/use-news-editor';
import type { NewsStage } from '../../types';

interface NewsLifecycleDialogProps {
  dialog: EditorDialogState | null;
  stage: NewsStage;
  onClose: () => void;
  onConfirm: () => void;
}

const NO_FACTS = [] as const;

export const NewsLifecycleDialog: FC<NewsLifecycleDialogProps> = ({
  dialog,
  stage,
  onClose,
  onConfirm,
}) => {
  const kind = dialog?.kind ?? 'withdraw';
  const copy = LIFECYCLE_COPY[kind];
  const adopts = kind === 'withdraw' && stage === 'pending';
  const explanation = adopts ? `${copy.explanation} ${WITHDRAW_ADOPTS}` : copy.explanation;

  return (
    <KkConfirmDialog
      open={dialog?.isOpen ?? false}
      onClose={onClose}
      onConfirm={onConfirm}
      tone={copy.tone}
      eyebrow={copy.eyebrow}
      question={copy.question}
      explanation={explanation}
      facts={NO_FACTS}
      confirmLabel={copy.confirm}
      cancelLabel={DIALOG_CANCEL}
      closeLabel={DIALOG_CLOSE}
    />
  );
};
