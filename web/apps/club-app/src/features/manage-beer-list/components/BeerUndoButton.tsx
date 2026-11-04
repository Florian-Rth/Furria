import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { KkHoldConfirm } from '@furria/ui/KkHoldButton';
import { KkIconButton } from '@furria/ui/KkIconButton';
import type { FC } from 'react';
import { useState } from 'react';
import { UNDO_LABEL } from '../beer-hub-copy';

const NO_FACTS: readonly [] = [];

interface BeerUndoButtonProps {
  confirm: KkHoldConfirm;
  busy: boolean;
  onConfirm: () => void;
}

export const BeerUndoButton: FC<BeerUndoButtonProps> = ({ confirm, busy, onConfirm }) => {
  const [asking, setAsking] = useState(false);
  const ask = (): void => {
    setAsking(true);
  };
  const close = (): void => {
    setAsking(false);
  };
  const commit = (): void => {
    setAsking(false);
    onConfirm();
  };

  return (
    <>
      <KkIconButton label={UNDO_LABEL} icon="undo" size="small" disabled={busy} onClick={ask} />
      <KkConfirmDialog
        open={asking}
        onClose={close}
        onConfirm={commit}
        tone="danger"
        eyebrow={confirm.eyebrow}
        question={confirm.question}
        explanation={confirm.explanation}
        facts={NO_FACTS}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        closeLabel={confirm.closeLabel}
      />
    </>
  );
};
