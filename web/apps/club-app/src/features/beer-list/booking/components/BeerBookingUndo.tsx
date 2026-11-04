import type { KkTabUndoVariant } from '@furria/ui/KkTabUndo';
import { KkTabUndo } from '@furria/ui/KkTabUndo';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { bookedDetail, bookedTitle, UNDO_LABEL } from '../booking-copy';
import { UNDO_WINDOW_MS } from '../booking-window';
import type { BeerBookingUndoing } from '../use-beer-booking';

interface BeerBookingUndoProps {
  booking: BeerBookingUndoing;
  variant?: KkTabUndoVariant;
}

export const BeerBookingUndo: FC<BeerBookingUndoProps> = ({ booking, variant = 'strip' }) => {
  const title = bookedTitle(booking.lastCount);
  const detail = bookedDetail(formatEuroCents(booking.lastCents));

  return (
    <KkTabUndo
      variant={variant}
      title={title}
      detail={detail}
      undoLabel={UNDO_LABEL}
      remainingMs={booking.remainingMs}
      windowMs={UNDO_WINDOW_MS}
      onUndo={booking.undo}
    />
  );
};
