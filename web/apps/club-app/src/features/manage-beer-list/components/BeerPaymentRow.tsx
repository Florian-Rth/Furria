import { KkPourTabLine } from '@furria/ui/KkPourTabLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerPaymentUndoMutation } from '../api';
import { euroOf, paymentLineTextOf, paymentNoteOf, paymentUndoConfirmOf } from '../beer-hub-copy';
import { shortDateOf } from '../beer-time';
import type { BeerJournalPayment } from '../schemas';
import { BeerUndoButton } from './BeerUndoButton';

interface BeerPaymentRowProps {
  payment: BeerJournalPayment;
}

export const BeerPaymentRow: FC<BeerPaymentRowProps> = ({ payment }) => {
  const undoing = useBeerPaymentUndoMutation();
  const confirm = paymentUndoConfirmOf(payment.crates);
  const date = shortDateOf(payment.bookedAt);
  const text = paymentLineTextOf(payment);
  const note = paymentNoteOf(payment);
  const amount = euroOf(payment.amountCents);
  const undo = (): void => {
    undoing.mutate(payment.beerPaymentId);
  };

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <KkPourTabLine
        date={date}
        text={text}
        note={note}
        amount={amount}
        state="paid"
        sx={{ flex: 1, minWidth: 0 }}
      />
      <BeerUndoButton confirm={confirm} busy={undoing.isPending} onConfirm={undo} />
    </Stack>
  );
};
