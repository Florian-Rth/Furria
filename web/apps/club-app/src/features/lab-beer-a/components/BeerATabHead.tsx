import type { KkTabDiscSize } from '@furria/ui/KkTabDisc';
import { KkTabDisc } from '@furria/ui/KkTabDisc';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf, openDaysOf, REMINDER_AFTER_DAYS } from '@/features/lab-beer/beer-lab-ledger';
import {
  allPaidDetail,
  discLabel,
  NOTHING_OPEN,
  OPEN_LABEL,
  openSinceLabel,
  tabDetailLabel,
} from '../beer-a-copy';
import { shortDayOf } from '../beer-a-format';
import type { BeerAMember } from '../hooks/use-beer-member-a';

interface BeerATabHeadProps {
  member: BeerAMember;
  discSize: KkTabDiscSize;
}

export const BeerATabHead: FC<BeerATabHeadProps> = ({ member, discSize }) => {
  const { tab, now } = member;
  const openDays = openDaysOf(tab.oldestOpenAt, now);
  const attention =
    openDays !== null && openDays >= REMINDER_AFTER_DAYS ? openSinceLabel(openDays) : null;
  const settled = tab.openCount === 0;
  const value = settled ? NOTHING_OPEN : euroOf(tab.openCents);
  const detail =
    tab.oldestOpenAt === null
      ? allPaidDetail(tab.paidCount)
      : tabDetailLabel(tab.openCount, shortDayOf(tab.oldestOpenAt));

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}>
      <KkTabDisc
        strokes={member.strokes}
        label={discLabel(tab.openCount, tab.paidCount)}
        size={discSize}
        drawKey={member.drawKey}
        burstKey={member.drawKey}
      />
      <KkTabFigure
        label={OPEN_LABEL}
        value={value}
        detail={detail}
        attention={attention}
        settled={settled}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
};
