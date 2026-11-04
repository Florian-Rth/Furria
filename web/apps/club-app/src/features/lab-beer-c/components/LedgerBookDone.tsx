import { KkButton } from '@furria/ui/KkButton';
import type { KkLedgerReceiptLine } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerReceipt } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerStatus } from '@furria/ui/KkLedgerStatus';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { LedgerDone } from '../hooks/use-ledger-booking';
import {
  DONE_AGAIN,
  DONE_OPEN,
  DONE_TITLE,
  doneTime,
  RECEIPT_LABEL,
  receiptPrice,
} from '../ledger-copy';

interface LedgerBookDoneProps {
  done: LedgerDone;
  price: string;
  canAgain: boolean;
  payment: ReactNode;
  onAgain: () => void;
}

export const LedgerBookDone: FC<LedgerBookDoneProps> = ({
  done,
  price,
  canAgain,
  payment,
  onAgain,
}) => {
  const status = `${DONE_TITLE} ${doneTime(done.time)}`;
  const lines: readonly KkLedgerReceiptLine[] = [
    { key: 'sum', label: receiptPrice(done.count, price), value: done.sum },
    { key: 'open', label: DONE_OPEN, value: done.after, total: true },
  ];
  const again = canAgain ? (
    <KkButton variant="text" onClick={onAgain}>
      {DONE_AGAIN}
    </KkButton>
  ) : null;

  return (
    <Stack sx={{ flex: 1, justifyContent: 'space-between', gap: 3, minWidth: 0 }}>
      <Stack sx={{ gap: 2.5, minWidth: 0 }}>
        <KkLedgerStatus state="done" text={status} />
        <KkLedgerReceipt label={RECEIPT_LABEL} lines={lines} />
        {payment}
      </Stack>
      {again}
    </Stack>
  );
};
