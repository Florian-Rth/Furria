import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { openDetail, openSinceLabel, settledDetail } from '../beer-list-copy';
import { shortDayOf } from '../beer-list-format';
import type { BeerTabTotals } from '../beer-tab';
import { openDaysOf, REMINDER_AFTER_DAYS } from '../beer-tab';
import { BeerOpenTotal } from '../booking/components/BeerOpenTotal';
import { BeerTallyDisc } from '../booking/components/BeerTallyDisc';
import type { BeerBookingCelebration } from '../booking/use-beer-booking';

const TOTAL_SX = { flex: 1 } as const;

interface BeerListHeadProps {
  totals: BeerTabTotals;
  strokes: readonly KkTabStrokeState[];
  celebration: BeerBookingCelebration;
  now: number;
}

const attentionOf = (oldestOpenAt: string | null, now: number): string | null => {
  if (oldestOpenAt === null) {
    return null;
  }

  const days = openDaysOf(oldestOpenAt, now);

  return days >= REMINDER_AFTER_DAYS ? openSinceLabel(days) : null;
};

export const BeerListHead: FC<BeerListHeadProps> = ({ totals, strokes, celebration, now }) => {
  const detail =
    totals.oldestOpenAt === null
      ? settledDetail(totals.paidCount)
      : openDetail(totals.openCount, shortDayOf(totals.oldestOpenAt));
  const attention = attentionOf(totals.oldestOpenAt, now);

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}>
      <BeerTallyDisc strokes={strokes} totals={totals} drawKey={celebration.spin} />
      <BeerOpenTotal
        openCents={totals.openCents}
        celebration={celebration}
        detail={detail}
        attention={attention}
        sx={TOTAL_SX}
      />
    </Stack>
  );
};
