import { KkConfirmDialog, KkDateField } from '@furria/ui';
import type { FC } from 'react';
import type { EndSeatTarget } from '../hooks/use-board-dialogs';
import { useEndSeatForm } from '../hooks/use-end-seat-form';
import { toEndSeatExplanation, toEndSeatFacts, toEndSeatQuestion } from '../manage-board-labels';

const EYEBROW = 'Vorstandssitz beenden';
const DATE_LABEL = 'Letzter Tag';
const DATE_HINT = 'Dieser Tag zählt noch dazu.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Vorstandssitz beenden';

interface EndSeatDialogProps {
  target: EndSeatTarget | null;
  onClose: () => void;
}

export const EndSeatDialog: FC<EndSeatDialogProps> = ({ target, onClose }) => {
  const form = useEndSeatForm({
    boardOfficeId: target?.office.boardOfficeId ?? 0,
    officeName: target?.office.name ?? '',
    impliedRoleName: target?.office.impliedRoleName ?? null,
    seat: target?.seat ?? null,
    onEnded: onClose,
  });
  const shown = form.seat;

  if (shown === null || target === null) {
    return null;
  }

  const dateField = (
    <KkDateField
      name="endedOn"
      label={DATE_LABEL}
      value={form.endedOn}
      onChange={form.setEndedOn}
      hint={DATE_HINT}
    />
  );

  return (
    <KkConfirmDialog
      open
      onClose={onClose}
      onConfirm={form.submit}
      tone="danger"
      eyebrow={EYEBROW}
      question={toEndSeatQuestion(shown.firstName, target.office.name)}
      explanation={toEndSeatExplanation(shown.firstName)}
      fields={dateField}
      facts={toEndSeatFacts(shown, target.office.name, form.endedOn)}
      consequence={form.consequence ?? undefined}
      error={form.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={form.isSaving}
    />
  );
};
