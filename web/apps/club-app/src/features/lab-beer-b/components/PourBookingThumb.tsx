import { KkButton } from '@furria/ui/KkButton';
import { KkHoldButton } from '@furria/ui/KkHoldButton';
import { KkPourDrain } from '@furria/ui/KkPourDrain';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import type { PourBooking } from '../hooks/use-pour-booking';
import {
  AGAIN_LABEL,
  BOOK_HINT,
  confirmOf,
  DECLARE_HOLD_NOTE,
  holdLabelOf,
  UNDO_LABEL,
  UNDO_LINE,
} from '../pour-booking-copy';

interface PourBookingThumbProps {
  booking: PourBooking;
  owner: string;
}

export const PourBookingThumb: FC<PourBookingThumbProps> = ({ booking, owner }) => {
  if (booking.phase === 'booked' && booking.pending !== null) {
    return (
      <Stack sx={{ gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <KkText variant="body2" tone="secondary" sx={{ flex: 1 }}>
            {UNDO_LINE}
          </KkText>
          <KkButton variant="outlined" size="large" onClick={booking.undo}>
            {UNDO_LABEL}
          </KkButton>
        </Stack>
        <KkPourDrain runKey={booking.pending.runKey} durationMs={UNDO_WINDOW_MS} />
      </Stack>
    );
  }

  if (booking.phase !== 'pick') {
    return (
      <KkButton variant="outlined" size="large" fullWidth onClick={booking.again}>
        {AGAIN_LABEL}
      </KkButton>
    );
  }

  if (booking.stage === 'empty') {
    return null;
  }

  const declare = booking.stage === 'declare';
  const label = holdLabelOf(booking.count, declare);
  const confirm = confirmOf(booking.count, declare, owner);
  const note = booking.message ?? (declare ? DECLARE_HOLD_NOTE : null);
  const noteLine =
    note === null ? null : (
      <KkText variant="caption" tone="secondary" sx={{ textAlign: 'center' }}>
        {note}
      </KkText>
    );

  return (
    <Stack sx={{ gap: 1 }}>
      {noteLine}
      <KkHoldButton label={label} hint={BOOK_HINT} confirm={confirm} onCommit={booking.book} />
    </Stack>
  );
};
