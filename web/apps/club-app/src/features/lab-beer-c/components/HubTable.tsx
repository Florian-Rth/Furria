import { KkButton } from '@furria/ui/KkButton';
import type { KkLedgerPersonHeadCells } from '@furria/ui/KkLedgerPersonHead';
import { KkLedgerPersonHead } from '@furria/ui/KkLedgerPersonHead';
import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import { KkText } from '@furria/ui/KkText';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  FILTER_LABELS,
  SHOW_ALL,
  SORT_LABEL,
  SORT_NAME,
  SORT_OLDEST,
  SORT_OPEN,
  TABLE_EMPTY,
  TABLE_HEAD,
  TABLE_LABEL,
} from '../ledger-copy';
import type { HubFilter, HubSort, PersonLine } from '../ledger-hub';
import { HubPersonRow } from './HubPersonRow';

const SORT_ITEMS: readonly KkSegmentSwitchItem[] = [
  { id: 'open', label: SORT_OPEN, icon: 'fees', count: null, countLabel: '' },
  { id: 'oldest', label: SORT_OLDEST, icon: 'clock', count: null, countLabel: '' },
  { id: 'name', label: SORT_NAME, icon: 'person', count: null, countLabel: '' },
];

const HEAD_CELLS: KkLedgerPersonHeadCells = {
  name: { id: 'name', label: TABLE_HEAD.name, sortable: true },
  count: { id: 'count', label: TABLE_HEAD.count, sortable: false },
  amount: { id: 'open', label: TABLE_HEAD.amount, sortable: true },
  oldest: { id: 'oldest', label: TABLE_HEAD.oldest, sortable: true },
  paid: { id: 'paid', label: TABLE_HEAD.paid, sortable: false },
};

interface HubTableProps {
  rows: readonly PersonLine[];
  filter: HubFilter;
  sort: HubSort;
  selectedId: number | null;
  onSort: (sort: string) => void;
  onClearFilter: () => void;
  onOpen: (personId: number) => void;
}

export const HubTable: FC<HubTableProps> = ({
  rows,
  filter,
  sort,
  selectedId,
  onSort,
  onClearFilter,
  onOpen,
}) => {
  const filterLine =
    filter === 'all' ? null : (
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <KkText variant="caption" tone="secondary">
          {FILTER_LABELS[filter]}
        </KkText>
        <KkButton variant="text" size="small" onClick={onClearFilter}>
          {SHOW_ALL}
        </KkButton>
      </Stack>
    );
  const items = rows.map((line) => {
    const selected = line.person.id === selectedId;

    return <HubPersonRow key={line.person.id} line={line} selected={selected} onOpen={onOpen} />;
  });
  const list =
    rows.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {TABLE_EMPTY}
      </KkText>
    ) : (
      <Box component="ul" aria-label={TABLE_LABEL} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {items}
      </Box>
    );

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      {filterLine}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <KkSegmentSwitch label={SORT_LABEL} items={SORT_ITEMS} value={sort} onChange={onSort} />
      </Box>
      <Stack sx={{ minWidth: 0 }}>
        <KkLedgerPersonHead label={SORT_LABEL} cells={HEAD_CELLS} sort={sort} onSort={onSort} />
        {list}
      </Stack>
    </Stack>
  );
};
