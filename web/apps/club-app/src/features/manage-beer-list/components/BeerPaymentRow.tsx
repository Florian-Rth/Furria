import { KkPourTabLine } from '@furria/ui/KkPourTabLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerPaymentUndoMutation } from '../api';
import { cratesLabel, euroOf, firstNameOf, paymentUndoConfirmOf } from '../beer-hub-copy';
import { clockOf, shortDateOf } from '../beer-time';
import type { BeerJournalPayment } from '../schemas';
import { BeerUndoButton } from './BeerUndoButton';

interface BeerPaymentRowProps {
  payment: BeerJournalPayment;
}

export const BeerPaymentRow: FC<BeerPaymentRowProps> = ({ payment }) => {
  const undoing = useBeerPaymentUndoMutation();
  const confirm = paymentUndoConfirmOf(payment.crates);
  const text = `zahlt ${cratesLabel(payment.crates)} · ${clockOf(payment.bookedAt)}`;
  const note = payment.bookedBy === null ? null : `gebucht von ${firstNameOf(payment.bookedBy)}`;
  const undo = (): void => {
    undoing.mutate(payment.beerPaymentId);
  };

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <KkPourTabLine
        date={shortDateOf(payment.bookedAt)}
        text={text}
        note={note}
        amount={euroOf(payment.amountCents)}
        state="paid"
        sx={{ flex: 1, minWidth: 0 }}
      />
      <BeerUndoButton confirm={confirm} busy={undoing.isPending} onConfirm={undo} />
    </Stack>
  );
};
