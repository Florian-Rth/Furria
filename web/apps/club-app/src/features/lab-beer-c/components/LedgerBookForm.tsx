import { KkAlert } from '@furria/ui/KkAlert';
import { KkConfettiBurst } from '@furria/ui/KkConfettiBurst';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import type { KkLedgerReceiptLine } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerReceipt } from '@furria/ui/KkLedgerReceipt';
import { KkLedgerRoll } from '@furria/ui/KkLedgerRoll';
import { KkLedgerStepper } from '@furria/ui/KkLedgerStepper';
import { KkLedgerTotal } from '@furria/ui/KkLedgerTotal';
import { KkLedgerUndoBar } from '@furria/ui/KkLedgerUndoBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import type { LedgerBooking } from '../hooks/use-ledger-booking';
import {
  crateUnit,
  DONE_OPEN,
  FIGURE_OPEN,
  HOLD_CONFIRM,
  HOLD_HINT,
  holdLabel,
  LESS_LABEL,
  MORE_LABEL,
  RECEIPT_AFTER,
  RECEIPT_LABEL,
  receiptPrice,
  UNDO_LABEL,
  undoDetail,
  undoMessage,
} from '../ledger-copy';

const CONFETTI_COUNT = 40;

interface LedgerBookFormProps {
  booking: LedgerBooking;
  fireKey: number;
}

export const LedgerBookForm: FC<LedgerBookFormProps> = ({ booking, fireKey }) => {
  const { undo } = booking;
  const roll = <KkLedgerRoll value={booking.open} spin={booking.spin} stamp={booking.stamp} />;
  const shownCount = undo === null ? booking.count : undo.count;
  const minCount = undo === null ? 1 : undo.count;
  const maxCount = undo === null ? booking.limit : undo.count;
  const unit = crateUnit(shownCount);
  const lines: readonly KkLedgerReceiptLine[] = [
    {
      key: 'price',
      label: receiptPrice(shownCount, booking.price),
      value: undo === null ? booking.sum : undo.sum,
    },
    {
      key: 'after',
      label: undo === null ? RECEIPT_AFTER : DONE_OPEN,
      value: undo === null ? booking.after : undo.after,
      total: true,
    },
  ];
  const label = holdLabel(booking.sum);
  const refusal =
    booking.refusal === null ? null : <KkAlert severity="warning">{booking.refusal}</KkAlert>;
  const undoMessageText = undo === null ? '' : undoMessage(undo.count, undo.sum);
  const undoDetailText = undo === null ? '' : undoDetail(undo.after);
  const action =
    undo === null ? (
      <KkHoldButton label={label} hint={HOLD_HINT} confirm={HOLD_CONFIRM} onCommit={booking.book} />
    ) : (
      <KkLedgerUndoBar
        message={undoMessageText}
        detail={undoDetailText}
        actionLabel={UNDO_LABEL}
        seconds={undo.seconds}
        durationMs={UNDO_WINDOW_MS}
        startKey={undo.startKey}
        onUndo={booking.undoBooking}
      />
    );
  const chooser = (
    <Stack sx={{ alignItems: 'center', gap: 2 }}>
      <KkLedgerStepper
        size="large"
        value={shownCount}
        min={minCount}
        max={maxCount}
        unit={unit}
        lessLabel={LESS_LABEL}
        moreLabel={MORE_LABEL}
        onChange={booking.setCount}
      />
      <KkLedgerReceipt label={RECEIPT_LABEL} lines={lines} sx={{ alignSelf: 'stretch' }} />
    </Stack>
  );

  return (
    <Stack sx={{ flex: 1, justifyContent: 'space-between', gap: 3, minWidth: 0 }}>
      <Stack sx={{ gap: 3.5, minWidth: 0 }}>
        <Box sx={{ position: 'relative' }}>
          <KkLedgerTotal label={FIGURE_OPEN} value={roll} />
          <Box sx={{ position: 'absolute', left: '50%', top: '55%' }}>
            <KkConfettiBurst fireKey={fireKey} count={CONFETTI_COUNT} alwaysPlays />
          </Box>
        </Box>
        {chooser}
      </Stack>
      <Stack sx={{ gap: 1 }}>
        {refusal}
        {action}
      </Stack>
    </Stack>
  );
};
