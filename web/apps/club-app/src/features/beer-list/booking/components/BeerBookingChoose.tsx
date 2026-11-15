import type { KkTabCountSize } from '@furria/ui/KkTabCount';
import { KkTabCount } from '@furria/ui/KkTabCount';
import { KkTabHold } from '@furria/ui/KkTabHold';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  bookConfirm,
  bookLabel,
  COUNT_LABEL,
  countCaption,
  cratesLabel,
  HOLD_HINT,
  PICK_DRINK_LABEL,
} from '../booking-copy';
import { BEER_COUNTS } from '../booking-window';
import type { BeerBookingChoosing } from '../use-beer-booking';

const DIRECTIONS: Record<KkTabCountSize, 'row' | 'column'> = { medium: 'row', large: 'column' };
const COUNT_SX: Record<KkTabCountSize, { flex?: string }> = {
  medium: { flex: '0 0 40%' },
  large: {},
};
const HOLD_SX = { flex: 1 } as const;

const OPTIONS = BEER_COUNTS.map((value) => ({
  value,
  label: cratesLabel(value),
  caption: countCaption(value),
}));

interface BeerBookingChooseProps {
  booking: BeerBookingChoosing;
  size?: KkTabCountSize;
}

export const BeerBookingChoose: FC<BeerBookingChooseProps> = ({ booking, size = 'medium' }) => {
  const drinkName = booking.drink?.name ?? '';
  const confirm = bookConfirm(booking.count, drinkName);
  const holdLabel = booking.drink === null ? PICK_DRINK_LABEL : bookLabel(booking.count);
  const holdDisabled = booking.isBooking || booking.drink === null;

  return (
    <Stack direction={DIRECTIONS[size]} sx={{ gap: 1, minWidth: 0 }}>
      <KkTabCount
        label={COUNT_LABEL}
        options={OPTIONS}
        value={booking.count}
        onChange={booking.chooseCount}
        size={size}
        sx={COUNT_SX[size]}
      />
      <KkTabHold
        label={holdLabel}
        hint={HOLD_HINT}
        confirm={confirm}
        size={size}
        disabled={holdDisabled}
        onCommit={booking.book}
        sx={HOLD_SX}
      />
    </Stack>
  );
};
