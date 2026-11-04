import { KkAlert } from '@furria/ui/KkAlert';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkLedgerFoot } from '@furria/ui/KkLedgerFoot';
import { KkLedgerStepper } from '@furria/ui/KkLedgerStepper';
import { KkLedgerUndoBar } from '@furria/ui/KkLedgerUndoBar';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import type { LedgerBooking } from '../hooks/use-ledger-booking';
import {
  crateUnit,
  EMPTY_STOCK,
  FOOT_LABEL,
  footLine,
  HOLD_CONFIRM,
  HOLD_HINT,
  holdLabel,
  LESS_LABEL,
  MORE_LABEL,
  UNDO_LABEL,
  undoDetail,
  undoMessage,
} from '../ledger-copy';

interface LedgerBookFootProps {
  booking: LedgerBooking;
  onBook: () => void;
}

export const LedgerBookFoot: FC<LedgerBookFootProps> = ({ booking, onBook }) => {
  const { undo } = booking;

  if (undo !== null) {
    const message = undoMessage(undo.count, undo.sum);
    const detail = undoDetail(undo.after);

    return (
      <KkLedgerUndoBar
        message={message}
        detail={detail}
        actionLabel={UNDO_LABEL}
        seconds={undo.seconds}
        durationMs={UNDO_WINDOW_MS}
        startKey={undo.startKey}
        onUndo={booking.undoBooking}
      />
    );
  }

  if (booking.stance === 'empty') {
    return (
      <KkLedgerFoot label={FOOT_LABEL}>
        <KkText variant="body2">{EMPTY_STOCK}</KkText>
      </KkLedgerFoot>
    );
  }

  const label = holdLabel(booking.sum);
  const unit = crateUnit(booking.count);
  const line = footLine(booking.count, booking.price, booking.after);
  const refusal =
    booking.refusal === null ? null : <KkAlert severity="warning">{booking.refusal}</KkAlert>;

  return (
    <KkLedgerFoot label={FOOT_LABEL}>
      {refusal}
      <KkText variant="caption" tone="secondary" sx={{ textAlign: 'right' }}>
        {line}
      </KkText>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <KkLedgerStepper
          value={booking.count}
          min={1}
          max={booking.limit}
          unit={unit}
          lessLabel={LESS_LABEL}
          moreLabel={MORE_LABEL}
          onChange={booking.setCount}
        />
        <KkHoldButton
          label={label}
          hint={HOLD_HINT}
          confirm={HOLD_CONFIRM}
          onCommit={onBook}
          sx={{ flex: 1 }}
        />
      </Stack>
    </KkLedgerFoot>
  );
};
