import type { KkTabFigureSize } from '@furria/ui/KkTabFigure';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import { OPEN_TOTAL_LABEL } from '../booking-copy';
import type { BeerBookingCelebration } from '../use-beer-booking';

interface BeerOpenTotalProps {
  openCents: number;
  celebration: BeerBookingCelebration;
  detail?: string;
  attention?: string | null;
  size?: KkTabFigureSize;
  sx?: KkSx;
}

export const BeerOpenTotal: FC<BeerOpenTotalProps> = ({
  openCents,
  celebration,
  detail,
  attention = null,
  size = 'medium',
  sx,
}) => {
  const amount = formatEuroCents(openCents);

  return (
    <KkTabFigure
      label={OPEN_TOTAL_LABEL}
      value={amount}
      detail={detail}
      attention={attention}
      settled={openCents === 0}
      size={size}
      roll={celebration}
      sx={sx}
    />
  );
};
