import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import { KkTabFigure } from '@furria/ui/KkTabFigure';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import {
  FILTER_LABEL,
  FILTER_OPEN,
  FILTER_OVERDUE,
  peopleCount,
  TOTAL_OPEN,
  totalDetail,
} from '../beer-a-copy';
import type { BeerAQueueCounts, BeerAQueueFilter } from '../beer-a-queue';

interface BeerHubASummaryProps {
  counts: BeerAQueueCounts;
  filter: BeerAQueueFilter;
  onFilter: (filter: string) => void;
}

export const BeerHubASummary: FC<BeerHubASummaryProps> = ({ counts, filter, onFilter }) => {
  const items = [
    {
      id: 'open',
      label: FILTER_OPEN,
      icon: 'fees' as const,
      count: counts.open,
      countLabel: peopleCount(counts.open),
    },
    {
      id: 'overdue',
      label: FILTER_OVERDUE,
      icon: 'clock' as const,
      count: counts.overdue,
      countLabel: peopleCount(counts.overdue),
      severity: counts.overdue > 0 ? ('hint' as const) : null,
    },
  ];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ gap: 1.5, alignItems: { sm: 'flex-end' }, minWidth: 0 }}
    >
      <KkTabFigure
        label={TOTAL_OPEN}
        value={euroOf(counts.cents)}
        detail={totalDetail(counts.open, counts.overdue)}
        size="small"
        sx={{ flex: 1 }}
      />
      <KkSegmentSwitch
        label={FILTER_LABEL}
        items={items}
        value={filter}
        onChange={onFilter}
        sx={{ flex: { sm: '0 0 auto' } }}
      />
    </Stack>
  );
};
